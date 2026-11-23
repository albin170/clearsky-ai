import os
import sys
import math
import subprocess
from PIL import Image, ImageDraw, ImageFont, ImageFilter

FFMPEG_BIN = r"C:\Users\Dell\AppData\Local\Python\pythoncore-3.14-64\Lib\site-packages\imageio_ffmpeg\binaries\ffmpeg-win-x86_64-v7.1.exe"
AUDIO_FILE = r"C:\Users\Dell\Documents\clearsky-ai\frontend\public\audio\reel-track-2.mp3"
OUTPUT_MP4 = r"C:\Users\Dell\Documents\clearsky-ai\clearsky-ai-website-insta-reel.mp4"
OUTPUT_MP3 = r"C:\Users\Dell\Documents\clearsky-ai\clearsky-ai-website-insta-reel.mp3"
PUBLIC_VIDEO = r"C:\Users\Dell\Documents\clearsky-ai\frontend\public\videos\clearsky-ai-website-insta-reel.mp4"
PUBLIC_AUDIO = r"C:\Users\Dell\Documents\clearsky-ai\frontend\public\audio\clearsky-ai-website-insta-reel.mp3"
SHOTS_DIR = r"C:\Users\Dell\Documents\clearsky-ai\reel_shots"

WIDTH = 1080
HEIGHT = 1920
FPS = 30
SCENE_DURATION = 3.2  # seconds per scene
SCENES_CONFIG = [
    {
        "file": "01_dashboard_top.png",
        "tag": "REAL-TIME AQI",
        "title": "Track Pollution in 50+ Cities",
        "desc": "Live AQI, PM2.5, PM10 & instant atmospheric telemetry.",
        "likes": "18.9K",
        "comments": "842"
    },
    {
        "file": "02_dashboard_pollutants.png",
        "tag": "DEEP TELEMETRY",
        "title": "Hourly Forecast & Trends",
        "desc": "24-Hour trajectory, particulate sensors & health alerts.",
        "likes": "14.2K",
        "comments": "620"
    },
    {
        "file": "03_reels_view.png",
        "tag": "NEW: ECO REELS",
        "title": "Clean Air Short Video Feed",
        "desc": "Watch, like, comment & share clean air community tips.",
        "likes": "32.6K",
        "comments": "1.4K"
    },
    {
        "file": "04_ai_assistant.png",
        "tag": "GENAI DOCTOR",
        "title": "Smart Air Quality Assistant",
        "desc": "Personalized health advice & protection for vulnerable groups.",
        "likes": "21.5K",
        "comments": "915"
    },
    {
        "file": "05_indoor_purifiers.png",
        "tag": "INDOOR PURITY",
        "title": "Room Health & Smart Purifiers",
        "desc": "Keep your home, workspace & nursery clean and safe.",
        "likes": "16.1K",
        "comments": "477"
    },
    {
        "file": "06_map_view.png",
        "tag": "INTERACTIVE MAP",
        "title": "Live Smog & AQI Heatmap",
        "desc": "Navigate clean routes & avoid high-pollution zones.",
        "likes": "27.4K",
        "comments": "1.1K"
    }
]

TOTAL_DURATION = len(SCENES_CONFIG) * SCENE_DURATION  # 19.2 seconds
TOTAL_FRAMES = int(TOTAL_DURATION * FPS)
FRAMES_PER_SCENE = int(SCENE_DURATION * FPS)

# Fonts
FONT_TITLE = ImageFont.truetype(r"C:\Windows\Fonts\segoeuib.ttf", 46)
FONT_SUBTITLE = ImageFont.truetype(r"C:\Windows\Fonts\segoeui.ttf", 28)
FONT_TAG = ImageFont.truetype(r"C:\Windows\Fonts\segoeuib.ttf", 24)
FONT_HEADER_TITLE = ImageFont.truetype(r"C:\Windows\Fonts\segoeuib.ttf", 36)
FONT_HEADER_SUB = ImageFont.truetype(r"C:\Windows\Fonts\segoeui.ttf", 22)
FONT_ICON = ImageFont.truetype(r"C:\Windows\Fonts\segoeuib.ttf", 24)

# Load scene base images
loaded_images = []
for sc in SCENES_CONFIG:
    p = os.path.join(SHOTS_DIR, sc["file"])
    im = Image.open(p).convert("RGBA")
    if im.size != (WIDTH, HEIGHT):
        im = im.resize((WIDTH, HEIGHT), Image.Resampling.LANCZOS)
    loaded_images.append(im)

