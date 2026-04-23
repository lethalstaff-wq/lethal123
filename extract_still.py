"""Extract a single static frame from the animated GIF for use as a
regular (non-animated) desktop wallpaper."""

from PIL import Image

SRC = "C:/mnt/user-data/outputs/wallpaper_animated.gif"
DST = "C:/mnt/user-data/outputs/wallpaper_still.png"

img = Image.open(SRC)
# pick a middle-ish frame so the glow is roughly centered in its orbit
img.seek(img.n_frames // 2)
img.convert("RGB").save(DST)
print(f"saved {DST}")
