# Stories Media Folder (`public/stories/`)

Folder ini digunakan oleh sistem dan **WhatsApp Bot (WABOT)** untuk menyimpan arsip permanen dari Instagram Stories kelas `@comeinone.f`.

---

### Alur Kerja Bot WhatsApp (WABOT):
1. Bot memantau akun Instagram `@comeinone.f`.
2. Saat ada story baru, bot men-download media (foto atau video).
3. Bot melakukan `POST` ke endpoint website: `https://cef25.my.id/api/stories`
4. Bot menyertakan metadata story (jam posting, caption, dll).
5. **Jika metadata tidak dikirimkan**, server secara cerdas membuatkan metadata otomatis saat story di-POST (waktu saat ini, author default `@comeinone.f`, auto-detect tipe media foto/video).
6. Admin juga dapat mengedit metadata story (jam, tanggal, caption, author, kategori) kapan saja melalui menu **Admin Console (`/admin`)**.

---

### Spesifikasi Endpoint Ingestion Bot (POST):

**Endpoint:** `POST /api/stories`  
**Header:**
```http
x-api-key: cef2024
Content-Type: multipart/form-data
```

**Field Form-Data yang Didukung:**
| Field | Tipe | Wajib? | Keterangan & Fallback Otomatis |
|---|---|---|---|
| `file` | File Buffer / Stream | **Ya** | File gambar (`.jpg`, `.png`, dll) atau video (`.mp4`, `.webm`, `.mov`) |
| `timestamp` / `takenAt` / `time` | String / Unix Number | Opsional | Waktu story diposting di IG. Mendukung Unix seconds (10 digit), Unix ms (13 digit), atau ISO string. **Jika kosong: otomatis menggunakan waktu saat di-POST**. |
| `caption` | String | Opsional | Teks caption story. **Jika kosong: default string kosong**. |
| `author` | String | Opsional | Username pengunggah (default: `comeinone.f`). |
| `category` | String | Opsional | Kategori (`Praktikum`, `Kantin & Chill`, `Project IoT`, `Event`, `General`). |
| `igStoryId` | String | Opsional | ID asli story dari Instagram. |
| `mediaType` | `image` \| `video` | Opsional | **Jika kosong: otomatis dideteksi dari ekstensi & MIME file**. |

---

### Contoh Payload JSON (Jika media sudah di-upload ke static URL / Base64):
```json
{
  "apiKey": "cef2024",
  "mediaUrl": "/stories/story-1726118400000.jpg",
  "timestamp": 1726118400,
  "caption": "Praktikum mikrokontroler sampai larut malam ⚡",
  "author": "comeinone.f",
  "category": "Praktikum"
}
```

---

### Endpoint Edit Metadata Story (PUT):
**Endpoint:** `PUT /api/stories`  
**Header:** `x-api-key: cef2024` atau sertakan `"apiKey": "cef2024"` dalam body JSON.  
**Body JSON:**
```json
{
  "id": "story-01",
  "timestamp": "2025-09-11T21:45:00.000Z",
  "caption": "Caption yang telah diperbarui",
  "author": "comeinone.f",
  "category": "Praktikum",
  "mediaType": "image"
}
```
Arsip ini **bersifat permanen** dan tidak akan terhapus secara otomatis setelah 24 jam!
