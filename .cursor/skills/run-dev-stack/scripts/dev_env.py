#!/usr/bin/env python3
"""Detect cloud vs local and write web/mobile env for Google login.

Web calls the API through the Next.js rewrite (`OURS_API_ORIGIN`) so the
session cookie stays on the origin the user opened. The phone talks to the
API directly, so its base URL must be an address the device can reach.
"""

from __future__ import annotations

import argparse
import json
import os
import re
import socket
import subprocess
import sys
from pathlib import Path

WEB_CLIENT_FALLBACK = (
    "385042091210-d3mrb52t2jpb742oi63itqa9ucdvet46.apps.googleusercontent.com"
)
ANDROID_CLIENT_FALLBACK = (
    "385042091210-82kbq930idslpbl4p488rc6eqaor9tqp.apps.googleusercontent.com"
)

API_PORT = 5280
WEB_PORT = 3000


def repo_root_from_here() -> Path:
    return Path(__file__).resolve().parents[4]


def is_cloud_runtime(env: dict[str, str] | None = None, exec_daemon: bool | None = None) -> bool:
    env = os.environ if env is None else env
    override = env.get("OURS_DEV_RUNTIME", "").strip().lower()
    if override in {"cloud", "local"}:
        return override == "cloud"
    if exec_daemon is None:
        exec_daemon = Path("/exec-daemon").is_dir()
    if exec_daemon:
        return True
    cgroup = env.get("CURSOR_WORKLOAD_CGROUP", "")
    return "cursor-agent/workload" in cgroup


def parse_addresses(raw: str) -> list[str]:
    found = re.findall(r"\b(?:\d{1,3}\.){3}\d{1,3}\b", raw)
    unique: list[str] = []
    for item in found:
        if item not in unique:
            unique.append(item)
    return unique


def rank_lan_ip(ip: str) -> int:
    if ip.startswith("127.") or ip == "0.0.0.0":
        return 100
    if ip.startswith("169.254."):
        return 90
    if ip.startswith("172.17."):
        return 80
    if ip.startswith("192.168."):
        return 0
    if ip.startswith("10."):
        return 1
    if ip.startswith("172."):
        return 2
    return 3


def pick_lan_ip(addresses: list[str]) -> str | None:
    usable = [ip for ip in addresses if rank_lan_ip(ip) < 50]
    if not usable:
        return None
    return sorted(usable, key=rank_lan_ip)[0]


def read_host_addresses() -> list[str]:
    raw = ""
    try:
        raw = subprocess.check_output(["hostname", "-I"], text=True, stderr=subprocess.DEVNULL)
    except (OSError, subprocess.CalledProcessError):
        raw = ""
    addresses = parse_addresses(raw)
    if addresses:
        return addresses
    try:
        hostname = socket.gethostname()
        addresses = parse_addresses(socket.gethostbyname(hostname))
    except OSError:
        return []
    return addresses


def load_google_ids(appsettings: Path) -> tuple[str, str]:
    web_id = WEB_CLIENT_FALLBACK
    android_id = ANDROID_CLIENT_FALLBACK
    if not appsettings.is_file():
        return web_id, android_id
    try:
        data = json.loads(appsettings.read_text(encoding="utf-8"))
    except json.JSONDecodeError:
        return web_id, android_id
    google = data.get("Authentication", {}).get("Google", {})
    if isinstance(google, dict):
        client = str(google.get("ClientId") or "").strip()
        android = str(google.get("AndroidClientId") or "").strip()
        if client:
            web_id = client
        if android:
            android_id = android
    return web_id, android_id


def read_env(path: Path) -> dict[str, str]:
    if not path.is_file():
        return {}
    values: dict[str, str] = {}
    for line in path.read_text(encoding="utf-8").splitlines():
        stripped = line.strip()
        if not stripped or stripped.startswith("#") or "=" not in stripped:
            continue
        key, value = stripped.split("=", 1)
        values[key.strip()] = value
    return values


