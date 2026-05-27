import os
import sys
import wave
import shutil
import math
import numpy as np
from PIL import Image, ImageDraw, ImageFont

# Set up static-ffmpeg to make sure ffmpeg is in PATH
try:
    import static_ffmpeg
    static_ffmpeg.add_paths()
    print("Successfully added FFmpeg paths from static-ffmpeg.")
except Exception as e:
    print("Could not load static-ffmpeg paths:", e)

# Parameters
WIDTH, HEIGHT = 1920, 1080
FPS = 30
DURATION = 12
TOTAL_FRAMES = FPS * DURATION  # 360 frames

# Directories
WORKSPACE_DIR = r"c:\Users\brawl\OneDrive\Documents\GOATEDDD\goateddd.com"
TEMP_DIR = os.path.join(WORKSPACE_DIR, "scripts", "temp_frames")
AUDIO_PATH = os.path.join(WORKSPACE_DIR, "scripts", "temp_audio.wav")
OUTPUT_PATH = os.path.join(WORKSPACE_DIR, "public", "assets", "showreel_hd.mp4")

# Color palette
COLOR_GOLD = (255, 210, 169)       # #ffd2a9 (champagne-gold)
COLOR_PURPLE = (255, 141, 242)     # #ff8df2 (glowing pink/purple)
COLOR_BG = (7, 7, 10)              # #07070a (deep obsidian)

# Make sure directories exist
os.makedirs(TEMP_DIR, exist_ok=True)
os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)

# Graceful font finder
def get_system_font(font_name, size):
    font_paths = [
        f"C:\\Windows\\Fonts\\{font_name}.ttf",
        f"C:\\Windows\\Fonts\\{font_name.lower()}.ttf",
        f"C:\\Windows\\Fonts\\{font_name}b.ttf",
        font_name,
        "arial.ttf",
    ]
    for path in font_paths:
        if os.path.exists(path):
            try:
                return ImageFont.truetype(path, size)
            except Exception:
                pass
    return ImageFont.load_default()

# Preload fonts
font_serif_lg = get_system_font("georgiab", 120)   # For main brand title
font_serif_md = get_system_font("georgiab", 90)    # For elegant serif display segments
font_sans_lg = get_system_font("segoeuib", 90)     # For bold geometric segments
font_sans_md = get_system_font("segoeuib", 40)     # For subtitle lockup
font_sans_sm = get_system_font("segoeui", 24)      # For regular thin details

def draw_gradient_text_centered(draw_img, text, font, y_offset, colors, alpha=1.0, frame_idx=0):
    w, h = draw_img.size
    
    # Create text mask
    mask_im = Image.new("L", draw_img.size, 0)
    mask_draw = ImageDraw.Draw(mask_im)
    
    bbox = mask_draw.textbbox((0, 0), text, font=font)
    text_w = bbox[2] - bbox[0]
    text_h = bbox[3] - bbox[1]
    
    x = (w - text_w) // 2 - bbox[0]
    y = y_offset - bbox[1]
    
    mask_draw.text((x, y), text, font=font, fill=255)
    
    if alpha < 1.0:
        mask_im = mask_im.point(lambda p: int(p * alpha))
        
    start_x = max(0, x)
    end_x = min(w, x + text_w)
    
    color_start = colors[0]
    color_end = colors[1]
    
    # Fast 1px horizontal gradient strip stretched vertically
    grad_strip = np.zeros((1, w, 3), dtype=np.uint8)
    for i in range(w):
        if i < start_x:
            factor = 0.0
        elif i > end_x:
            factor = 1.0
        else:
            factor = (i - start_x) / (end_x - start_x) if end_x != start_x else 0.0
            
        # Dynamic kinetic color flow shifts
        factor = (factor + frame_idx * 0.008) % 2.0
        if factor > 1.0:
            factor = 2.0 - factor
            
        r = int(color_start[0] + factor * (color_end[0] - color_start[0]))
        g = int(color_start[1] + factor * (color_end[1] - color_start[1]))
        b = int(color_start[2] + factor * (color_end[2] - color_start[2]))
        grad_strip[0, i] = [r, g, b]
        
    gradient_im = Image.fromarray(grad_strip, "RGB").resize((w, h)).convert("RGBA")
    draw_img.paste(gradient_im, mask=mask_im)

