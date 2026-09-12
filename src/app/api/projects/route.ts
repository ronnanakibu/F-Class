import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import type { Project } from '@/types';

const PROJECTS_FILE = path.join(process.cwd(), 'src', 'data', 'projects.json');
const API_SECRET = process.env.STORY_BOT_SECRET || 'cef2024';

async function getProjects(): Promise<Project[]> {
  try {
    const data = await fs.readFile(PROJECTS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

async function saveProjects(projects: Project[]): Promise<void> {
  await fs.writeFile(PROJECTS_FILE, JSON.stringify(projects, null, 2), 'utf-8');
}

// GET /api/projects - Return all projects
export async function GET() {
  const projects = await getProjects();
  return NextResponse.json({ success: true, projects });
}

// POST /api/projects - Add new project
export async function POST(req: NextRequest) {
  try {
    const apiKey =
      req.headers.get('x-api-key') ||
      req.headers.get('authorization')?.replace('Bearer ', '');

    const body = await req.json();

    if ((apiKey || body.apiKey) !== API_SECRET) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized.' },
        { status: 401 }
      );
    }

    const {
      title,
      category,
      description,
      techStack,
      team,
      repoUrl,
      demoUrl,
      image,
      featured,
    } = body;

    if (!title || !description) {
      return NextResponse.json(
        { success: false, error: 'Judul dan deskripsi proyek wajib diisi.' },
        { status: 400 }
      );
    }

    const newId =
      body.id?.trim() ||
      `prj-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || Date.now()}`;

    const newProject: Project = {
      id: newId,
      title: title.trim(),
      category: category || 'Web',
      description: description.trim(),
      techStack: Array.isArray(techStack)
        ? techStack
        : typeof techStack === 'string'
        ? techStack.split(',').map((s: string) => s.trim()).filter(Boolean)
        : ['Next.js'],
      team: Array.isArray(team)
        ? team
        : typeof team === 'string'
        ? team.split(',').map((s: string) => s.trim()).filter(Boolean)
        : ['CE F Team'],
      repoUrl: repoUrl?.trim() || undefined,
      demoUrl: demoUrl?.trim() || undefined,
      image: image?.trim() || undefined,
      featured: Boolean(featured),
    };

    const projects = await getProjects();
    // Add to top if featured, else append
    const updated = newProject.featured ? [newProject, ...projects] : [...projects, newProject];
    await saveProjects(updated);

    return NextResponse.json({
      success: true,
      message: 'Proyek berhasil ditambahkan!',
      project: newProject,
    });
  } catch (error) {
    console.error('Error adding project:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal menambahkan proyek.' },
      { status: 500 }
    );
  }
}

// PUT /api/projects - Update existing project
export async function PUT(req: NextRequest) {
  try {
    const apiKey =
      req.headers.get('x-api-key') ||
      req.headers.get('authorization')?.replace('Bearer ', '');

    const body = await req.json();

    if ((apiKey || body.apiKey) !== API_SECRET) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized.' },
        { status: 401 }
      );
    }

    const { id } = body;
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID Proyek wajib disertakan.' },
        { status: 400 }
      );
    }

    const projects = await getProjects();
    const index = projects.findIndex((p) => p.id === id);
    if (index === -1) {
      return NextResponse.json(
        { success: false, error: 'Proyek tidak ditemukan.' },
        { status: 404 }
      );
    }

    const current = projects[index];
    const updatedProject: Project = {
      ...current,
      title: body.title !== undefined ? body.title.trim() : current.title,
      category: body.category || current.category,
      description: body.description !== undefined ? body.description.trim() : current.description,
      techStack: Array.isArray(body.techStack)
        ? body.techStack
        : typeof body.techStack === 'string'
        ? body.techStack.split(',').map((s: string) => s.trim()).filter(Boolean)
        : current.techStack,
      team: Array.isArray(body.team)
        ? body.team
        : typeof body.team === 'string'
        ? body.team.split(',').map((s: string) => s.trim()).filter(Boolean)
        : current.team,
      repoUrl: body.repoUrl !== undefined ? (body.repoUrl.trim() || undefined) : current.repoUrl,
      demoUrl: body.demoUrl !== undefined ? (body.demoUrl.trim() || undefined) : current.demoUrl,
      image: body.image !== undefined ? (body.image.trim() || undefined) : current.image,
      featured: body.featured !== undefined ? Boolean(body.featured) : current.featured,
    };

    projects[index] = updatedProject;
    await saveProjects(projects);

    return NextResponse.json({
      success: true,
      message: 'Proyek berhasil diperbarui!',
      project: updatedProject,
    });
  } catch (error) {
    console.error('Error updating project:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal memperbarui proyek.' },
      { status: 500 }
    );
  }
}

// DELETE /api/projects?id=xyz - Delete project
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    let id = searchParams.get('id');

    let bodyData: { id?: string; apiKey?: string } = {};
    try {
      bodyData = await req.json();
    } catch {
      // Body may be empty if passing query params
    }

    if (!id && bodyData.id) {
      id = bodyData.id;
    }

    const apiKey =
      req.headers.get('x-api-key') ||
      req.headers.get('authorization')?.replace('Bearer ', '') ||
      bodyData.apiKey;

    if (apiKey !== API_SECRET) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized.' },
        { status: 401 }
      );
    }

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID Proyek wajib disertakan.' },
        { status: 400 }
      );
    }

    const projects = await getProjects();
    const filtered = projects.filter((p) => p.id !== id);

    if (filtered.length === projects.length) {
      return NextResponse.json(
        { success: false, error: 'Proyek tidak ditemukan.' },
        { status: 404 }
      );
    }

    await saveProjects(filtered);

    return NextResponse.json({
      success: true,
      message: 'Proyek berhasil dihapus.',
    });
  } catch (error) {
    console.error('Error deleting project:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal menghapus proyek.' },
      { status: 500 }
    );
  }
}
