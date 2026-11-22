"""Generate the banner-only responsive WebPs. Requires Pillow; not used at build time."""
from pathlib import Path
from PIL import Image, ImageOps

assets = Path(__file__).resolve().parents[1] / "public" / "assets"
sources = {
    "telefona": "category-telefona-18-pro.webp",
    "motore": "category-motore.webp",
    "trotineta": "category-trotineta.webp",
    "tableta": "category-tableta.webp",
    "aksesore": "category-aksesore.webp",
}
for category, source in sources.items():
    # The existing banners are monochrome at low opacity. Preserve their crop and
    # composition while avoiding full-color, 3000px photography for a shallow strip.
    original = ImageOps.grayscale(Image.open(assets / source)).convert("RGB")
    for width in (640, 1280, 1920):
        height = round(original.height * width / original.width)
        image = original.resize((width, height), Image.Resampling.LANCZOS)
        target = assets / f"banner-{category}-{width}.webp"
        image.save(target, "WEBP", quality=68, method=6)
        print(f"{target.name}: {target.stat().st_size:,} bytes")
