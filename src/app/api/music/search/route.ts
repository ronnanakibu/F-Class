import { NextRequest, NextResponse } from 'next/server';

interface ITunesTrack {
  trackId: number;
  trackName: string;
  artistName: string;
  collectionName?: string;
  artworkUrl100?: string;
  previewUrl?: string;
  trackViewUrl?: string;
  trackTimeMillis?: number;
}

export const dynamic = 'force-dynamic';

function parseDurationToSeconds(durationText?: string): number {
  if (!durationText) return 0;
  // YouTube can return "6:33" or "6.33" — normalize both separators
  const normalized = durationText.trim().replace(/\./g, ':');
  const parts = normalized.split(':').map((p) => parseInt(p, 10));
  if (parts.length === 2) {
    return (parts[0] || 0) * 60 + (parts[1] || 0);
  } else if (parts.length === 3) {
    return (parts[0] || 0) * 3600 + (parts[1] || 0) * 60 + (parts[2] || 0);
  }
  return 0;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q')?.trim();
    const spotifyUrl = searchParams.get('url')?.trim();
    const provider = searchParams.get('provider')?.toLowerCase() || 'itunes';

    if (!query && !spotifyUrl) {
      return NextResponse.json(
        { success: false, error: 'Parameter pencarian q atau url wajib diisi.' },
        { status: 400 }
      );
    }

    let searchTerm = query || '';

    // If Spotify URL is provided, fetch metadata from Spotify oEmbed first
    if (spotifyUrl && spotifyUrl.includes('spotify.com')) {
      try {
        const oembedRes = await fetch(
          `https://open.spotify.com/oembed?url=${encodeURIComponent(spotifyUrl)}`
        );
        if (oembedRes.ok) {
          const oembedData = await oembedRes.json();
          if (oembedData.title) {
            searchTerm = oembedData.title.replace(/by\s+.*$/i, '').trim();
          }
        }
      } catch (err) {
        console.warn('Spotify oEmbed fetch failed, falling back:', err);
      }
    }

    if (!searchTerm) {
      return NextResponse.json(
        { success: false, error: 'Tidak dapat menemukan judul lagu dari URL yang diberikan.' },
        { status: 400 }
      );
    }

    // ──────────────────────────────────────────────
    // PROVIDER 1: YOUTUBE (yt-dlp Engine)
    // ──────────────────────────────────────────────
    if (provider === 'youtube') {
      const ytdlpApi = process.env.YTDLP_API_URL || process.env.HF_SPACE_URL;

      // Check external microservice / Hugging Face Space if configured
      if (ytdlpApi) {
        try {
          const cleanUrl = ytdlpApi.replace(/\/+$/, '');
          const spaceRes = await fetch(`${cleanUrl}/search?q=${encodeURIComponent(searchTerm)}`, {
            signal: AbortSignal.timeout(6000),
          });
          if (spaceRes.ok) {
            const spaceData = await spaceRes.json();
            if (spaceData.results && Array.isArray(spaceData.results)) {
              return NextResponse.json({
                success: true,
                query: searchTerm,
                provider: 'youtube',
                engine: 'ytdlp-space',
                count: spaceData.results.length,
                results: spaceData.results,
              });
            }
          }
        } catch (e) {
          console.warn('[MusicAPI] Space search fallback to direct YouTube search:', e);
        }
      }

      // Fast Direct YouTube Search Fallback (Zero external dependencies)
      try {
        const ytSearchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(searchTerm)}`;
        const ytRes = await fetch(ytSearchUrl, {
          signal: AbortSignal.timeout(8000),
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
          },
        });

        if (ytRes.ok) {
          const html = await ytRes.text();
          const match = html.match(/var ytInitialData = ({.*?});<\/script>/);
          if (match) {
            const data = JSON.parse(match[1]);
            const contents =
              data.contents?.twoColumnSearchResultsRenderer?.primaryContents?.sectionListRenderer
                ?.contents?.[0]?.itemSectionRenderer?.contents || [];

            const results = [];
            for (const item of contents) {
              const v = item.videoRenderer;
              if (v && v.videoId) {
                const videoId = v.videoId;
                const title = v.title?.runs?.[0]?.text || v.title?.simpleText || 'Unknown Video';
                const artist = v.ownerText?.runs?.[0]?.text || 'YouTube Creator';
                const durationText = v.lengthText?.simpleText || '03:30';
                const durationSeconds = parseDurationToSeconds(durationText);
                const coverUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
                const youtubeUrl = `https://www.youtube.com/watch?v=${videoId}`;

                results.push({
                  id: `yt-${videoId}`,
                  videoId,
                  title,
                  artist,
                  album: 'YouTube Music / Single',
                  coverUrl,
                  audioUrl: '', // Will be trimmed / streamed via yt-dlp
                  youtubeUrl,
                  spotifyUrl: `https://open.spotify.com/search/${encodeURIComponent(title + ' ' + artist)}`,
                  durationMs: durationSeconds * 1000,
                  durationSeconds,
                  durationText,
                  provider: 'youtube',
                });

                if (results.length >= 8) break;
              }
            }

            if (results.length > 0) {
              return NextResponse.json({
                success: true,
                query: searchTerm,
                provider: 'youtube',
                engine: 'direct-yt',
                count: results.length,
                results,
              });
            }
          }
        }
      } catch (ytErr) {
        console.warn('[MusicAPI] Direct YouTube search error:', ytErr);
      }
    }

    // ──────────────────────────────────────────────
    // PROVIDER 2: APPLE ITUNES (Default, 30s Official Preview)
    // ──────────────────────────────────────────────
    const itunesUrl = `https://itunes.apple.com/search?term=${encodeURIComponent(
      searchTerm
    )}&entity=song&limit=10`;

    const itunesRes = await fetch(itunesUrl, {
      signal: AbortSignal.timeout(8000),
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    if (!itunesRes.ok) {
      return NextResponse.json(
        { success: false, error: 'Gagal menghubungi server pencarian musik iTunes.' },
        { status: 502 }
      );
    }

    const itunesData = await itunesRes.json();
    const results = (itunesData.results || []).map((track: ITunesTrack) => {
      const hdCover = track.artworkUrl100
        ? track.artworkUrl100.replace('100x100bb', '600x600bb')
        : '';

      const durSec = Math.round((track.trackTimeMillis || 180000) / 1000);
      const mins = Math.floor(durSec / 60);
      const secs = durSec % 60;
      const durationText = `${mins}:${secs < 10 ? '0' : ''}${secs}`;

      return {
        id: String(track.trackId),
        title: track.trackName,
        artist: track.artistName,
        album: track.collectionName || 'Single / Unknown Album',
        coverUrl: hdCover,
        audioUrl: track.previewUrl || '',
        appleMusicUrl: track.trackViewUrl || '',
        spotifyUrl:
          spotifyUrl && spotifyUrl.includes('spotify.com')
            ? spotifyUrl
            : `https://open.spotify.com/search/${encodeURIComponent(
                track.trackName + ' ' + track.artistName
              )}`,
        durationMs: track.trackTimeMillis || 0,
        durationSeconds: durSec,
        durationText,
        provider: 'itunes',
      };
    });

    return NextResponse.json({
      success: true,
      query: searchTerm,
      provider: 'itunes',
      count: results.length,
      results,
    });
  } catch (error) {
    console.error('Error searching music metadata:', error);
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan saat mencari lagu.' },
      { status: 500 }
    );
  }
}
