"""
4K 60fps animated wallpaper for lethalsolutions.me.

Produces a seamlessly looping H.264 MP4. Effect stack:
  - Base:     dark vertical gradient
  - Aurora:   torus-looped multi-octave noise (4-corner blend)
  - Glows:    primary hotspot orbits + counter-glow drifts opposite
  - Pulse:    primary glow sinusoidally brightens/dims
  - Rays:     subtle rotating light rays emanating from the hotspot
  - Particles: ~60 floating orange specks with edge fade + soft halo
  - Vignette: static radial darkening toward corners
  - Logo:     real project logo pasted static, top-left

Requires: pillow, numpy, imageio, imageio-ffmpeg
  pip install imageio imageio-ffmpeg

Output: /mnt/user-data/outputs/wallpaper_animated.mp4
"""

import os
import math
import numpy as np
from PIL import Image, ImageDraw, ImageFilter
import imageio.v2 as imageio

# --- output config -----------------------------------------------------------

WIDTH, HEIGHT = 3840, 2160
FPS = 60
FRAMES = 300                     # 5s seamless loop

# the aurora field is computed at a much lower resolution (it's smooth by
# nature) then bicubic-upscaled to 4K — huge speed win, identical visuals
FIELD_W, FIELD_H = 960, 540

LOGO_HEIGHT = 160
LOGO_MARGIN = 120

PROJECT_ROOT = os.path.dirname(os.path.abspath(__file__))
LOGO_PATH = os.path.join(PROJECT_ROOT, "public", "images", "logo.png")
OUTPUT_DIR = "/mnt/user-data/outputs"
OUTPUT_PATH = os.path.join(OUTPUT_DIR, "wallpaper_animated.mp4")

# palette (normalized)
BG = np.array([10, 10, 10], dtype=np.float32) / 255.0       # #0a0a0a
MID = np.array([42, 20, 5], dtype=np.float32) / 255.0       # #2a1405
HOT = np.array([255, 107, 26], dtype=np.float32) / 255.0    # #ff6b1a

N_PARTICLES = 60


# --- noise -------------------------------------------------------------------

def smooth_noise(size, seed, octaves=5, base=(12, 7)):
    w, h = size
    rng = np.random.default_rng(seed)
    acc = np.zeros((h, w), dtype=np.float32)
    total = 0.0
    amp = 1.0
    bw, bh = base
    for _ in range(octaves):
        small = rng.random((bh, bw)).astype(np.float32)
        big = Image.fromarray((small * 255).astype(np.uint8)).resize(
            (w, h), Image.BICUBIC
        )
        acc += np.asarray(big, dtype=np.float32) / 255.0 * amp
        total += amp
        amp *= 0.55
        bw *= 2
        bh *= 2
    acc /= total
    lo, hi = float(acc.min()), float(acc.max())
    return (acc - lo) / max(1e-6, hi - lo)


# --- background field (small resolution, upscaled later) --------------------

def build_field(phase, noise_corners, mesh_small):
    w, h = FIELD_W, FIELD_H
    y, x = mesh_small

    # torus blend for seamlessly looping noise
    a = (1.0 + math.cos(phase)) / 2.0
    b = (1.0 + math.sin(phase)) / 2.0
    N00, N10, N01, N11 = noise_corners
    noise = (N00 * (1 - a) * (1 - b)
             + N10 * a * (1 - b)
             + N01 * (1 - a) * b
             + N11 * a * b)

    # primary glow orbits on an ellipse + sinusoidal pulse
    pulse = 0.85 + 0.18 * math.sin(phase * 2)
    cx = w * 0.55 + w * 0.13 * math.cos(phase)
    cy = h * 0.65 + h * 0.09 * math.sin(phase)
    dx1 = x - cx
    dy1 = y - cy
    r1 = np.sqrt(dx1 * dx1 + dy1 * dy1) / (w * 0.55)
    primary = np.clip(1 - r1, 0, 1) ** 1.6 * pulse

    # counter-glow drifts opposite, slower pulse
    cx2 = w * 0.25 - w * 0.07 * math.cos(phase)
    cy2 = h * 0.30 + h * 0.06 * math.sin(phase)
    r2 = np.sqrt((x - cx2) ** 2 + (y - cy2) ** 2) / (w * 0.42)
    secondary = np.clip(1 - r2, 0, 1) ** 2.0 * 0.30

    # rotating light rays from the primary hotspot
    ang = np.arctan2(dy1, dx1)
    ray_mask = (np.sin(ang * 9 + phase * 1.4) + 1.0) * 0.5
    ray_falloff = np.exp(-r1 * 1.8)
    rays = ray_mask * ray_falloff * 0.18

    shape = np.clip(primary + secondary + rays, 0, 1)
    field = shape * (0.32 + 0.68 * noise)
    field = np.clip(field, 0, 1) ** 1.25

    # 3-stop color ramp: BG -> MID -> HOT
    f = field[..., None]
    low_t = np.clip(f * 2.2, 0, 1)
    high_t = np.clip((f - 0.55) * 2.4, 0, 1)
    rgb = BG + (MID - BG) * low_t
    rgb = rgb + (HOT - rgb) * high_t
    return rgb  # float32, (h, w, 3), in [0, 1]