# 1. Synthesize Warm Cinematic Stereo Audio Pad (12 seconds)
print("Generating cinematic audio swell (12s)...")
def generate_audio():
    sample_rate = 44100
    t = np.linspace(0, DURATION, int(sample_rate * DURATION), endpoint=False)
    
    # Deep, luxury Db Major 9 chord frequencies
    freqs = [69.30, 103.83, 138.59, 174.61, 261.63, 311.13]
    pans = [0.1, 0.4, 0.8, 0.2, 0.7, 0.5]
    
    left_channel = np.zeros_like(t)
    right_channel = np.zeros_like(t)
    
    for idx, f in enumerate(freqs):
        pan = pans[idx]
        vol_l = np.sqrt(1.0 - pan)
        vol_r = np.sqrt(pan)
        
        # Rich detuned voices for warm lush chorus pad
        voice = (
            np.sin(2 * np.pi * f * t) +
            0.55 * np.sin(2 * np.pi * (f * 1.004) * t) +
            0.55 * np.sin(2 * np.pi * (f * 0.996) * t) +
            0.3 * np.sin(2 * np.pi * (f * 2.0) * t) +
            0.15 * np.sin(2 * np.pi * (f * 3.0) * t)
        )
        
        # Organic slow pitch/volume swell modulation
        mod = 1.0 + 0.12 * np.sin(2 * np.pi * 0.15 * t + idx)
        voice = voice * mod
        
        left_channel += voice * vol_l
        right_channel += voice * vol_r
        
    # Warm tape hiss
    noise = np.random.normal(0, 0.02, size=t.shape)
    noise = np.convolve(noise, np.ones(12)/12, mode='same')
    
    left_channel += noise
    right_channel += noise
    
    # 3s fade-in (quadratic), 3s fade-out starting at 9s
    envelope = np.ones_like(t)
    fade_in_samples = int(3.0 * sample_rate)
    fade_out_samples = int(3.0 * sample_rate)
    envelope[:fade_in_samples] = (np.linspace(0, 1, fade_in_samples)) ** 2
    envelope[-fade_out_samples:] = np.linspace(1, 0, fade_out_samples)
    
    # Normalize
    max_val = max(np.max(np.abs(left_channel)), np.max(np.abs(right_channel)))
    left_channel = (left_channel / max_val) * 0.8 * envelope
    right_channel = (right_channel / max_val) * 0.8 * envelope
    
    # Convert to stereo 16-bit PCM
    left_pcm = (left_channel * 32767).astype(np.int16)
    right_pcm = (right_channel * 32767).astype(np.int16)
    
    interleaved_pcm = np.empty((left_pcm.size + right_pcm.size,), dtype=np.int16)
    interleaved_pcm[0::2] = left_pcm
    interleaved_pcm[1::2] = right_pcm
    
    with wave.open(AUDIO_PATH, "wb") as wav_file:
        wav_file.setparams((2, 2, sample_rate, len(t), "NONE", "not compressed"))
        wav_file.writeframes(interleaved_pcm.tobytes())
    print(f"Audio swell saved at: {AUDIO_PATH}")

generate_audio()

# 2. Procedural Visual Frame Generator (12 seconds / 360 frames)
print("Generating frames...")

# Initialize 90 random floating ambient particles
particles = []
for _ in range(90):
    particles.append({
        'x': np.random.uniform(0, WIDTH),
        'y': np.random.uniform(0, HEIGHT),
        'speed_y': np.random.uniform(-0.4, -1.8),
        'speed_x': np.random.uniform(-0.15, 0.15),
        'radius': np.random.uniform(1.2, 4.0),
        'opacity': np.random.uniform(40, 160)
    })

# Phase variables for continuous smooth wave velocity
wave_phase_1 = 0.0
wave_phase_2 = 0.0
wave_phase_3 = 0.0

