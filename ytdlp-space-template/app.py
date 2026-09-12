import os
import tempfile
import subprocess
from fastapi import FastAPI, Query, HTTPException
from fastapi.responses import FileResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import yt_dlp

app = FastAPI(title="CE F Music Trimmer API (yt-dlp)")

# Enable CORS for all origins (frontend Next.js & Admin)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_cookies_path():
    """Extract Netscape cookies from YT_COOKIES environment variable if configured."""
    cookies_content = os.environ.get("YT_COOKIES")
    if not cookies_content:
        return None
    
    tmp = tempfile.NamedTemporaryFile(mode="w", delete=False, suffix=".txt")
    tmp.write(cookies_content)
    tmp.close()
    return tmp.name

@app.get("/")
def root():
    return {
        "status": "online",
        "service": "yt-dlp Audio Trimmer for Class F Portal",
        "endpoints": ["/search?q=...", "/trim?url=...&start=0&duration=30"]
    }

@app.get("/search")
def search_youtube(q: str = Query(..., description="Query judul lagu / penyanyi"), limit: int = 8):
    """Cari lagu di YouTube langsung dengan metadata lengkap (judul, artist, thumbnail, durasi)."""
    try:
        ydl_opts = {
            'format': 'bestaudio/best',
            'noplaylist': True,
            'quiet': True,
            'skip_download': True,
            'extract_flat': True,
        }
        
        cookies_file = get_cookies_path()
        if cookies_file:
            ydl_opts['cookiefile'] = cookies_file

        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            search_query = f"ytsearch{limit}:{q}"
            info = ydl.extract_info(search_query, download=False)
            
            results = []
            for entry in info.get('entries', []):
                dur_sec = entry.get('duration') or 180
                mins = int(dur_sec // 60)
                secs = int(dur_sec % 60)
                duration_text = f"{mins}:{secs:02d}"

                video_id = entry.get('id')
                results.append({
                    "id": f"yt-{video_id}",
                    "videoId": video_id,
                    "title": entry.get('title'),
                    "artist": entry.get('uploader') or entry.get('channel') or "YouTube",
                    "album": "YouTube Music / Single",
                    "coverUrl": f"https://img.youtube.com/vi/{video_id}/hqdefault.jpg",
                    "youtubeUrl": f"https://www.youtube.com/watch?v={video_id}",
                    "durationSeconds": dur_sec,
                    "durationText": duration_text,
                    "provider": "youtube"
                })

            if cookies_file and os.path.exists(cookies_file):
                os.unlink(cookies_file)

            return {"success": True, "query": q, "count": len(results), "results": results}
    except Exception as e:
        return JSONResponse(status_code=500, content={"success": False, "error": str(e)})

@app.get("/trim")
def trim_audio(
    url: str = Query(..., description="YouTube URL atau videoId"),
    start: int = Query(0, description="Detik mulai pemotongan (contoh: 45)"),
    duration: int = Query(30, description="Durasi potongan audio (default 30 detik)")
):
    """Download audio stream dari YouTube dan potong tepat 30 detik menggunakan ffmpeg."""
    target_url = url
    if not target_url.startswith("http"):
        target_url = f"https://www.youtube.com/watch?v={url}"

    temp_dir = tempfile.mkdtemp()
    raw_audio_path = os.path.join(temp_dir, "raw_audio.opus")
    output_mp3_path = os.path.join(temp_dir, f"clip_{start}_{duration}.mp3")

    cookies_file = get_cookies_path()

    try:
        # 1. Download stream audio dengan yt-dlp
        ydl_opts = {
            'format': 'bestaudio/best',
            'outtmpl': raw_audio_path,
            'quiet': True,
            'noplaylist': True,
        }
        if cookies_file:
            ydl_opts['cookiefile'] = cookies_file

        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            ydl.download([target_url])

        if not os.path.exists(raw_audio_path):
            raise HTTPException(status_code=500, detail="Gagal mengunduh audio dari YouTube.")

        # 2. Potong tepat 30 detik menggunakan ffmpeg
        # ffmpeg -ss {start} -t {duration} -i raw_audio -c:a libmp3lame -b:a 192k output.mp3
        ffmpeg_cmd = [
            "ffmpeg", "-y",
            "-ss", str(start),
            "-t", str(duration),
            "-i", raw_audio_path,
            "-c:a", "libmp3lame",
            "-b:a", "192k",
            output_mp3_path
        ]
        
        proc = subprocess.run(ffmpeg_cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        if proc.returncode != 0:
            raise HTTPException(status_code=500, detail=f"FFmpeg error: {proc.stderr.decode('utf-8', 'ignore')}")

        if cookies_file and os.path.exists(cookies_file):
            os.unlink(cookies_file)

        return FileResponse(
            output_mp3_path,
            media_type="audio/mpeg",
            filename=f"clip-{start}s-30s.mp3"
        )
    except Exception as e:
        if cookies_file and os.path.exists(cookies_file):
            os.unlink(cookies_file)
        return JSONResponse(status_code=500, content={"success": False, "error": str(e)})
