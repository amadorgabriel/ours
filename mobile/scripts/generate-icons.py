#!/usr/bin/env python3
"""Regenerate app icons with white/cream safe-zone padding (RF-11 / AD-001)."""

from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
IMAGES = ROOT / "assets" / "images"
SOURCE = IMAGES / "logo-glow.png"
CANVAS = 1024
BG_COLOR = (252, 248, 244, 255)  # #FCF8F4
SAFE_RATIO = 0.58  # logo fits inside ~58% of canvas (Android adaptive safe zone)


def padded_icon(source: Path, size: int, logo_ratio: float) -> Image.Image:
    logo = Image.open(source).convert("RGBA")
    canvas = Image.new("RGBA", (size, size), BG_COLOR)
    max_logo = int(size * logo_ratio)
    logo.thumbnail((max_logo, max_logo), Image.Resampling.LANCZOS)
    x = (size - logo.width) // 2
    y = (size - logo.height) // 2
    canvas.paste(logo, (x, y), logo)
    return canvas


def main() -> None:
    if not SOURCE.exists():
        raise SystemExit(f"Source logo not found: {SOURCE}")

    foreground = padded_icon(SOURCE, CANVAS, SAFE_RATIO)
    foreground.save(IMAGES / "icon.png")
    foreground.save(IMAGES / "android-icon-foreground.png")
    foreground.save(IMAGES / "favicon.png")

    splash = padded_icon(SOURCE, 512, SAFE_RATIO)
    splash.save(IMAGES / "splash-icon.png")

    mono = padded_icon(SOURCE, CANVAS, SAFE_RATIO).convert("L")
    mono.save(IMAGES / "android-icon-monochrome.png")

    # Login / in-app logo (smaller, same padding)
    app_logo = padded_icon(SOURCE, 256, SAFE_RATIO)
    app_logo.save(IMAGES / "logo-ours.png")

    bg = Image.new("RGBA", (CANVAS, CANVAS), BG_COLOR)
    bg.save(IMAGES / "android-icon-background.png")

    print("Icons regenerated with safe-zone padding.")


if __name__ == "__main__":
    main()