for frame in range(TOTAL_FRAMES):
    # Base deep obsidian background
    im = Image.new("RGBA", (WIDTH, HEIGHT), COLOR_BG + (255,))
    draw = ImageDraw.Draw(im, "RGBA")
    
    # Accelerate waves during Speed segment (frames 180-269)
    if 180 <= frame < 270:
        wave_speed = 2.4
    else:
        wave_speed = 0.95
        
    wave_phase_1 += 0.025 * wave_speed
    wave_phase_2 += 0.038 * wave_speed
    wave_phase_3 += 0.018 * wave_speed
    
    # A. Draw Floating Star Dust Particles
    for p in particles:
        p['y'] += p['speed_y']
        p['x'] += p['speed_x']
        
        if p['y'] < 0:
            p['y'] = HEIGHT
            p['x'] = np.random.uniform(0, WIDTH)
        if p['x'] < 0: p['x'] = WIDTH
        if p['x'] > WIDTH: p['x'] = 0
        
        factor = p['x'] / WIDTH
        r = 255
        g = int(COLOR_GOLD[1] * (1 - factor) + COLOR_PURPLE[1] * factor)
        b = int(COLOR_GOLD[2] * (1 - factor) + COLOR_PURPLE[2] * factor)
        
        rad = p['radius']
        op = int(p['opacity'] * (0.5 + 0.5 * math.sin(frame * 0.02 + p['radius'])))
        draw.ellipse([p['x'] - rad * 2, p['y'] - rad * 2, p['x'] + rad * 2, p['y'] + rad * 2], fill=(r, g, b, int(op * 0.25)))
        draw.ellipse([p['x'] - rad, p['y'] - rad, p['x'] + rad, p['y'] + rad], fill=(r, g, b, op))

    # B. Glowing Wave Lines at EXTREME top and bottom edges only
    wave_configs = [
        # Top Waves (y=80-100 zone — well above any text)
        (wave_phase_1, 25, 0.003, 10, 0.007, 80, 2.0),
        (wave_phase_2, 18, 0.004, 7, 0.009, 100, 1.5),
        # Bottom Waves (y=960-980 zone — well below any text)
        (wave_phase_3, 30, 0.002, 12, 0.005, 960, 2.5),
        (wave_phase_1 * 0.7, 20, 0.003, 8, 0.007, 980, 1.8)
    ]
    
    for phase, amp1, f1, amp2, f2, base_y, particle_radius in wave_configs:
        for x in range(0, WIDTH + 10, 12):
            y = base_y + amp1 * math.sin(f1 * x + phase) + amp2 * math.cos(f2 * x - phase * 0.8)
            
            factor = x / WIDTH
            r = 255
            g = int(COLOR_GOLD[1] * (1 - factor) + COLOR_PURPLE[1] * factor)
            b = int(COLOR_GOLD[2] * (1 - factor) + COLOR_PURPLE[2] * factor)
            
            draw.ellipse([x - particle_radius * 2.8, y - particle_radius * 2.8, x + particle_radius * 2.8, y + particle_radius * 2.8], fill=(r, g, b, 12))
            draw.ellipse([x - particle_radius * 1.5, y - particle_radius * 1.5, x + particle_radius * 1.5, y + particle_radius * 1.5], fill=(r, g, b, 45))
            draw.ellipse([x - particle_radius * 0.6, y - particle_radius * 0.6, x + particle_radius * 0.6, y + particle_radius * 0.6], fill=(r, g, b, 210))

    # C. Dynamic Typography Segments
    # Segment 1: 0-3s (frame 0-89): "DESIGN IS EMOTION."
    # Segment 2: 3-6s (frame 90-179): "SEO IS DOMINANCE."
    # Segment 3: 6-9s (frame 180-269): "SPEED IS CONVERSION." + gauge
    # Segment 4: 9-11s (frame 270-329): "GOATEDDD." brand lockup
    # Segment 5: 11-12s (frame 330-359): Fade to black
    
    if 0 <= frame < 90:
        # DESIGN IS EMOTION
        alpha = 1.0
        if frame < 20: alpha = frame / 20.0
        elif frame > 70: alpha = (90 - frame) / 20.0
        
        draw_gradient_text_centered(im, "DESIGN IS EMOTION.", font_serif_md, 480, [COLOR_GOLD, COLOR_PURPLE], alpha=alpha, frame_idx=frame)
        
    elif 90 <= frame < 180:
        # SEO IS DOMINANCE
        sub_frame = frame - 90
        alpha = 1.0
        if sub_frame < 20: alpha = sub_frame / 20.0
        elif sub_frame > 70: alpha = (90 - sub_frame) / 20.0
        
        draw_gradient_text_centered(im, "SEO IS DOMINANCE.", font_sans_lg, 480, [COLOR_GOLD, COLOR_PURPLE], alpha=alpha, frame_idx=frame)
        
    elif 180 <= frame < 270:
        # SPEED IS CONVERSION + PageSpeed Gauge
        sub_frame = frame - 180
        alpha = 1.0
        if sub_frame < 20: alpha = sub_frame / 20.0
        elif sub_frame > 70: alpha = (90 - sub_frame) / 20.0
        
        # PageSpeed Gauge Ring
        cx, cy = WIDTH // 2, 380
        r_gauge = 95
        
        draw.arc([cx - r_gauge, cy - r_gauge, cx + r_gauge, cy + r_gauge], start=0, end=360, fill=(255, 255, 255, int(15 * alpha)), width=5)
        draw.arc([cx - r_gauge, cy - r_gauge, cx + r_gauge, cy + r_gauge], start=-90, end=256, fill=COLOR_PURPLE + (int(140 * alpha),), width=8)
        
        font_gauge_num = get_system_font("georgiab", 65)
        draw_gradient_text_centered(im, "99", font_gauge_num, cy - 42, [COLOR_GOLD, COLOR_PURPLE], alpha=alpha, frame_idx=frame)
        
        font_gauge_lbl = get_system_font("segoeuib", 13)
        draw_gradient_text_centered(im, "PERFORMANCE", font_gauge_lbl, cy + 55, [COLOR_GOLD, COLOR_PURPLE], alpha=alpha * 0.7, frame_idx=frame)
        
        draw_gradient_text_centered(im, "SPEED IS CONVERSION.", font_sans_lg, 620, [COLOR_GOLD, COLOR_PURPLE], alpha=alpha, frame_idx=frame)
        
    elif 270 <= frame < 330:
        # GOATEDDD. WE ARE HERE. Brand lockup
        sub_frame = frame - 270
        alpha = 1.0
        if sub_frame < 20: alpha = sub_frame / 20.0
        # Hold steady until fade-to-black takes over at frame 330
        
        draw_gradient_text_centered(im, "GOATEDDD.", font_serif_lg, 350, [COLOR_GOLD, COLOR_PURPLE], alpha=alpha, frame_idx=frame)
        draw_gradient_text_centered(im, "WE ARE HERE.", font_sans_md, 530, [COLOR_GOLD, COLOR_PURPLE], alpha=alpha, frame_idx=frame)
        draw_gradient_text_centered(im, "ARCHITECTED AT THE ABSOLUTE PEAK.", font_sans_sm, 620, [COLOR_GOLD, COLOR_PURPLE], alpha=alpha * 0.75, frame_idx=frame)
    
    elif 330 <= frame < 360:
        # Brand lockup fading out + overall fade to black
        sub_frame = frame - 330
        fade_progress = sub_frame / 29.0  # 0.0 to 1.0
        text_alpha = 1.0 - fade_progress
        
        # Draw text fading out
        if text_alpha > 0.01:
            draw_gradient_text_centered(im, "GOATEDDD.", font_serif_lg, 350, [COLOR_GOLD, COLOR_PURPLE], alpha=text_alpha, frame_idx=frame)
            draw_gradient_text_centered(im, "WE ARE HERE.", font_sans_md, 530, [COLOR_GOLD, COLOR_PURPLE], alpha=text_alpha, frame_idx=frame)
            draw_gradient_text_centered(im, "ARCHITECTED AT THE ABSOLUTE PEAK.", font_sans_sm, 620, [COLOR_GOLD, COLOR_PURPLE], alpha=text_alpha * 0.75, frame_idx=frame)
        
        # Overlay black with increasing opacity for smooth fade to black
        black_overlay = Image.new('RGBA', (WIDTH, HEIGHT), (7, 7, 10, int(255 * fade_progress)))
        im = Image.alpha_composite(im, black_overlay)
    
    # Save frame
    frame_filename = os.path.join(TEMP_DIR, f"frame_{frame:04d}.png")
    im.convert("RGB").save(frame_filename, "PNG")
    
    if (frame + 1) % 50 == 0:
        print(f"Rendered {frame + 1}/{TOTAL_FRAMES} frames...")

