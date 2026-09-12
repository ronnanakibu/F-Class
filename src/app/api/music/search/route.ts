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

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q')?.trim();
    const spotifyUrl = searchParams.get('url')?.trim();

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
          // Title usually contains "Song Title" or "Song Title by Artist"
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

    // Query Apple iTunes Search API (100% free, no API key needed, includes 30s playable audio preview)
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
      // Replace 100x100 thumbnail with high resolution 600x600 artwork
      const hdCover = track.artworkUrl100
        ? track.artworkUrl100.replace('100x100bb', '600x600bb')
        : '';

      return {
        id: String(track.trackId),
        title: track.trackName,
        artist: track.artistName,
        album: track.collectionName || 'Single / Unknown Album',
        coverUrl: hdCover,
        audioUrl: track.previewUrl || '',
        appleMusicUrl: track.trackViewUrl || '',
        spotifyUrl: spotifyUrl && spotifyUrl.includes('spotify.com')
          ? spotifyUrl
          : `https://open.spotify.com/search/${encodeURIComponent(track.trackName + ' ' + track.artistName)}`,
        durationMs: track.trackTimeMillis || 0,
      };
    });

    return NextResponse.json({
      success: true,
      query: searchTerm,
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
