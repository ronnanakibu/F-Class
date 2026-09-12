import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const rawEndpoint = searchParams.get('endpoint');

  if (!rawEndpoint) {
    return NextResponse.json(
      { success: false, online: false, error: 'Parameter "endpoint" wajib diisi.' },
      { status: 400 }
    );
  }

  let cleanEndpoint = rawEndpoint.trim().replace(/\/+$/, '');
  if (!cleanEndpoint.startsWith('http://') && !cleanEndpoint.startsWith('https://')) {
    cleanEndpoint = `http://${cleanEndpoint}`;
  }

  const pingTargets = [
    `${cleanEndpoint}/status`,
    `${cleanEndpoint}/api/v2/system/status`,
    `${cleanEndpoint}/`,
  ];

  let isOnline = false;
  let latency = 0;
  let statusInfo: any = null;
  let lastError = '';

  const tStart = Date.now();

  for (const targetUrl of pingTargets) {
    try {
      const pingRes = await fetch(targetUrl, {
        method: 'GET',
        headers: {
          Accept: 'application/json, text/plain, */*',
          'User-Agent': 'CE-Class-BotPing/1.0',
        },
        signal: AbortSignal.timeout(5000),
      });

      latency = Date.now() - tStart;

      // Status 200, 301, 302, 307, 308 or even 401 means server is alive!
      if (pingRes.ok || (pingRes.status >= 300 && pingRes.status < 400) || pingRes.status === 401) {
        isOnline = true;
        try {
          const contentType = pingRes.headers.get('content-type') || '';
          if (contentType.includes('application/json')) {
            statusInfo = await pingRes.json();
          }
        } catch {
          // ignore parsing error
        }
        break;
      }
    } catch (err: any) {
      lastError = err?.message || 'Timeout / Connection refused';
    }
  }

  if (isOnline) {
    return NextResponse.json({
      success: true,
      online: true,
      latency,
      endpoint: cleanEndpoint,
      statusInfo: statusInfo || { status: 'ok' },
    });
  }

  return NextResponse.json(
    {
      success: false,
      online: false,
      latency: Date.now() - tStart,
      endpoint: cleanEndpoint,
      error: `Bot server tidak merespons: ${lastError || 'Unreachable'}`,
    },
    { status: 504 }
  );
}
