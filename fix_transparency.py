from PIL import Image
import os

def make_transparent(image_path, start_x, start_y):
    try:
        img = Image.open(image_path).convert("RGBA")
        pixels = img.load()
        width, height = img.size
        
        # Colors to treat as transparent (Checkerboard colors)
        # Usually pure white (255,255,255) and light grey (~204,204,204 or ~220,220,220)
        # We will use a flood fill (BFS) starting from the center center to erase the hole
        
        queue = [(start_x, start_y)]
        visited = set()
        visited.add((start_x, start_y))
        
        # Get background color sample at start point to verify
        start_r, start_g, start_b, start_a = pixels[start_x, start_y]
        print(f"Sampling center of {os.path.basename(image_path)} at {start_x},{start_y}: {start_r},{start_g},{start_b}")

        # Heuristic: If the center is NOT grey/white (e.g. it's colorful), we might be starting wrong.
        # But let's assume our coordinates are good.
        
        min_x, max_x = width, 0
        min_y, max_y = height, 0

        while queue:
            x, y = queue.pop(0)
            
            r, g, b, a = pixels[x, y]
            
            # Check if this pixel looks like checkerboard (White or Grayish)
            # We allow some tolerance
            is_checker = False
            if r > 190 and g > 190 and b > 190:
                if abs(r-g) < 20 and abs(g-b) < 20: # It's neutral color (white/grey)
                   is_checker = True
            
            if is_checker:
                # Make transparent
                pixels[x, y] = (0, 0, 0, 0)
                
                # Update bounds for logging
                min_x = min(min_x, x)
                max_x = max(max_x, x)
                min_y = min(min_y, y)
                max_y = max(max_y, y)

                # Add neighbors
                for dx, dy in [(-1,0), (1,0), (0,-1), (0,1)]:
                    nx, ny = x + dx, y + dy
                    if 0 <= nx < width and 0 <= ny < height:
                        if (nx, ny) not in visited:
                            visited.add((nx, ny))
                            queue.append((nx, ny))
        
        img.save(image_path)
        print(f"Fixed {os.path.basename(image_path)} | Hole Bounds: {min_x},{min_y} to {max_x},{max_y}")

    except Exception as e:
        print(f"Error processing {image_path}: {e}")

# Defining the rough centers we found earlier to start the flood fill
# We will use these starting points to eat away the checkerboard
configs = [
    # Frame 12: Center approx 540, 380
    ("frame12.png", 540, 380),
    # Frame 11: Center approx 540, 360
    ("frame11.png", 540, 360),
    # Frame 7: Center approx 540, 410
    ("frame7.png", 540, 410),
    # Frame 8: Center approx 612, 370
    ("frame8.png", 612, 370),
    # Frame 5: Center approx 520, 500
    ("frame5.png", 520, 500),
    # Frame 6: Center approx 520, 600
    ("frame6.png", 520, 600)
]

base_dir = r"c:\Users\opi\Desktop\dummy\public\frames"

for fname, cx, cy in configs:
    path = os.path.join(base_dir, fname)
    if os.path.exists(path):
        make_transparent(path, cx, cy)
    else:
        print(f"Not found: {path}")
