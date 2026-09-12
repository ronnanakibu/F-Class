import { NextResponse } from 'next/server';
import { readStorageFile, writeStorageFile } from '@/lib/serverStorage';
import initialStudents from '@/data/students.json';

const RELATIVE_PATH = 'data mahasiswa.json';
const DEFAULT_STUDENTS_JSON = JSON.stringify(initialStudents, null, 4);

// GET: Fetch current student data from JSON file
export async function GET() {
  try {
    const rawContent = await readStorageFile(RELATIVE_PATH, DEFAULT_STUDENTS_JSON);
    let data;
    try {
      data = JSON.parse(rawContent);
    } catch {
      data = initialStudents;
    }

    if (!Array.isArray(data) || data.length === 0) {
      data = initialStudents;
    }

    return NextResponse.json({
      success: true,
      data,
      raw: JSON.stringify(data, null, 4),
    });
  } catch {
    return NextResponse.json({
      success: true,
      data: initialStudents,
      raw: DEFAULT_STUDENTS_JSON,
    });
  }
}

// POST: Save updated student data to JSON file
export async function POST(request: Request) {
  try {
    const body = await request.json();

    let studentsArray;
    // Accept either { students: [...] } or direct array [...] or { raw: string }
    if (typeof body.raw === 'string') {
      studentsArray = JSON.parse(body.raw);
    } else if (Array.isArray(body.students)) {
      studentsArray = body.students;
    } else if (Array.isArray(body)) {
      studentsArray = body;
    } else {
      return NextResponse.json(
        { success: false, error: 'Data must be a valid JSON array of students' },
        { status: 400 }
      );
    }

    // Format with 4 spaces to match user's indentation
    const formatted = JSON.stringify(studentsArray, null, 4);

    const result = await writeStorageFile(RELATIVE_PATH, formatted);

    return NextResponse.json({
      success: true,
      isReadOnlyFs: result.isReadOnlyFs,
      syncedCloud: result.syncedCloud,
      message: result.message,
      count: studentsArray.length,
      data: studentsArray,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Invalid JSON or write error' },
      { status: 400 }
    );
  }
}
