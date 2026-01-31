from PIL import Image, ImageDraw
import os

def force_transparent_circle(image_path, center_x, center_y, radius, color_threshold=30):
    try:
        img = Image.open(image_path).convert("RGBA")
        pixels = img.load()
        width, height = img.size
        
        print(f"Processing {os.path.basename(image_path)}...")
        
        # Scan within the bounding box of the circle
        min_x = max(0, center_x - radius)
        max_x = min(width, center_x + radius)
        min_y = max(0, center_y - radius)
        max_y = min(height, center_y + radius)
        
        count = 0
        for x in range(min_x, max_x):
            for y in range(min_y, max_y):
                # Check distance from center to ensure we are inside the circle of interest
                if (x - center_x)**2 + (y - center_y)**2 <= radius**2:
                    r, g, b, a = pixels[x, y]
                    
                    # If pixel is whitish/greyish (Checkerboard pattern), make it transparent
                    # Checkerboard white is usually > 200, grey is > 190
                    # We will be aggressive here.
                    
                    is_light = (r > 150 and g > 150 and b > 150)
                    is_neutral = (abs(r-g) < color_threshold and abs(g-b) < color_threshold)
                    
                    if is_light and is_neutral:
                        pixels[x, y] = (0, 0, 0, 0)
                        count += 1
                        
        img.save(image_path)
        print(f"Fixed {os.path.basename(image_path)}: Made {count} pixels transparent.")

    except Exception as e:
        print(f"Error processing {image_path}: {e}")

# Target specifically Frame 8 and Frame 12 with aggressive circular cleaning
# Frame 12: Radius ~240, Center 540, 380
# Frame 8: Radius ~190, Center 612, 370

base_dir = r"c:\Users\opi\Desktop\dummy\public\frames"

# Frame 12
force_transparent_circle(os.path.join(base_dir, "frame12.png"), 540, 380, 260)

# Frame 8 - Using the analyzed center
force_transparent_circle(os.path.join(base_dir, "frame8.png"), 612, 370, 220)
