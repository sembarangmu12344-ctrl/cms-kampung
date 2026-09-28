# 🏘️ CMS Kampung

Website CMS (Content Management System) untuk kampung/desa berbasis **Next.js 14**, **Prisma ORM**, dan **PostgreSQL**. Dibangun untuk proyek pengabdian masyarakat mahasiswa.

---

## ✨ Fitur Utama

### Website Publik
| Halaman | URL | Deskripsi |
|---|---|---|
| Beranda | `/` | Hero, statistik, berita terbaru, UMKM unggulan |
| Profil Kampung | `/profil` | Info lengkap, statistik, peta |
| Berita & Pengumuman | `/berita` | List berita dengan filter & pencarian |
| Detail Berita | `/berita/[slug]` | Konten penuh + berita terkait |
| Direktori UMKM | `/umkm` | Katalog UMKM dengan filter kategori |
| Detail UMKM | `/umkm/[slug]` | Info usaha + foto produk + tombol WhatsApp |
| Galeri Foto | `/galeri` | Grid foto dengan lightbox |
| Kontak & Lokasi | `/kontak` | Kontak + peta embed |

### Admin Panel (`/admin`)
| Halaman | Deskripsi |
|---|---|
| Dashboard | Statistik ringkas + konten terbaru |
| Berita | CRUD berita & pengumuman |
| UMKM | CRUD direktori UMKM + upload foto produk |
| Galeri | Upload & kelola foto galeri |
| Profil Kampung | Edit info kampung, statistik, media sosial |
| Pengaturan | Konfigurasi website (super admin) |
| Pengguna | Manajemen akun admin (super admin) |

---

## 🛠️ Tech Stack

| Layer | Teknologi |
|---|---|
| Framework | Next.js 14 (App Router) |
| Database | PostgreSQL |
| ORM | Prisma |
| Auth | JWT (jose) + bcryptjs + HttpOnly Cookie |
| Styling | Tailwind CSS |
| Icons | Lucide React |
| Upload | Local Storage / Cloudinary |
| Validasi | Zod |

---

## 🚀 Cara Menjalankan (Setup Lokal)

### 1. Prasyarat

Pastikan sudah terinstall:
- **Node.js** v18 atau lebih baru: https://nodejs.org
- **PostgreSQL** v14+: https://postgresql.org
- **Git**: https://git-scm.com

### 2. Clone & Install

```bash
# Masuk ke folder project
cd "e:\Proker sak onok e\cms-kampung"

# Install semua dependencies
npm install
```

### 3. Setup Database PostgreSQL

Buka **pgAdmin** atau **psql**, lalu buat database baru:

```sql
CREATE DATABASE cms_kampung;
```

### 4. Konfigurasi Environment

Salin file `.env.example` menjadi `.env.local`, lalu sesuaikan isinya:

```bash
# Windows PowerShell
Copy-Item .env.example .env.local
```

Edit `.env.local`:

```env
# Sesuaikan dengan credentials PostgreSQL Anda
DATABASE_URL="postgresql://postgres:PASSWORD_ANDA@localhost:5432/cms_kampung"

# Ganti dengan string random (min 32 karakter)
JWT_SECRET="ganti-dengan-string-random-yang-panjang-dan-aman"
JWT_EXPIRES_IN="7d"

NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_APP_NAME="CMS Kampung"
```

### 5. Migrasi Database

```bash
# Generate Prisma Client
npm run db:generate

# Push schema ke database (untuk development)
npm run db:push

# Atau gunakan migrasi (lebih aman untuk production)
npm run db:migrate
```

### 6. Seed Data Awal

Mengisi database dengan data contoh (admin, berita, UMKM, galeri):

```bash
npm run db:seed
```

Setelah selesai, Anda akan mendapat akun:
```
📧 Super Admin  : superadmin@cmskampung.id
📧 Admin        : admin@cmskampung.id
🔑 Password     : admin123
```
> ⚠️ **Segera ganti password** setelah login pertama!

### 7. Jalankan Development Server

```bash
npm run dev
```

Buka browser dan akses:
- 🌐 **Website Publik**: http://localhost:3000
- 🔧 **Admin Panel**: http://localhost:3000/admin
- 🔐 **Login**: http://localhost:3000/auth/login

---

## 📁 Struktur Folder

