# CE F — Class F Digital Identity Website

> **"Human first. Technology second."**  
> An editorial digital home, living yearbook, and cultural showcase of Computer Engineering students (Class F) at Politeknik Negeri Medan.

[![Next.js](https://img.shields.io/badge/Next.js-16.3.4-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2.8-blue?style=for-the-badge&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38bdf8?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)

---

## 🏛 Academic Overview

- **Institution:** Politeknik Negeri Medan (Polmed)
- **Department:** Jurusan Teknik Komputer dan Informatika (JTKI)
- **Study Program:** Program Studi Teknik Komputer (Computer Engineering)
- **Class:** Class F (CE F / TK-F)

---

## ✨ Features & Sections

1. **Hero Header:** Interactive status, live local time, editorial typography, and quick navigation.
2. **Manifesto & Statistics:** Department identity, class creed, animated counters for active students, repositories, coffee cups, and projects.
3. **Student Directory & Living Yearbook:**
   - Real-time search by name, role, or skill.
   - Curated category filters (`All`, `Hardware`, `Software`, `IoT`, `AI/ML`, `Security`).
   - Detailed modal profile with bios, tech stack tags, and social media links.
4. **Interactive Timeline:** Semester milestones, practicum highlights, and upcoming achievements.
5. **Class Gallery:** Grid with lightbox zoom view capturing moments, lab work, and memories.
6. **Project Showcase:** Highlights of hardware prototypes, robotics, embedded systems, and software platforms.
7. **Culture & Memory Bank:** Inside jokes, lab quotes, class traditions, and memorable anecdotes.
8. **Terminal Easter Egg:** Interactive developer console modal (`Ctrl + ~` / Terminal button) with custom commands (`help`, `students`, `projects`, `quote`, `clear`).
9. **Footer:** Quick navigation, social links, copyright, and Polmed JTKI credits.
10. **Rich Open Graph & Social Previews:** Custom optimized 1200x630 banner for WhatsApp, Telegram, Discord, and Instagram bio previews with Next.js App Router metadata.

---

## 🛠 Tech Stack

- **Framework:** [Next.js 16](https://nextjs.org/) (App Router, React 19)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/) with custom CSS variables & fluid typography
- **Animations:** [Framer Motion](https://www.framer.com/motion/)
- **Icons:** [Lucide React](https://lucide.dev/)
- **Language:** [TypeScript](https://www.typescriptlang.org/)

---

## 🚀 Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/ronnanakibu/F-Class.git
cd F-Class
```

### 2. Install dependencies
```bash
npm install
```

### 3. Run development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Build for Production
```bash
npm run build
npm run start
```

---

## 📁 Project Structure

```text
fclass/
├── public/              # Static assets and icons
├── src/
│   ├── app/             # Next.js App Router (layout, page, globals.css)
│   ├── components/      # UI components (Hero, Students, Timeline, Projects, etc.)
│   ├── data/            # Dynamic data sources (students.ts, projects.ts, etc.)
│   └── types/           # TypeScript interfaces & models
├── package.json
└── README.md
```

---

## 🤝 Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

---

## 📄 License

Created with ❤️ by **Class F — Teknik Komputer, Politeknik Negeri Medan**.
