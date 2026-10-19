#!/usr/bin/env python3
"""Proofs for run-dev-stack address and env selection."""

from __future__ import annotations

import json
import sys
import tempfile
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

import dev_env


class RuntimeTests(unittest.TestCase):
    def test_exec_daemon_is_cloud(self) -> None:
        self.assertTrue(dev_env.is_cloud_runtime(env={}, exec_daemon=True))

    def test_workload_cgroup_is_cloud(self) -> None:
        env = {"CURSOR_WORKLOAD_CGROUP": "/sys/fs/cgroup/cursor-agent/workload"}
        self.assertTrue(dev_env.is_cloud_runtime(env=env, exec_daemon=False))

    def test_plain_machine_is_local(self) -> None:
        self.assertFalse(dev_env.is_cloud_runtime(env={"CURSOR_AGENT": "1"}, exec_daemon=False))

    def test_override_wins(self) -> None:
        self.assertFalse(
            dev_env.is_cloud_runtime(
                env={"OURS_DEV_RUNTIME": "local"},
                exec_daemon=True,
            )
        )


class LanTests(unittest.TestCase):
    def test_prefers_wifi_over_docker_bridge(self) -> None:
        picked = dev_env.pick_lan_ip(["172.17.0.1", "172.30.0.2", "192.168.1.20"])
        self.assertEqual(picked, "192.168.1.20")

    def test_ignores_loopback_only(self) -> None:
        self.assertIsNone(dev_env.pick_lan_ip(["127.0.0.1", "172.17.0.1"]))


class PlanTests(unittest.TestCase):
    def test_local_web_is_same_origin_and_phone_uses_lan(self) -> None:
        plan = dev_env.build_plan(
            runtime="local",
            lan_ip="192.168.1.20",
            web_client_id="web.apps.googleusercontent.com",
            android_client_id="android.apps.googleusercontent.com",
            api_public_base=None,
            web_public_base=None,
            existing_mobile={"EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID": "ios-client"},
        )
        self.assertEqual(plan["webEnv"]["OURS_API_ORIGIN"], "http://127.0.0.1:5280")
        self.assertEqual(plan["webEnv"]["NEXT_PUBLIC_API_URL"], "")
        self.assertEqual(plan["webEnv"]["NEXT_PUBLIC_GOOGLE_CLIENT_ID"], "web.apps.googleusercontent.com")
        self.assertEqual(plan["googleJavaScriptOrigin"], "http://localhost:3000")
        self.assertEqual(plan["mobileApiUrl"], "http://192.168.1.20:5280/api")
        self.assertEqual(plan["inviteBaseUrl"], "http://192.168.1.20:3000/join")
        self.assertEqual(plan["mobileEnv"]["EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID"], "ios-client")
        self.assertEqual(plan["mobileEnv"]["EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID"], "android.apps.googleusercontent.com")
        self.assertIn("--host lan", plan["metro"]["command"])
        self.assertIn("--clear", plan["metro"]["command"])

    def test_cloud_uses_public_bases_and_tunnel(self) -> None:
        plan = dev_env.build_plan(
            runtime="cloud",
            lan_ip="172.30.0.2",
            web_client_id="web.apps.googleusercontent.com",
            android_client_id="android.apps.googleusercontent.com",
            api_public_base="https://api.example.trycloudflare.com/",
            web_public_base="https://web.example.trycloudflare.com",
            existing_mobile={},
        )
        self.assertEqual(plan["webEnv"]["OURS_API_ORIGIN"], "http://127.0.0.1:5280")
        self.assertEqual(plan["webEnv"]["NEXT_PUBLIC_API_URL"], "")
        self.assertEqual(plan["mobileApiUrl"], "https://api.example.trycloudflare.com/api")
        self.assertEqual(plan["loginPath"], "https://web.example.trycloudflare.com/login")
        self.assertEqual(plan["googleJavaScriptOrigin"], "https://web.example.trycloudflare.com")
        self.assertNotIn("172.30.0.2", plan["mobileApiUrl"])
        self.assertIn("--tunnel", plan["metro"]["command"])

    def test_cloud_without_tunnels_leaves_mobile_api_empty(self) -> None:
        plan = dev_env.build_plan(
            runtime="cloud",
            lan_ip=None,
            web_client_id="web.apps.googleusercontent.com",
            android_client_id="android.apps.googleusercontent.com",
            api_public_base=None,
            web_public_base=None,
            existing_mobile={},
        )
        self.assertEqual(plan["mobileApiUrl"], "")

    def test_apply_preserves_ios_client_and_reads_appsettings(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            api = root / "server" / "src" / "ProjectOurs.API"
            api.mkdir(parents=True)
            (api / "appsettings.json").write_text(
                json.dumps(
                    {
                        "Authentication": {
                            "Google": {
                                "ClientId": "from-appsettings.apps.googleusercontent.com",
                                "AndroidClientId": "android-from-appsettings.apps.googleusercontent.com",
                            }
                        }
                    }
                ),
                encoding="utf-8",
            )
            mobile = root / "mobile"
            mobile.mkdir()
            (mobile / ".env.local").write_text(
                "EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=keep-ios\nEXPO_PUBLIC_API_URL=http://localhost:5280/api\n",
                encoding="utf-8",
            )
            web_id, android_id = dev_env.load_google_ids(api / "appsettings.json")
            plan = dev_env.build_plan(
                runtime="local",
                lan_ip="10.0.0.8",
                web_client_id=web_id,
                android_client_id=android_id,
                api_public_base=None,
                web_public_base=None,
                existing_mobile=dev_env.read_env(mobile / ".env.local"),
            )
            dev_env.apply_plan(root, plan)
            written = (mobile / ".env.local").read_text(encoding="utf-8")
            self.assertIn("EXPO_PUBLIC_API_URL=http://10.0.0.8:5280/api", written)
            self.assertIn("EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=keep-ios", written)
            self.assertIn("from-appsettings.apps.googleusercontent.com", written)
            web_env = (root / "web" / ".env.local").read_text(encoding="utf-8")
            self.assertIn("OURS_API_ORIGIN=http://127.0.0.1:5280", web_env)
            self.assertIn("NEXT_PUBLIC_API_URL=\n", web_env)
            self.assertIn("NEXT_PUBLIC_GOOGLE_CLIENT_ID=from-appsettings.apps.googleusercontent.com", web_env)


if __name__ == "__main__":
    unittest.main()
