import type { Metadata } from 'next';
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

export const metadata: Metadata = {
  title: 'CE F — Computer Engineering | Politeknik Negeri Medan',
  description:
    'The official digital archive and student showcase of Class F, Computer Engineering (Teknik Komputer), JTKI — Politeknik Negeri Medan. Circuits, Code, and Chaos.',
  keywords: [
    'CE F',
    'Computer Engineering',
    'Teknik Komputer',
    'Politeknik Negeri Medan',
    'Polmed',
    'JTKI',
    'Class F',
    'TK-F',
  ],
  authors: [{ name: 'CE F — Politeknik Negeri Medan' }],
  openGraph: {
    type: 'website',
    locale: 'id_ID',
    title: 'CE F — Computer Engineering | Politeknik Negeri Medan',
    description:
      'The official digital archive and student showcase of Class F, Computer Engineering, Polmed. Circuits, Code, and Chaos.',
    siteName: 'CE F — Polmed',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CE F — Computer Engineering | Politeknik Negeri Medan',
    description:
      'The official digital archive and student showcase of Class F, Computer Engineering, Polmed.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${spaceGrotesk.variable} ${inter.variable} ${jetbrainsMono.variable}`}
    >
      <body className="antialiased">{children}</body>
    </html>
  );
}