print("All frames rendered successfully.")

# 3. Compile Progressive MP4 using FFmpeg
print("Compiling video using FFmpeg...")
try:
    import subprocess
    
    ffmpeg_cmd = [
        "ffmpeg", "-y",
        "-framerate", str(FPS),
        "-i", os.path.join(TEMP_DIR, "frame_%04d.png"),
        "-i", AUDIO_PATH,
        "-c:v", "libx264",
        "-profile:v", "high",
        "-level:v", "4.0",
        "-pix_fmt", "yuv420p",
        "-c:a", "aac",
        "-b:a", "192k",
        "-movflags", "+faststart",
        "-shortest",
        OUTPUT_PATH
    ]
    
    print("Running command:", " ".join(ffmpeg_cmd))
    res = subprocess.run(ffmpeg_cmd, capture_output=True, text=True)
    
    if res.returncode == 0:
        print(f"SUCCESS! Showreel generated and saved at: {OUTPUT_PATH}")
        print("Output video size:", os.path.getsize(OUTPUT_PATH), "bytes.")
    else:
        print("FFmpeg encoding failed.")
        print("STDOUT:", res.stdout)
        print("STDERR:", res.stderr)
        
except Exception as e:
    print("Error during video compilation:", e)

# 4. Clean up temporary files
print("Cleaning up temporary directories...")
try:
    shutil.rmtree(TEMP_DIR)
    os.remove(AUDIO_PATH)
    print("Clean up finished successfully!")
except Exception as e:
    print("Error cleaning up files:", e)
