---
title: CE F Music Trimmer API
emoji: 🎵
colorFrom: blue
colorTo: indigo
sdk: docker
app_port: 7860
pinned: false
---

# CE F Audio Trimmer Microservice (yt-dlp + FFmpeg)

Microservice gratis untuk memotong audio 30 detik dari YouTube menggunakan `yt-dlp` dan `ffmpeg`.

## Endpoints:
- `GET /search?q=judul+lagu`: Mencari video di YouTube dengan metadata (judul, artist, thumbnail, durasi).
- `GET /trim?url=...&start=45&duration=30`: Mengunduh dan memotong audio tepat 30 detik (MP3 192kbps).

## Konfigurasi Cookies YouTube (Agar Tidak Diblokir):
Di Settings Space Hugging Face:
1. Buka tab **Settings** -> **Variables and secrets**.
2. Tambahkan **New secret**:
   - Name: `YT_COOKIES`
   - Value: Paste isi file cookies YouTube dari ekstensi browser (*Get cookies.txt LOCALLY*).
