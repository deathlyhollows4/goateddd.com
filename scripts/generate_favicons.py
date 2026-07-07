import os
from PIL import Image, ImageDraw, ImageFont

def generate_luxury_g_icon(size):
    # Base configuration: Obsidian black background
    # #07070a is the primary brand background
    bg_color = (7, 7, 10)
    
    # Champagne gold colors for luxury gradient feel
    gold_light = (255, 210, 169)
    gold_dark = (212, 175, 55)
    
    img = Image.new('RGB', (size, size), bg_color)
    draw = ImageDraw.Draw(img)
    
    # Draw a premium subtle gold circle ring border
    border_width = max(1, size // 16)
    draw.ellipse(
        [border_width, border_width, size - border_width, size - border_width],
        outline=gold_light,
        width=border_width
    )
    
    # Draw a stylized serif letter 'G' in gold inside
    # Since fonts might not load reliably, we'll draw a beautiful geometric 'G' shape
    cx = size // 2
    cy = size // 2
    r = size // 4
    
    # Draw G curve
    draw.arc(
        [cx - r, cy - r, cx + r, cy + r],
        start=45,
        end=315,
        fill=gold_light,
        width=max(2, size // 10)
    )
    
    # Draw G horizontal bar
    bar_y = cy
    bar_x_start = cx
    bar_x_end = cx + r
    draw.line(
        [(bar_x_start, bar_y), (bar_x_end, bar_y)],
        fill=gold_light,
        width=max(2, size // 10)
    )
    
    # Draw G vertical stem
    stem_x = cx + r
    stem_y_start = cy
    stem_y_end = cy + (r // 2)
    draw.line(
        [(stem_x, stem_y_start), (stem_x, stem_y_end)],
        fill=gold_light,
        width=max(2, size // 10)
    )
    
    return img

def main():
    os.makedirs('public/assets', exist_ok=True)
    
    # Generate files
    sizes = {
        'favicon-16x16.png': 16,
        'favicon-32x32.png': 32,
        'apple-touch-icon.png': 180,
        'apple-touch-icon-152x152.png': 152,
        'apple-touch-icon-120x120.png': 120,
        'apple-touch-icon-76x76.png': 76,
        'android-chrome-192x192.png': 192,
        'android-chrome-512x512.png': 512,
    }
    
    for filename, size in sizes.items():
        filepath = os.path.join('public/assets', filename)
        img = generate_luxury_g_icon(size)
        img.save(filepath, 'PNG')
        print(f"Generated: {filepath} ({size}x{size})")
        
    # Generate simple safari-pinned-tab.svg
    svg_content = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none">
  <circle cx="50" cy="50" r="45" stroke="#ffd2a9" stroke-width="8"/>
  <path d="M70 50 H50 V60 M71.2 60 C66 70 54 75 42 70 C30 65 24 50 30 38 C36 26 50 20 62 26 C68 30 72 36 73 42" stroke="#ffd2a9" stroke-width="8" stroke-linecap="round"/>
</svg>"""
    
    svg_path = 'public/assets/safari-pinned-tab.svg'
    with open(svg_path, 'w') as f:
        f.write(svg_content)
    print(f"Generated: {svg_path}")

if __name__ == '__main__':
    main()
