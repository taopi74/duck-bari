from PIL import Image
import os

def check_opacity(image_path, x, y):
    try:
        img = Image.open(image_path).convert("RGBA")
        r, g, b, a = img.getpixel((x, y))
        print(f"File: {os.path.basename(image_path)} | Pixel at {x},{y}: RGBA({r},{g},{b},{a})")
        if a < 255:
            print("  -> WARNING: This pixel is TRANSPARENT or SEMI-TRANSPARENT!")
        else:
            print("  -> OK: This pixel is OPAQUE.")
    except Exception as e:
        print(f"Error: {e}")

base_dir = r"c:\Users\opi\Desktop\dummy\public\frames"

# Frame 12: Check Left Red Ribbon (approx x=100, y=400)
check_opacity(os.path.join(base_dir, "frame12.png"), 100, 400)

# Frame 8: Check Green area (approx x=100, y=400)
check_opacity(os.path.join(base_dir, "frame8.png"), 100, 400)