```
cms-kampung/
├── prisma/
│   ├── schema.prisma        # Definisi model database
│   └── seed.ts              # Data awal
│
├── src/
│   ├── app/
│   │   ├── (public)/        # Website publik (beranda, berita, UMKM, dll)
│   │   ├── admin/           # Panel admin (protected)
│   │   ├── api/             # REST API routes
│   │   └── auth/            # Halaman login
│   │
│   ├── components/
│   │   ├── public/          # Komponen website publik
│   │   ├── admin/           # Komponen admin panel
│   │   └── ui/              # Komponen generik
│   │
│   ├── lib/                 # Utilities
│   │   ├── prisma.ts        # Prisma client singleton
│   │   ├── auth.ts          # JWT utilities & permissions
│   │   ├── upload.ts        # File upload (local/Cloudinary)
│   │   ├── slugify.ts       # Slug generator
│   │   ├── validations.ts   # Zod schemas
│   │   ├── response.ts      # API response helpers
│   │   └── utils.ts         # Helper functions
│   │
│   ├── middleware.ts         # Next.js edge middleware (protect /admin)
│   └── types/
│       └── index.ts         # TypeScript types
│
├── public/
│   └── uploads/             # Folder upload file lokal
│
├── .env.example             # Template environment variables
├── .env.local               # Environment variables (jangan di-commit)
└── package.json
```

---

## 🔌 API Endpoints

### Auth
```
POST  /api/auth/login        Body: { email, password }
POST  /api/auth/logout
GET   /api/auth/me
```

### Berita
```
GET   /api/news              ?page=1&limit=10&search=&category=&status=
POST  /api/news              [admin] Body: { title, content, excerpt, status, ... }
GET   /api/news/[id]
PUT   /api/news/[id]         [admin]
DELETE /api/news/[id]        [admin]
```

### UMKM
```
GET   /api/umkm              ?page=1&limit=12&search=&category=&featured=
POST  /api/umkm              [admin]
GET   /api/umkm/[id]
PUT   /api/umkm/[id]         [admin]
DELETE /api/umkm/[id]        [admin]
POST  /api/umkm/[id]/photos/new     [admin] multipart/form-data
DELETE /api/umkm/[id]/photos/[photoId]  [admin]
```

### Galeri
```
GET   /api/gallery           ?page=1&limit=16&category=
POST  /api/gallery           [admin] JSON atau multipart/form-data
PUT   /api/gallery/[id]      [admin]
DELETE /api/gallery/[id]     [admin]
```

### Lainnya
```
GET   /api/village
PUT   /api/village           [admin]
GET   /api/categories        ?type=news|umkm|gallery
POST  /api/categories        [admin]
GET   /api/settings          [admin]
PUT   /api/settings/[key]    [super_admin]
POST  /api/upload            [admin] multipart/form-data { file }
GET   /api/dashboard         [admin]
GET   /api/users             [super_admin]
POST  /api/users             [super_admin]
PUT   /api/users/[id]        [admin/super_admin]
DELETE /api/users/[id]       [super_admin]
```

---

## 👥 Role & Akses

| Fitur | Pengunjung | Admin | Super Admin |
|---|:---:|:---:|:---:|
| Baca berita publik | ✅ | ✅ | ✅ |
| Baca UMKM publik | ✅ | ✅ | ✅ |
| Login admin | ❌ | ✅ | ✅ |
| CRUD Berita | ❌ | ✅ | ✅ |
| CRUD UMKM | ❌ | ✅ | ✅ |
| CRUD Galeri | ❌ | ✅ | ✅ |
| Edit Profil Kampung | ❌ | ✅ | ✅ |
| Pengaturan Website | ❌ | 👁️ baca | ✅ |
| Kelola Pengguna | ❌ | ❌ | ✅ |

---

## ☁️ Deploy ke Production (Gratis)

### Opsi 1: Vercel + Supabase (Rekomendasi)

