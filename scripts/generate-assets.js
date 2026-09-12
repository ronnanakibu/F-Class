const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// Ensure directories exist
const dirs = [
  path.join(process.cwd(), 'public', 'projects'),
  path.join(process.cwd(), 'public', 'gallery'),
  path.join(process.cwd(), 'public', 'stories'),
];

dirs.forEach((d) => {
  if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
});

function escapeXml(str) {
  return (str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function createSvgBanner(title, subtitle, tag, color1, color2, iconType, isStory = false) {
  const width = isStory ? 720 : 1280;
  const height = isStory ? 1280 : 720;

  const safeTitle = escapeXml(title);
  const safeSubtitle = escapeXml(subtitle);
  const safeTag = escapeXml((tag || '').toUpperCase());

  return `
  <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#0a0b10" />
        <stop offset="50%" stop-color="#12131c" />
        <stop offset="100%" stop-color="#050608" />
      </linearGradient>
      <linearGradient id="accentGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${color1}" />
        <stop offset="100%" stop-color="${color2}" />
      </linearGradient>
      <radialGradient id="glow" cx="50%" cy="${isStory ? '40%' : '50%'}" r="50%">
        <stop offset="0%" stop-color="${color1}" stop-opacity="0.3" />
        <stop offset="100%" stop-color="${color1}" stop-opacity="0" />
      </radialGradient>
      <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255, 255, 255, 0.04)" stroke-width="1"/>
      </pattern>
    </defs>

    <!-- Base background -->
    <rect width="${width}" height="${height}" fill="url(#bgGrad)" />
    
    <!-- Grid overlay -->
    <rect width="${width}" height="${height}" fill="url(#grid)" />

    <!-- Ambient glow -->
    <circle cx="${width / 2}" cy="${height / 2}" r="${width * 0.4}" fill="url(#glow)" />

    <!-- Cybernetic circuit lines -->
    <g stroke="${color1}" stroke-opacity="0.2" stroke-width="1.5" fill="none">
      <path d="M 40 40 L 120 40 L 160 80 L 300 80" />
      <circle cx="300" cy="80" r="3" fill="${color1}" />
      <path d="M ${width - 40} ${height - 40} L ${width - 120} ${height - 40} L ${width - 160} ${height - 80} L ${width - 300} ${height - 80}" />
      <circle cx="${width - 300}" cy="${height - 80}" r="3" fill="${color2}" />
    </g>

    <!-- Center Icon Circle -->
    <g transform="translate(${width / 2}, ${isStory ? height * 0.38 : height * 0.42})">
      <circle r="${isStory ? 70 : 80}" fill="#0f111a" stroke="url(#accentGrad)" stroke-width="2" />
      <circle r="${isStory ? 60 : 70}" fill="none" stroke="${color1}" stroke-opacity="0.3" stroke-width="1" stroke-dasharray="4,4" />
      
      <!-- Icon symbol -->
      <text x="0" y="16" text-anchor="middle" font-size="${isStory ? 48 : 52}" font-family="system-ui, -apple-system, sans-serif" fill="${color1}">
        ${iconType}
      </text>
    </g>

    <!-- Tag badge -->
    <g transform="translate(${width / 2}, ${isStory ? height * 0.52 : height * 0.62})">
      <rect x="-100" y="-18" width="200" height="36" rx="18" fill="rgba(0,0,0,0.6)" stroke="${color1}" stroke-opacity="0.5" stroke-width="1" />
      <text x="0" y="5" text-anchor="middle" font-family="'Courier New', Courier, monospace" font-weight="bold" font-size="12" letter-spacing="2" fill="${color1}">
        ${safeTag}
      </text>
    </g>

    <!-- Title and subtitle -->
    <text x="${width / 2}" y="${isStory ? height * 0.62 : height * 0.74}" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-weight="800" font-size="${isStory ? 34 : 40}" fill="#ffffff" letter-spacing="-0.5">
      ${safeTitle}
    </text>
    <text x="${width / 2}" y="${isStory ? height * 0.67 : height * 0.81}" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="${isStory ? 18 : 20}" fill="#94a3b8" max-width="600">
      ${safeSubtitle}
    </text>

    <!-- Footer watermark -->
    <text x="${width / 2}" y="${height - 35}" text-anchor="middle" font-family="'Courier New', Courier, monospace" font-size="12" letter-spacing="3" fill="#64748b">
      COMPUTER ENGINEERING • CLASS F • POLMED
    </text>
  </svg>
  `;
}

async function generateAll() {
  const tasks = [
    // Projects
    {
      path: 'public/projects/englishquest.jpg',
      title: 'EnglishQuest',
      subtitle: 'Gamified Interactive English Learning Platform',
      tag: 'WEB DEVELOPMENT',
      c1: '#00f0ff',
      c2: '#3b82f6',
      icon: '🎮',
      isStory: false,
    },
    {
      path: 'public/projects/whatsapp-bot.jpg',
      title: 'WhatsApp Bots WABOT2.0',
      subtitle: 'Multi-Device Automation & Smart Assistant Engine',
      tag: 'AI & AUTOMATION',
      c1: '#10b981',
      c2: '#059669',
      icon: '🤖',
      isStory: false,
    },

    // Gallery Slideshow
    {
      path: 'public/gallery/slide-orientation.jpg',
      title: 'The Genesis',
      subtitle: 'Hari Pertama di Kelas Computer Engineering F',
      tag: 'ORIENTATION',
      c1: '#3b82f6',
      c2: '#6366f1',
      icon: '🎓',
      isStory: false,
    },
    {
      path: 'public/gallery/slide-digital-logic.jpg',
      title: 'Digital Logic & Hardware',
      subtitle: 'Gerbang Logika, Breadboard & Aroma Solder',
      tag: 'HARDWARE LAB',
      c1: '#10b981',
      c2: '#14b8a6',
      icon: '⚡',
      isStory: false,
    },
    {
      path: 'public/gallery/slide-programming.jpg',
      title: 'Coding Laboratory',
      subtitle: 'Pemrograman Dasar, Algoritma & Pointer C',
      tag: 'CODING LAB',
      c1: '#f59e0b',
      c2: '#d97706',
      icon: '💻',
      isStory: false,
    },
    {
      path: 'public/gallery/slide-uas.jpg',
      title: 'UAS Semester 1',
      subtitle: 'Begadang Marathon & Solidaritas Tanpa Batas',
      tag: 'MILESTONE',
      c1: '#8b5cf6',
      c2: '#a855f7',
      icon: '🏆',
      isStory: false,
    },
    {
      path: 'public/gallery/slide-esp32.jpg',
      title: 'Mikrokontroler & ESP32',
      subtitle: 'Rancang Bangun Sistem Tertanam & Sensor',
      tag: 'EMBEDDED ERA',
      c1: '#ec4899',
      c2: '#f43f5e',
      icon: '🔌',
      isStory: false,
    },
    {
      path: 'public/gallery/slide-iot.jpg',
      title: 'IoT Showcase & Prototyping',
      subtitle: 'Integrasi Cloud, Hardware, & Sensor Cerdas',
      tag: 'SHOWCASE',
      c1: '#06b6d4',
      c2: '#0284c7',
      icon: '🚀',
      isStory: false,
    },
    {
      path: 'public/gallery/slide-future.jpg',
      title: 'The Journey Continues',
      subtitle: 'Langkah Lebih Besar di Semester Mendatang',
      tag: 'NEXT CHAPTER',
      c1: '#3b82f6',
      c2: '#00f0ff',
      icon: '✨',
      isStory: false,
    },

    // Stories (Vertical 9:16)
    {
      path: 'public/stories/story-1.jpg',
      title: 'Praktikum Malam',
      subtitle: 'ESP32 Akhirnya Nyala di Lab 3',
      tag: 'PRAKTIKUM',
      c1: '#10b981',
      c2: '#00f0ff',
      icon: '🔌',
      isStory: true,
    },
    {
      path: 'public/stories/story-2.jpg',
      title: 'Kantin & Chill',
      subtitle: 'Vibes Santai Setelah Kuis Kalkulus',
      tag: 'KANTIN & CHILL',
      c1: '#f59e0b',
      c2: '#ef4444',
      icon: '☕',
      isStory: true,
    },
    {
      path: 'public/stories/story-3.jpg',
      title: 'IoT Showcase',
      subtitle: 'Pameran Prototipe Cerdas Kelas F',
      tag: 'PROJECT IOT',
      c1: '#00f0ff',
      c2: '#3b82f6',
      icon: '🚀',
      isStory: true,
    },
    {
      path: 'public/stories/story-4.jpg',
      title: 'Foto Bersama',
      subtitle: 'Presentasi Proyek Sistem Tertanam',
      tag: 'EVENT',
      c1: '#a855f7',
      c2: '#ec4899',
      icon: '🎉',
      isStory: true,
    },
    {
      path: 'public/stories/story-5.jpg',
      title: 'Lab Chaos',
      subtitle: 'Resistor Berasap di Meja Praktikum',
      tag: 'CHAOS',
      c1: '#ef4444',
      c2: '#f97316',
      icon: '🔥',
      isStory: true,
    },
    {
      path: 'public/stories/story-6.jpg',
      title: 'Midnight Coding',
      subtitle: 'Sesi Debugging Hingga Dini Hari',
      tag: 'PRAKTIKUM',
      c1: '#3b82f6',
      c2: '#8b5cf6',
      icon: '💻',
      isStory: true,
    },
  ];

  for (const t of tasks) {
    const svg = createSvgBanner(t.title, t.subtitle, t.tag, t.c1, t.c2, t.icon, t.isStory);
    const targetFile = path.join(process.cwd(), t.path);
    await sharp(Buffer.from(svg))
      .jpeg({ quality: 88, mozjpeg: true })
      .toFile(targetFile);
    console.log(`Generated: ${t.path}`);

    // If story, also copy to public/story-X.jpg as alias to prevent relative path 404
    if (t.isStory) {
      const aliasName = path.basename(t.path);
      const aliasFile = path.join(process.cwd(), 'public', aliasName);
      fs.copyFileSync(targetFile, aliasFile);
    }
  }

  console.log('All image assets successfully generated with zero 404s!');
}

generateAll().catch(console.error);
