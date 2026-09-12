import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { readStorageFile, writeStorageFile } from '@/lib/serverStorage';

export const dynamic = 'force-dynamic';

function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password.trim()).digest('hex');
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action = 'login', username, password, newPassword } = body;

    const usersJson = await readStorageFile('database/users.json', '[]');
    let users = [];
    try {
      users = JSON.parse(usersJson);
    } catch {
      users = [];
    }

    if (action === 'login') {
      if (!username || !password) {
        return NextResponse.json({ error: 'NIM / Username dan password wajib diisi' }, { status: 400 });
      }

      const cleanUser = String(username).trim().toLowerCase();
      const inputHash = hashPassword(password);

      const user = users.find(
        (u: any) =>
          u.username.toLowerCase() === cleanUser ||
          (u.nim && u.nim.toLowerCase() === cleanUser)
      );

      if (!user) {
        return NextResponse.json({ error: 'NIM atau Username tidak ditemukan' }, { status: 404 });
      }

      if (user.passwordHash !== inputHash) {
        return NextResponse.json({ error: 'Password salah. Default password adalah 4 digit terakhir NIM Anda.' }, { status: 401 });
      }

      const safeUser = {
        id: user.id,
        username: user.username,
        name: user.name,
        nim: user.nim || user.username,
        role: user.role,
        classRole: user.classRole || 'Anggota',
        mustChangePassword: !!user.mustChangePassword,
      };

      const response = NextResponse.json({
        success: true,
        user: safeUser,
        message: 'Login berhasil',
      });

      // Set cookie for quick session identification
      response.cookies.set('absensi_user', JSON.stringify(safeUser), {
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        httpOnly: false,
        sameSite: 'lax',
      });

      return response;
    }

    if (action === 'change-password') {
      if (!username || !password || !newPassword) {
        return NextResponse.json({ error: 'Parameter tidak lengkap' }, { status: 400 });
      }

      if (newPassword.length < 4) {
        return NextResponse.json({ error: 'Password baru minimal 4 karakter' }, { status: 400 });
      }

      const cleanUser = String(username).trim().toLowerCase();
      const currentHash = hashPassword(password);
      const newHash = hashPassword(newPassword);

      const userIdx = users.findIndex(
        (u: any) =>
          u.username.toLowerCase() === cleanUser ||
          (u.nim && u.nim.toLowerCase() === cleanUser)
      );

      if (userIdx === -1) {
        return NextResponse.json({ error: 'Pengguna tidak ditemukan' }, { status: 404 });
      }

      if (users[userIdx].passwordHash !== currentHash) {
        return NextResponse.json({ error: 'Password saat ini salah' }, { status: 401 });
      }

      users[userIdx].passwordHash = newHash;
      users[userIdx].mustChangePassword = false;

      await writeStorageFile('database/users.json', JSON.stringify(users, null, 2));

      return NextResponse.json({
        success: true,
        message: 'Password berhasil diubah!',
      });
    }

    return NextResponse.json({ error: 'Aksi tidak valid' }, { status: 400 });
  } catch (err: any) {
    console.error('Auth API Error:', err);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server' }, { status: 500 });
  }
}
