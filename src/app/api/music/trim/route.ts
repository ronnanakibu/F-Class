import { NextRequest, NextResponse } from 'next/server';
import { isValidAdminKey } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const apiKey =
      req.headers.get('x-api-key') ||
      req.headers.get('authorization')?.replace('Bearer ', '');

    const body = await req.json();

    if (!isValidAdminKey(apiKey || body.apiKey)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Passkey admin tidak valid.' },
        { status: 401 }
      );
    }

    const { videoId, youtubeUrl, startSecond = 0, duration = 30, title, artist } = body;

    const targetUrl =
      youtubeUrl ||
      (videoId ? `https://www.youtube.com/watch?v=${videoId}` : null);

    if (!targetUrl) {
      return NextResponse.json(
        { success: false, error: 'videoId atau youtubeUrl wajib disertakan.' },
        { status: 400 }
      );
    }

    const ytdlpApi = process.env.YTDLP_API_URL || process.env.HF_SPACE_URL;

    if (!ytdlpApi) {
      return NextResponse.json(
        {
          success: false,
          needsMicroservice: true,
          error:
            'Microservice yt-dlp belum terhubung. Konfigurasikan YTDLP_API_URL (Hugging Face Space / server bot) untuk memotong 30 detik audio YouTube otomatis di cloud.',
        },
        { status: 501 }
      );
    }

    const cleanApi = ytdlpApi.replace(/\/+$/, '');
    const trimEndpoint = `${cleanApi}/trim?url=${encodeURIComponent(targetUrl)}&start=${encodeURIComponent(
      startSecond
    )}&duration=${encodeURIComponent(duration)}`;

    const spaceRes = await fetch(trimEndpoint, {
      signal: AbortSignal.timeout(45000), // yt-dlp trim can take 5-15s
    });

    if (!spaceRes.ok) {
      const errText = await spaceRes.text();
      return NextResponse.json(
        {
          success: false,
          error: `Gagal memproses audio dari Space yt-dlp: ${errText || spaceRes.statusText}`,
        },
        { status: spaceRes.status }
      );
    }

    const contentType = spaceRes.headers.get('content-type') || '';
    let audioUrl = '';

    // If Space returns JSON with direct cloud URL
    if (contentType.includes('application/json')) {
      const spaceData = await spaceRes.json();
      audioUrl = spaceData.audioUrl || spaceData.url || '';
    } else {
      // If Space returns audio binary (audio/mpeg, audio/mp4, etc.)
      const arrayBuffer = await spaceRes.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const hfToken = process.env.HF_TOKEN || process.env.HUGGINGFACE_TOKEN;
      const hfRepo = process.env.HF_DATASET_REPO;
      const filename = `yt-${videoId || Date.now()}-${startSecond}s.mp3`;

      // Priority 1: Save trimmed 30s audio to Hugging Face Cloud Dataset
      if (hfToken && hfRepo) {
        try {
          const { uploadFile } = await import('@huggingface/hub');
          const hfPath = `songs/${filename}`;
          await uploadFile({
            repo: { type: 'dataset', name: hfRepo },
            credentials: { accessToken: hfToken },
            file: {
              path: hfPath,
              content: new Blob([buffer]),
            },
          });
          audioUrl = `https://huggingface.co/datasets/${hfRepo}/resolve/main/${hfPath}`;
        } catch (e) {
          console.warn('[TrimAPI] HF upload error, falling back to base64:', e);
        }
      }

      // Priority 2: Base64 fallback if cloud storage is not connected
      if (!audioUrl) {
        audioUrl = `data:audio/mpeg;base64,${buffer.toString('base64')}`;
      }
    }

    return NextResponse.json({
      success: true,
      audioUrl,
      startSecond,
      duration,
      title,
      artist,
      message: `Audio 30 detik (mulai detik ${startSecond}s) berhasil di-generate!`,
    });
  } catch (error: any) {
    console.error('Error trimming music:', error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'Terjadi kesalahan saat memproses audio.',
      },
      { status: 500 }
    );
  }
}