# --- static vignette ---------------------------------------------------------

def make_vignette(size):
    w, h = size
    y, x = np.mgrid[:h, :w].astype(np.float32)
    cx, cy = w / 2.0, h / 2.0
    d = np.sqrt((x - cx) ** 2 + (y - cy) ** 2) / (w * 0.7)
    v = np.clip(1 - d * d * 0.45, 0.55, 1.0).astype(np.float32)
    return v[..., None]


# --- particles ---------------------------------------------------------------

def generate_particles(rng):
    pts = []
    for _ in range(N_PARTICLES):
        pts.append({
            "x0": float(rng.random()),
            "y0": float(rng.random()),
            # integer cycles guarantee perfect wrap-around loop
            "cycles_x": int(rng.choice([-2, -1, 1, 1, 2])),
            "cycles_y": int(rng.choice([-1, 1, 1, 2])),
            "offset":   float(rng.random()),
            "r":        int(rng.integers(2, 7)),
            "alpha":    int(rng.integers(110, 230)),
            "tint":     int(rng.integers(-25, 30)),
        })
    return pts


def draw_particles(phase, particles):
    img = Image.new("RGBA", (WIDTH, HEIGHT), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    t = phase / (2.0 * math.pi)
    fade = 100.0
    for p in particles:
        tx = (p["x0"] + t * p["cycles_x"] + p["offset"]) % 1.0
        ty = (p["y0"] + t * p["cycles_y"] + p["offset"]) % 1.0
        x = tx * WIDTH
        y = ty * HEIGHT
        e = min(x / fade, (WIDTH - x) / fade,
                y / fade, (HEIGHT - y) / fade, 1.0)
        if e <= 0:
            continue
        a = int(p["alpha"] * e)
        r = p["r"]
        cr = max(200, min(255, 255 + p["tint"]))
        cg = max(70,  min(170, 120 + p["tint"]))
        cb = max(10,  min(70,  40 + p["tint"]))
        d.ellipse([x - r, y - r, x + r, y + r], fill=(cr, cg, cb, a))
    # soft halo under each dot
    halo = img.filter(ImageFilter.GaussianBlur(radius=5))
    return Image.alpha_composite(halo, img)


# --- logo --------------------------------------------------------------------

def load_logo():
    src = Image.open(LOGO_PATH).convert("RGBA")
    ratio = LOGO_HEIGHT / src.height
    new_w = max(1, int(round(src.width * ratio)))
    return src.resize((new_w, LOGO_HEIGHT), Image.LANCZOS)


# --- main --------------------------------------------------------------------

def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    print(f"-> {OUTPUT_PATH}")
    print(f"   {WIDTH}x{HEIGHT}  {FRAMES} frames @ {FPS}fps  "
          f"({FRAMES / FPS:.2f}s seamless loop)")

    print("precomputing noise corners...")
    noise_corners = tuple(
        smooth_noise((FIELD_W, FIELD_H), seed=s, octaves=5, base=(12, 7))
        for s in (11, 22, 33, 44)
    )
    y_small, x_small = np.mgrid[:FIELD_H, :FIELD_W].astype(np.float32)
    mesh_small = (y_small, x_small)

    vignette = make_vignette((WIDTH, HEIGHT))
    logo = load_logo()
    particles = generate_particles(np.random.default_rng(777))

    print("opening MP4 encoder (H.264, crf 18)...")
    writer = imageio.get_writer(
        OUTPUT_PATH,
        fps=FPS,
        codec="libx264",
        pixelformat="yuv420p",
        macro_block_size=None,
        ffmpeg_params=["-crf", "18", "-preset", "medium",
                       "-movflags", "+faststart"],
    )

    try:
        for i in range(FRAMES):
            phase = 2.0 * math.pi * i / FRAMES

            rgb_small = build_field(phase, noise_corners, mesh_small)
            frame = Image.fromarray(
                (rgb_small * 255).astype(np.uint8), "RGB"
            ).resize((WIDTH, HEIGHT), Image.BICUBIC).convert("RGBA")
            frame = frame.filter(ImageFilter.GaussianBlur(radius=2))

            frame = Image.alpha_composite(frame, draw_particles(phase, particles))
            frame.alpha_composite(logo, (LOGO_MARGIN, LOGO_MARGIN))

            arr = np.asarray(frame.convert("RGB"), dtype=np.float32) / 255.0
            arr *= vignette
            arr = np.clip(arr * 255.0, 0, 255).astype(np.uint8)

            writer.append_data(arr)
            if (i + 1) % 30 == 0 or i == FRAMES - 1:
                print(f"  frame {i + 1:3d}/{FRAMES}")
    finally:
        writer.close()

    size_mb = os.path.getsize(OUTPUT_PATH) / 1024 / 1024
    print(f"done: {OUTPUT_PATH}  ({size_mb:.1f} MB)")


if __name__ == "__main__":
    main()
