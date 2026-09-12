import { NextRequest, NextResponse } from 'next/server';
import { readStorageFile, writeStorageFile } from '@/lib/serverStorage';
import { isValidAdminKey } from '@/lib/auth';
import type { Project } from '@/types';
import initialProjects from '@/data/projects.json';

const RELATIVE_PATH = 'projects.json';
const DEFAULT_PROJECTS_JSON = JSON.stringify(initialProjects, null, 2);

export const dynamic = 'force-dynamic';

async function getProjects(): Promise<Project[]> {
  try {
    const raw = await readStorageFile(RELATIVE_PATH, DEFAULT_PROJECTS_JSON);
    let data;
    try {
      data = JSON.parse(raw);
    } catch {
      data = initialProjects;
    }
    if (!Array.isArray(data) || data.length === 0) {
      return initialProjects as Project[];
    }
    return data;
  } catch {
    return initialProjects as Project[];
  }
}

async function saveProjects(projects: Project[]) {
  return writeStorageFile(RELATIVE_PATH, JSON.stringify(projects, null, 2));
}

// GET /api/projects - Return all projects
export async function GET() {
  const projects = await getProjects();
  return NextResponse.json(
    { success: true, projects },
    {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
      },
    }
  );
}

// POST /api/projects - Add new project
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const apiKey =
      req.headers.get('x-api-key') ||
      req.headers.get('authorization')?.replace('Bearer ', '') ||
      body.apiKey;

    if (!isValidAdminKey(apiKey)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Passkey tidak valid.' },
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
    const updated = newProject.featured ? [newProject, ...projects] : [...projects, newProject];
    const writeResult = await saveProjects(updated);

    return NextResponse.json({
      success: true,
      message: 'Proyek berhasil ditambahkan!',
      project: newProject,
      syncedCloud: writeResult.syncedCloud,
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
    const body = await req.json();
    const apiKey =
      req.headers.get('x-api-key') ||
      req.headers.get('authorization')?.replace('Bearer ', '') ||
      body.apiKey;

    if (!isValidAdminKey(apiKey)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Passkey tidak valid.' },
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
    const writeResult = await saveProjects(projects);

    return NextResponse.json({
      success: true,
      message: 'Proyek berhasil diperbarui!',
      project: updatedProject,
      syncedCloud: writeResult.syncedCloud,
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

    if (!isValidAdminKey(apiKey)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Passkey tidak valid.' },
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

    const writeResult = await saveProjects(filtered);

    return NextResponse.json({
      success: true,
      message: 'Proyek berhasil dihapus.',
      syncedCloud: writeResult.syncedCloud,
    });
  } catch (error) {
    console.error('Error deleting project:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal menghapus proyek.' },
      { status: 500 }
    );
  }
}