def draw_overlay(base_img, scene_idx, frame_in_scene, total_progress):
    cfg = SCENES_CONFIG[scene_idx]
    overlay = Image.new("RGBA", (WIDTH, HEIGHT), (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)

    # 1. Top progress bars (segmented by scene)
    num_scenes = len(SCENES_CONFIG)
    gap = 8
    margin_x = 24
    total_bar_w = WIDTH - (margin_x * 2) - ((num_scenes - 1) * gap)
    bar_w = total_bar_w / num_scenes
    bar_y = 16
    bar_h = 5

    for i in range(num_scenes):
        bx = margin_x + i * (bar_w + gap)
        # Background track
        draw.rounded_rectangle([bx, bar_y, bx + bar_w, bar_y + bar_h], radius=3, fill=(255, 255, 255, 70))
        if i < scene_idx:
            # Fully filled
            draw.rounded_rectangle([bx, bar_y, bx + bar_w, bar_y + bar_h], radius=3, fill=(20, 184, 166, 255))
        elif i == scene_idx:
            # Partially filled
            fill_pct = frame_in_scene / FRAMES_PER_SCENE
            cur_w = max(2, bar_w * fill_pct)
            draw.rounded_rectangle([bx, bar_y, bx + cur_w, bar_y + bar_h], radius=3, fill=(20, 184, 166, 255))

    # 2. Header Bar (top app branding)
    # Dark gradient header background
    for y in range(0, 120):
        alpha = int(180 * (1.0 - y / 120.0))
        draw.line([(0, y), (WIDTH, y)], fill=(10, 15, 25, alpha))

    # App Icon pill
    draw.rounded_rectangle([28, 36, 80, 88], radius=16, fill=(13, 148, 136, 240))
    draw.text((43, 44), "C", font=FONT_HEADER_TITLE, fill=(255, 255, 255, 255))
    
    # Title & verified badge
    draw.text((95, 40), "ClearSky AI", font=FONT_HEADER_TITLE, fill=(255, 255, 255, 255))
    draw.rounded_rectangle([290, 48, 385, 80], radius=8, fill=(20, 184, 166, 60), outline=(20, 184, 166, 180), width=1)
    draw.text((298, 52), "VERIFIED", font=FONT_TAG, fill=(45, 212, 191, 255))
    draw.text((95, 82), "Original Audio • clearsky.ai", font=FONT_HEADER_SUB, fill=(160, 175, 190, 230))

    # Follow button top right
    draw.rounded_rectangle([WIDTH - 170, 44, WIDTH - 30, 84], radius=12, fill=(20, 184, 166, 230))
    draw.text((WIDTH - 150, 49), "Explore", font=FONT_TAG, fill=(10, 15, 25, 255))

    # 3. Instagram Right Action Column (Heart, Comment, Share, Bookmark)
    actions_x = WIDTH - 110
    actions_y_start = 1050

    actions = [
        {"icon": "♥", "text": cfg["likes"], "color": (239, 68, 68, 255)},
        {"icon": "💬", "text": cfg["comments"], "color": (255, 255, 255, 255)},
        {"icon": "↗", "text": "Share", "color": (255, 255, 255, 255)},
        {"icon": "★", "text": "Save", "color": (255, 255, 255, 255)}
    ]

    for idx, act in enumerate(actions):
        cy = actions_y_start + idx * 95
        # Circular frosted backing
        draw.ellipse([actions_x - 10, cy - 10, actions_x + 60, cy + 60], fill=(15, 23, 42, 160), outline=(255, 255, 255, 40), width=1)
        # Icon
        draw.text((actions_x + 12, cy - 4), act["icon"], font=FONT_TITLE, fill=act["color"])
        # Label below
        draw.text((actions_x + 5, cy + 56), act["text"], font=FONT_ICON, fill=(226, 232, 240, 240))

    # Spinning music disc in bottom right
    disc_y = actions_y_start + 4 * 95
    disc_angle = (total_progress * 360 * 3) % 360
    draw.ellipse([actions_x - 8, disc_y - 8, actions_x + 58, disc_y + 58], fill=(15, 23, 42, 220), outline=(20, 184, 166, 220), width=3)
    draw.ellipse([actions_x + 12, disc_y + 12, actions_x + 38, disc_y + 38], fill=(20, 184, 166, 255))

    # 4. Lower-Third Featured Showcase Card
    card_x1 = 28
    card_y1 = 1480
    card_x2 = WIDTH - 150
    card_y2 = 1790

    # Glassmorphism background with shadow
    draw.rounded_rectangle([card_x1, card_y1, card_x2, card_y2], radius=24, fill=(10, 15, 29, 230), outline=(20, 184, 166, 120), width=2)
    # Left accent vertical bar
    draw.rounded_rectangle([card_x1 + 6, card_y1 + 16, card_x1 + 14, card_y2 - 16], radius=4, fill=(20, 184, 166, 255))

    # Category Pill
    tag_w = len(cfg["tag"]) * 14 + 30
    draw.rounded_rectangle([card_x1 + 28, card_y1 + 22, card_x1 + 28 + tag_w, card_y1 + 58], radius=8, fill=(20, 184, 166, 40), outline=(20, 184, 166, 200), width=1)
    draw.text((card_x1 + 42, card_y1 + 27), cfg["tag"], font=FONT_TAG, fill=(45, 212, 191, 255))

    # Title
    draw.text((card_x1 + 28, card_y1 + 72), cfg["title"], font=FONT_TITLE, fill=(255, 255, 255, 255))

    # Description
    draw.text((card_x1 + 28, card_y1 + 138), cfg["desc"], font=FONT_SUBTITLE, fill=(203, 213, 225, 230))

    # Website link CTA at bottom of card
    draw.rounded_rectangle([card_x1 + 28, card_y1 + 215, card_x1 + 440, card_y1 + 265], radius=12, fill=(20, 184, 166, 220))
    draw.text((card_x1 + 44, card_y1 + 224), "Visit clearsky-ai-theta.vercel.app", font=FONT_TAG, fill=(10, 15, 25, 255))

    # Composite overlay on top of base image
    return Image.alpha_composite(base_img, overlay)

def main():
    print(f"Generating Instagram Reel video: {TOTAL_FRAMES} frames ({TOTAL_DURATION:.1f}s)...")
    
    # Launch ffmpeg process
    cmd = [
        FFMPEG_BIN,
        "-y",
        "-f", "rawvideo",
        "-vcodec", "rawvideo",
        "-s", f"{WIDTH}x{HEIGHT}",
        "-pix_fmt", "rgb24",
        "-r", str(FPS),
        "-i", "-",  # pipe from stdin
        "-ss", "00:00:10",  # start 10s into upbeat track
        "-t", f"{TOTAL_DURATION:.2f}",
        "-i", AUDIO_FILE,
        "-c:v", "libx264",
        "-pix_fmt", "yuv420p",
        "-preset", "veryfast",
        "-crf", "20",
        "-c:a", "aac",
        "-b:a", "192k",
        "-af", f"afade=t=in:st=0:d=0.8,afade=t=out:st={TOTAL_DURATION - 1.2:.2f}:d=1.2",
        "-shortest",
        OUTPUT_MP4
    ]

    proc = subprocess.Popen(cmd, stdin=subprocess.PIPE, stdout=subprocess.DEVNULL, stderr=subprocess.PIPE)

    for frame_idx in range(TOTAL_FRAMES):
        scene_idx = min(int(frame_idx / FRAMES_PER_SCENE), len(SCENES_CONFIG) - 1)
        frame_in_scene = frame_idx % FRAMES_PER_SCENE
        total_progress = frame_idx / float(TOTAL_FRAMES)

        # Base image
        base = loaded_images[scene_idx].copy()

        # Subtle Ken Burns zoom effect (1.00 -> 1.04)
        zoom = 1.0 + 0.04 * (frame_in_scene / float(FRAMES_PER_SCENE))
        new_w = int(WIDTH * zoom)
        new_h = int(HEIGHT * zoom)
        scaled = base.resize((new_w, new_h), Image.Resampling.BILINEAR)
        crop_x = (new_w - WIDTH) // 2
        crop_y = (new_h - HEIGHT) // 2
        cropped = scaled.crop((crop_x, crop_y, crop_x + WIDTH, crop_y + HEIGHT))

        # Cross-fade with next scene during last 6 frames (0.2s)
        fade_frames = 6
        if frame_in_scene >= FRAMES_PER_SCENE - fade_frames and scene_idx < len(SCENES_CONFIG) - 1:
            alpha = (frame_in_scene - (FRAMES_PER_SCENE - fade_frames)) / float(fade_frames)
            next_base = loaded_images[scene_idx + 1]
            cropped = Image.blend(cropped, next_base, alpha)

        # Draw overlays
        composed = draw_overlay(cropped, scene_idx, frame_in_scene, total_progress)

        # Convert to RGB24 and pipe to ffmpeg
        rgb_data = composed.convert("RGB").tobytes()
        proc.stdin.write(rgb_data)

        if frame_idx % 60 == 0:
            print(f"Rendered frame {frame_idx}/{TOTAL_FRAMES} ({(frame_idx/TOTAL_FRAMES)*100:.0f}%)")

    proc.stdin.close()
    _, stderr = proc.communicate()

    if proc.returncode != 0:
        print("FFmpeg error:", stderr.decode("utf-8", errors="ignore"))
        sys.exit(1)

    print(f"MP4 Reel successfully created at: {OUTPUT_MP4}")
    
    # Extract standalone MP3 file
    cmd_mp3 = [
        FFMPEG_BIN,
        "-y",
        "-i", OUTPUT_MP4,
        "-vn",
        "-c:a", "libmp3lame",
        "-b:a", "192k",
        OUTPUT_MP3
    ]
    subprocess.run(cmd_mp3, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    print(f"MP3 Audio successfully created at: {OUTPUT_MP3}")

    # Copy to public folder for website serving
    import shutil
    shutil.copy2(OUTPUT_MP4, PUBLIC_VIDEO)
    shutil.copy2(OUTPUT_MP3, PUBLIC_AUDIO)
    print(f"Copied to public web directories.")

if __name__ == "__main__":
    main()
