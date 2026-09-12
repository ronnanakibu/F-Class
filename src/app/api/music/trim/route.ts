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

    const {
      videoId,
      youtubeUrl,
      startSecond = 0,
      duration = 30,
      title,
      artist,
      botEndpoint,
    } = body;

    const targetUrl =
      youtubeUrl ||
      (videoId ? `https://www.youtube.com/watch?v=${videoId}` : null);

    if (!targetUrl) {
      return NextResponse.json(
        { success: false, error: 'videoId atau youtubeUrl wajib disertakan.' },
        { status: 400 }
      );
    }

    const rawEndpoint =
      (botEndpoint && typeof botEndpoint === 'string' && botEndpoint.trim()) ||
      process.env.YTDLP_API_URL ||
      process.env.HF_SPACE_URL;

    if (!rawEndpoint) {
      return NextResponse.json(
        {
          success: false,
          needsMicroservice: true,
          error:
            'Microservice yt-dlp / Bot endpoint belum terhubung. Silakan masukkan URL bot endpoint kamu atau konfigurasi YTDLP_API_URL untuk memotong 30 detik audio YouTube otomatis.',
        },
        { status: 501 }
      );
    }

    const cleanApi = rawEndpoint.replace(/\/+$/, '');

    // Determine candidate endpoints:
    let candidateUrls: string[] = [];
    if (cleanApi.includes('/trim')) {
      const sep = cleanApi.includes('?') ? '&' : '?';
      candidateUrls = [
        `${cleanApi}${sep}url=${encodeURIComponent(targetUrl)}&start=${encodeURIComponent(
          startSecond
        )}&duration=${encodeURIComponent(duration)}`,
      ];
    } else {
      candidateUrls = [
        `${cleanApi}/api/yt/trim?url=${encodeURIComponent(targetUrl)}&start=${encodeURIComponent(
          startSecond
        )}&duration=${encodeURIComponent(duration)}`,
        `${cleanApi}/trim?url=${encodeURIComponent(targetUrl)}&start=${encodeURIComponent(
          startSecond
        )}&duration=${encodeURIComponent(duration)}`,
      ];
    }

    let serviceRes: Response | null = null;
    let lastError = '';

    for (const url of candidateUrls) {
      try {
        const res = await fetch(url, {
          signal: AbortSignal.timeout(60000), // audio trim can take 5-25s
        });
        if (res.ok) {
          serviceRes = res;
          break;
        } else if (res.status !== 404) {
          const errText = await res.text();
          lastError = errText || res.statusText;
          break;
        }
      } catch (err: any) {
        lastError = err?.message || 'Connection failed';
      }
    }

    if (!serviceRes || !serviceRes.ok) {
      return NextResponse.json(
        {
          success: false,
          error: `Gagal memproses audio dari Bot/Microservice endpoint: ${lastError || 'Endpoint tidak merespons'}`,
        },
        { status: 502 }
      );
    }

    const contentType = serviceRes.headers.get('content-type') || '';
    let audioUrl = '';

    // If Service returns JSON with direct cloud URL
    if (contentType.includes('application/json')) {
      const serviceData = await serviceRes.json();
      audioUrl = serviceData.audioUrl || serviceData.url || '';
    } else {
      // If Service returns audio binary (audio/mpeg, audio/mp4, etc.)
      const arrayBuffer = await serviceRes.arrayBuffer();
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
