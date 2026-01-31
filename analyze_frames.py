import os
from PIL import Image

def analyze_frame(image_path):
    try:
        img = Image.open(image_path)
        img = img.convert("RGBA")
        width, height = img.size
        pixels = img.load()

        # Strategy 1: Check mainly for Alpha Transparency
        # Find bounds of transparent area
        min_x, min_y = width, height
        max_x, max_y = 0, 0
        transparent_found = False

        # Scan center area mostly, ignoring outer edges sometimes helps, but let's scan all 
        # to find the "hole". 
        # A hole is defined as alpha < 255 OR (if fake transparency) specific grey/white colors.
        
        # Let's count transparent pixels
        for y in range(height):
            for x in range(width):
                r, g, b, a = pixels[x, y]
                
                # Check for real transparency
                is_hole = (a < 250)
                
                # Check for Fake Transparency (White/Grey Checkerboard)
                # Typically #FFFFFF (255) and #CDCDCD (205) or similar greys
                # And the frame border is usually colorful.
                # This is a heuristic.
                if not is_hole:
                     # Check for white or light grey pixel common in checkerboards
                     if (r > 200 and g > 200 and b > 200) and (abs(r-g) < 10 and abs(g-b) < 10):
                         # It's a white/greyish pixel. 
                         # But frames also have white text. We need to be careful.
                         # We assume the HOLE is the largest cluster of such pixels in the center.
                         pass

                if is_hole:
                    transparent_found = True
                    if x < min_x: min_x = x
                    if x > max_x: max_x = x
                    if y < min_y: min_y = y
                    if y > max_y: max_y = y

        if transparent_found:
            # Calculate geometric center and size
            hole_w = max_x - min_x
            hole_h = max_y - min_y
            center_x = min_x + hole_w // 2
            center_y = min_y + hole_h // 2
            
            # Determine radius (approximate based on width)
            radius = hole_w // 2

            with open("analysis_results.txt", "a") as log:
                log.write(f"FILE: {os.path.basename(image_path)}\n")
                log.write(f"  Bounds: {min_x},{min_y} to {max_x},{max_y}\n")
                log.write(f"  Center: {center_x}, {center_y}\n")
                log.write(f"  Size: {hole_w} x {hole_h}\n")
                log.write(f"  Radius: {radius}\n")
                log.write("-" * 20 + "\n")
            return
        
        # Strategy 2: If no transparency, scan for Center Hole color (Fake Transparency)
        
        # Sample center pixel
        cx, cy = width // 2, height // 2
        
        # Scan outward from center to find edges of the hole
        # Scan Left
        left_x = 0
        for x in range(cx, 0, -1):
            if not is_checkerboard_pixel(pixels[x, cy]):
                left_x = x
                break
        
        # Scan Right
        right_x = width
        for x in range(cx, width):
            if not is_checkerboard_pixel(pixels[x, cy]):
                right_x = x
                break
                
        # Scan Up
        top_y = 0
        for y in range(cy, 0, -1):
            if not is_checkerboard_pixel(pixels[cx, y]):
                top_y = y
                break

        # Scan Down
        bottom_y = height
        for y in range(cy, height):
            if not is_checkerboard_pixel(pixels[cx, y]):
                bottom_y = y
                break

        hole_w = right_x - left_x
        hole_h = bottom_y - top_y
        center_x = left_x + hole_w // 2
        center_y = top_y + hole_h // 2
        radius = hole_w // 2

        with open("analysis_results.txt", "a") as log:
            log.write(f"FILE: {os.path.basename(image_path)} (Fake Trans)\n")
            log.write(f"  Bounds: {left_x},{top_y} to {right_x},{bottom_y}\n")
            log.write(f"  Center: {center_x}, {center_y}\n")
            log.write(f"  Size: {hole_w} x {hole_h}\n")
            log.write(f"  Radius: {radius}\n")
            log.write("-" * 20 + "\n")

    except Exception as e:
        print(f"Error analyzing {image_path}: {e}")

def is_checkerboard_pixel(pixel):
    r, g, b, a = pixel
    # Check for white, light grey, dark grey used in photoshop transparencies
    # White: 255,255,255
    # Grey: 204,204,204 (approx) or similar
    if r > 240 and g > 240 and b > 240: return True # White
    if r > 190 and g > 190 and b > 190 and abs(r-g) < 10: return True # Grey
    return False

frames_dir = r"c:\Users\opi\Desktop\dummy\public\frames"
for f in os.listdir(frames_dir):
    if f.endswith(".png"):
        analyze_frame(os.path.join(frames_dir, f))