def write_env(path: Path, values: dict[str, str], header: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    lines = [header.rstrip(), ""]
    for key, value in values.items():
        lines.append(f"{key}={value}")
    lines.append("")
    path.write_text("\n".join(lines), encoding="utf-8")


def build_plan(
    *,
    runtime: str,
    lan_ip: str | None,
    web_client_id: str,
    android_client_id: str,
    api_public_base: str | None,
    web_public_base: str | None,
    existing_mobile: dict[str, str],
) -> dict:
    api_origin = f"http://127.0.0.1:{API_PORT}"
    if runtime == "local":
        if not lan_ip:
            raise SystemExit(
                "Não achei um IP de rede local. Conecte o Wi-Fi ou exporte OURS_LAN_IP."
            )
        web_origin = f"http://localhost:{WEB_PORT}"
        mobile_api = f"http://{lan_ip}:{API_PORT}/api"
        invite = f"http://{lan_ip}:{WEB_PORT}/join"
        web_open = web_origin
    else:
        web_open = (web_public_base or "").rstrip("/")
        api_base = (api_public_base or "").rstrip("/")
        mobile_api = f"{api_base}/api" if api_base else ""
        invite = f"{web_open}/join" if web_open else ""

    mobile = {
        "EXPO_PUBLIC_API_URL": mobile_api,
        "EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID": web_client_id,
        "EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID": android_client_id,
        "EXPO_PUBLIC_INVITE_BASE_URL": invite,
    }
    ios_id = existing_mobile.get("EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID", "").strip()
    if ios_id:
        mobile["EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID"] = ios_id

    web = {
        "OURS_API_ORIGIN": api_origin,
        "NEXT_PUBLIC_API_URL": "",
        "NEXT_PUBLIC_APP_URL": web_open or f"http://localhost:{WEB_PORT}",
        "NEXT_PUBLIC_INVITE_BASE_URL": (web_open or f"http://localhost:{WEB_PORT}").rstrip("/"),
        "NEXT_PUBLIC_GOOGLE_CLIENT_ID": web_client_id,
    }

    google_origin = web_open or f"http://localhost:{WEB_PORT}"
    return {
        "runtime": runtime,
        "lanIp": lan_ip,
        "apiOrigin": api_origin,
        "webOpenUrl": google_origin,
        "loginPath": f"{google_origin}/login",
        "mobileApiUrl": mobile_api,
        "inviteBaseUrl": invite,
        "googleJavaScriptOrigin": google_origin,
        "webClientId": web_client_id,
        "androidClientId": android_client_id,
        "webEnv": web,
        "mobileEnv": mobile,
        "metro": {
            "command": (
                "npx expo start --dev-client --tunnel --port 8081 --clear"
                if runtime == "cloud"
                else "npx expo start --dev-client --host lan --port 8081 --clear"
            ),
            "hostMode": "tunnel" if runtime == "cloud" else "lan",
        },
    }


def apply_plan(root: Path, plan: dict) -> None:
    write_env(
        root / "web" / ".env.local",
        plan["webEnv"],
        "# Gerado por run-dev-stack. Não commitar.",
    )
    mobile_env = {key: value for key, value in plan["mobileEnv"].items() if value}
    # Keep the API key even when cloud tunnels are not ready yet, so a stale
    # localhost value cannot survive into the next Metro bundle.
    mobile_env["EXPO_PUBLIC_API_URL"] = plan["mobileEnv"].get("EXPO_PUBLIC_API_URL", "")
    mobile_env["EXPO_PUBLIC_INVITE_BASE_URL"] = plan["mobileEnv"].get("EXPO_PUBLIC_INVITE_BASE_URL", "")
    write_env(
        root / "mobile" / ".env.local",
        mobile_env,
        "# Gerado por run-dev-stack. Não commitar.",
    )


def prepare(root: Path, args: argparse.Namespace) -> dict:
    runtime = "cloud" if is_cloud_runtime() else "local"
    if args.runtime:
        runtime = args.runtime
    addresses = read_host_addresses()
    lan_ip = args.lan_ip or os.environ.get("OURS_LAN_IP") or pick_lan_ip(addresses)
    web_id, android_id = load_google_ids(root / "server" / "src" / "ProjectOurs.API" / "appsettings.json")
    existing_mobile = read_env(root / "mobile" / ".env.local")
    plan = build_plan(
        runtime=runtime,
        lan_ip=lan_ip,
        web_client_id=web_id,
        android_client_id=android_id,
        api_public_base=args.api_public_base or os.environ.get("OURS_API_PUBLIC_BASE"),
        web_public_base=args.web_public_base or os.environ.get("OURS_WEB_PUBLIC_BASE"),
        existing_mobile=existing_mobile,
    )
    plan["hostAddresses"] = addresses
    if not args.dry_run:
        apply_plan(root, plan)
        if plan["runtime"] == "cloud" and not plan["mobileApiUrl"]:
            raise SystemExit(
                "Runtime cloud sem URL pública da API. Suba os túneis e rode de novo com "
                "--api-public-base e --web-public-base."
            )
    return plan


def main() -> int:
    parser = argparse.ArgumentParser(description="Prepare Project Ours dev env for web + device.")
    parser.add_argument("--root", type=Path, default=None)
    parser.add_argument("--runtime", choices=("local", "cloud"))
    parser.add_argument("--lan-ip")
    parser.add_argument("--api-public-base", help="https://<tunnel> sem /api")
    parser.add_argument("--web-public-base", help="https://<tunnel> sem path")
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()
    root = (args.root or repo_root_from_here()).resolve()
    plan = prepare(root, args)
    json.dump(plan, sys.stdout, indent=2, ensure_ascii=False)
    sys.stdout.write("\n")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
