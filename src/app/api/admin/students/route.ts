import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const DATA_FILE_PATH = path.join(process.cwd(), 'data mahasiswa.json');

// GET: Fetch current student data from JSON file
export async function GET() {
  try {
    const rawContent = await fs.readFile(DATA_FILE_PATH, 'utf-8');
    const data = JSON.parse(rawContent);
    return NextResponse.json({ success: true, data, raw: rawContent });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to read data' },
      { status: 500 }
    );
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

    await fs.writeFile(DATA_FILE_PATH, formatted, 'utf-8');

    return NextResponse.json({
      success: true,
      message: 'Data mahasiswa berhasil disimpan!',
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
