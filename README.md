# Galery-Promt
From Promting to Pasting

## Prompt Gallery

Galeri referensi prompt AI — temukan, copy, dan generate.

## Stack
- **Next.js 14** (App Router)
- **TailwindCSS**
- **Supabase** (database + storage)
- **Vercel** (deployment)

---

## Setup Lokal

### 1. Clone & install

```bash
git clone <repo-url>
cd prompt-gallery
npm install
```

### 2. Setup Supabase

1. Buat project baru di [supabase.com](https://supabase.com)
2. Buka **SQL Editor** → jalankan isi file `supabase/schema.sql`
3. Buka **Project Settings → API**, copy:
   - `Project URL`
   - `anon / public` key
   - `service_role` key (jaga rahasia!)

### 3. Konfigurasi environment

```bash
cp .env.local.example .env.local
```

Isi `.env.local` dengan nilai dari Supabase:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

### 4. Jalankan dev server

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000)

---

## Halaman

| URL | Deskripsi |
|-----|-----------|
| `/gallery` | Halaman utama galeri |
| `/prompt/[id]` | Detail satu prompt |
| `/admin` | Upload prompt baru (admin) |

---

## Deployment ke Vercel

```bash
npm i -g vercel
vercel
```

Tambahkan environment variables di **Vercel Dashboard → Settings → Environment Variables**.

---

## Struktur Folder

```
src/
├── app/
│   ├── api/upload/route.ts   ← API upload (server-side)
│   ├── admin/page.tsx        ← Halaman admin upload
│   ├── gallery/page.tsx      ← Galeri utama
│   └── prompt/[id]/page.tsx  ← Detail prompt
├── components/
│   └── ui/CopyButton.tsx     ← Tombol copy reusable
└── lib/
    └── supabase.ts           ← Client + types
supabase/
└── schema.sql                ← SQL untuk setup database
```
