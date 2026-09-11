import type { Metadata, Viewport } from 'next';
import { Space_Grotesk, Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-heading',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700'],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
});

export const viewport: Viewport = {
  themeColor: '#08090C',
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || 'https://fclass.my.id'
  ),
  title: {
    default: 'CE F — Computer Engineering | Politeknik Negeri Medan',
    template: '%s | CE F Polmed',
  },
  description:
    'The official digital archive, living yearbook, and student showcase of Class F, Computer Engineering (Teknik Komputer), JTKI — Politeknik Negeri Medan. Circuits, Code, and Chaos.',
  applicationName: 'CE F Polmed',
  authors: [
    { name: 'CE F — Politeknik Negeri Medan', url: 'https://github.com/ronnanakibu/F-Class' },
  ],
  creator: 'Class F — Teknik Komputer Polmed',
  publisher: 'Politeknik Negeri Medan',
  keywords: [
    'CE F',
    'Computer Engineering',
    'Teknik Komputer',
    'Politeknik Negeri Medan',
    'Polmed',
    'JTKI',
    'Class F',
    'TK-F',
    'Living Yearbook',
    'Student Portfolio',
  ],
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'id_ID',
    url: '/',
    siteName: 'CE F — Polmed',
    title: 'CE F — Computer Engineering | Politeknik Negeri Medan',
    description:
      'Official digital identity, living yearbook, and portfolio showcase of Class F (Teknik Komputer), JTKI Politeknik Negeri Medan.',
    images: [
      {
        url: '/og.jpg',
        width: 1200,
        height: 630,
        type: 'image/jpeg',
        alt: 'CE F — Computer Engineering Politeknik Negeri Medan',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CE F — Computer Engineering | Politeknik Negeri Medan',
    description:
      'Official digital identity, living yearbook, and portfolio showcase of Class F (Teknik Komputer), JTKI Politeknik Negeri Medan.',
    images: ['/og.jpg'],
    creator: '@ronnanakibu',
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/favicon.ico',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

import { ThemeProvider } from '@/context/ThemeContext';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      suppressHydrationWarning
      className={`${spaceGrotesk.variable} ${inter.variable} ${jetbrainsMono.variable}`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var saved = localStorage.getItem('theme');
                  var theme = saved || 'dark';
                  document.documentElement.setAttribute('data-theme', theme);
                  if (theme === 'dark') {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.add('light');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="antialiased">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