1. **Buat akun** di [Vercel](https://vercel.com) dan [Supabase](https://supabase.com)

2. **Setup Supabase**:
   - Buat project baru di Supabase
   - Salin `DATABASE_URL` dari Settings → Database → Connection String

3. **Push ke GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit: CMS Kampung"
   git remote add origin https://github.com/username/cms-kampung.git
   git push -u origin main
   ```

4. **Import ke Vercel**:
   - Connect ke repository GitHub
   - Tambahkan semua environment variables dari `.env.local`
   - Deploy!

5. **Jalankan migrasi & seed di Supabase**:
   - Update `DATABASE_URL` ke Supabase URL
   - Jalankan `npm run db:push` dan `npm run db:seed`

### Opsi 2: Railway (All-in-one)

Railway bisa host Next.js + PostgreSQL dalam satu platform:
1. Buat akun di [Railway](https://railway.app)
2. New Project → Deploy from GitHub repo
3. Add Plugin → PostgreSQL
4. Set environment variables
5. Deploy otomatis!

---

## 🔧 Konfigurasi Upload Gambar

### Local Storage (Default - Development)
File disimpan di `/public/uploads/`. Sudah berjalan otomatis tanpa konfigurasi tambahan.

### Cloudinary (Rekomendasi Production)
1. Daftar gratis di [Cloudinary](https://cloudinary.com) (25GB gratis)
2. Isi di `.env.local`:
   ```env
   CLOUDINARY_CLOUD_NAME="nama-cloud-anda"
   CLOUDINARY_API_KEY="api-key"
   CLOUDINARY_API_SECRET="api-secret"
   ```
3. Upload akan otomatis menggunakan Cloudinary jika variabel sudah diisi.

---

## 🗃️ Perintah Database

```bash
npm run db:generate    # Generate Prisma client setelah perubahan schema
npm run db:push        # Push schema ke DB (development, tanpa migrasi)
npm run db:migrate     # Buat & jalankan migrasi (production)
npm run db:seed        # Isi data awal
npm run db:studio      # Buka Prisma Studio (GUI database)
npm run db:reset       # RESET database (hapus semua data!)
```

---

## 🐛 Troubleshooting

### Error: `Can't reach database server`
- Pastikan PostgreSQL sudah berjalan
- Cek `DATABASE_URL` di `.env.local`
- Pastikan nama database, username, dan password benar

### Error: `Module not found: @prisma/client`
```bash
npm run db:generate
```

### Error: Upload file gagal
- Cek folder `public/uploads/` ada dan bisa ditulis
- Pastikan ukuran file tidak melebihi 5MB

### Halaman admin redirect ke login terus
- Cek `JWT_SECRET` di `.env.local` sudah diisi
- Clear cookie di browser dan coba login ulang

### Port 3000 sudah dipakai
```bash
npm run dev -- -p 3001
```

---

## 📋 Roadmap Pengembangan

### ✅ MVP (Selesai)
- Website publik lengkap (beranda, profil, berita, UMKM, galeri, kontak)
- Admin panel dengan CRUD berita, UMKM, galeri
- Autentikasi JWT dengan role management
- Upload gambar (local + Cloudinary)
- Database PostgreSQL dengan Prisma ORM

### 🔄 Versi 1.1 (Selanjutnya)
- [ ] SEO optimization (sitemap.xml, robots.txt, Open Graph)
- [ ] Rich text editor (Tiptap) untuk konten berita
- [ ] Pencarian global
- [ ] Export data UMKM ke Excel
- [ ] Notifikasi toast untuk aksi admin

### 🚀 Versi 2.0 (Masa Depan)
- [ ] Sistem laporan/pengaduan warga
- [ ] Event & kalender kampung
- [ ] PWA (Progressive Web App)
- [ ] Notifikasi WhatsApp otomatis
- [ ] Dashboard analitik pengunjung
- [ ] Multi-bahasa (Indonesia + bahasa daerah)

---

## 👨‍💻 Untuk Pengembang

### Menambah Halaman Publik Baru
1. Buat folder di `src/app/(public)/nama-halaman/`
2. Buat `page.tsx` dengan `export default async function Page()`
3. Otomatis terbungkus Navbar + Footer dari layout

### Menambah Halaman Admin Baru
1. Buat folder di `src/app/admin/nama-halaman/`
2. Buat `page.tsx` — otomatis terlindungi oleh middleware auth
3. Tambahkan link di `src/components/admin/Sidebar.tsx`

### Menambah API Endpoint Baru
1. Buat file di `src/app/api/nama-endpoint/route.ts`
2. Export fungsi `GET`, `POST`, `PUT`, `DELETE` sesuai kebutuhan
3. Gunakan helper dari `src/lib/response.ts` untuk format response

### Menambah Model Database Baru
1. Edit `prisma/schema.prisma`
2. Jalankan `npm run db:migrate` atau `npm run db:push`
3. Jalankan `npm run db:generate`

---

## 📜 Lisensi

MIT License — bebas digunakan untuk proyek akademik dan pengabdian masyarakat.

---

*Dibuat dengan ❤️ untuk pemberdayaan kampung digital Indonesia*
