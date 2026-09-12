import { NextRequest, NextResponse } from 'next/server';
import { readStorageFile, writeStorageFile } from '@/lib/serverStorage';

const RELATIVE_PATH = 'src/data/site-content.json';
const API_SECRET = process.env.STORY_BOT_SECRET || 'cef2024';

const defaultContent = {
  hero: {
    headlinePart1: 'KELAS YANG ISINYA',
    headlinePart2: 'LITTLE LITTLE GAGAP.',
    subtitle: 'Computer Engineering — Class F',
    badgeCode: 'CE — F',
    badgeLabel: 'TK-F POLMED',
    mockupImage: '/hero-mockup.jpg',
  },
  manifesto: {
    tagline: 'Circuits, Code, and Chaos.',
    quote:
      'Setiap gerbang logika yang kami susun, setiap baris kode yang kami debug hingga dini hari—adalah bukti bahwa kami bukan sekadar belajar teknologi, kami membentuk masa depan.',
    description:
      'Kami adalah kelas F dari Program Studi Teknik Komputer Politeknik Negeri Medan, Angkatan 2025. Datang dari berbagai daerah dan disatukan di sini, kami punya satu tujuan: belajar bertumbuh, dan merintis jalan menuju masa depan yang kami impikan.',
    statProjects: 12,
    statHours: 1440,
  },
  footer: {
    tagline: 'Circuits, Code, and Chaos.',
    copyright: 'Class F — Computer Engineering POLMED 2025',
    instagramUrl: 'https://instagram.com/comeinone.f',
  },
};

// GET /api/site-content - Retrieve website-wide texts and settings
export async function GET() {
  try {
    const raw = await readStorageFile(
      RELATIVE_PATH,
      JSON.stringify(defaultContent, null, 2)
    );
    const content = JSON.parse(raw);
    return NextResponse.json({ success: true, content });
  } catch {
    return NextResponse.json({ success: true, content: defaultContent });
  }
}

// POST /api/site-content - Update website texts and settings
export async function POST(req: NextRequest) {
  try {
    const apiKey =
      req.headers.get('x-api-key') ||
      req.headers.get('authorization')?.replace('Bearer ', '');

    const body = await req.json();

    if ((apiKey || body.apiKey) !== API_SECRET) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Passkey tidak valid.' },
        { status: 401 }
      );
    }

    const { hero, manifesto, footer } = body;

    const updatedContent = {
      hero: {
        ...defaultContent.hero,
        ...(hero || {}),
      },
      manifesto: {
        ...defaultContent.manifesto,
        ...(manifesto || {}),
      },
      footer: {
        ...defaultContent.footer,
        ...(footer || {}),
      },
    };

    const result = await writeStorageFile(
      RELATIVE_PATH,
      JSON.stringify(updatedContent, null, 2)
    );

    return NextResponse.json({
      success: true,
      message: 'Konten website (God Mode) berhasil diperbarui!',
      isReadOnlyFs: result.isReadOnlyFs,
      content: updatedContent,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Server error' },
      { status: 500 }
    );
  }
}
