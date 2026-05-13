# Supabase Setup

Panduan ini untuk membuat database Supabase baru dari nol agar tetap kompatibel dengan backend MOTION.

## 1. Buat Project Supabase

Buat project baru di Supabase, lalu ambil:

- Project URL
- Secret/service role key untuk backend

Gunakan secret/service role key hanya di environment server backend. Jangan taruh key itu di frontend.

## 2. Jalankan Schema

Jalankan isi file ini di SQL Editor Supabase:

```text
supabase/migrations/20260513000000_initial_schema.sql
```

Migration ini membuat tabel, foreign key, unique constraint untuk upsert, index dasar, RLS, grant untuk `service_role`, dan storage bucket `motion24_bucket`.

Catatan Supabase 2026: project baru bisa tidak otomatis mengekspos tabel ke Data API. Jika request dari backend gagal seperti tabel tidak ditemukan oleh API, cek Dashboard Supabase bagian Data API settings dan pastikan schema `public` diekspos untuk API project ini.

## 3. Jalankan Seed Starter

Jalankan isi file ini di SQL Editor Supabase:

```text
supabase/seed.sql
```

Seed ini hanya starter minimal. Ganti data `kementerian`, `jabatan`, `proker`, `aspek`, dan `detailAspek` dengan data organisasi yang asli.

## 4. Isi Environment Backend

Contoh ada di `.env.example`.

```env
PORT=5000
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_KEY=your-supabase-service-role-or-secret-key
JWT_SECRET=replace-with-a-long-random-secret
EXTERNAL_AUTH_URL=https://rest-api.bemfilkomub.cloud
```

Karena tabel memakai RLS tanpa policy publik, backend perlu memakai secret/service role key. Kalau memakai publishable/anon key, query database akan ditolak oleh RLS.

## 5. Smoke Test

Setelah `.env` diisi:

```bash
npm test
npm run server
```

Lalu cek endpoint dasar:

```bash
curl http://localhost:5000/kementerian
curl http://localhost:5000/jabatan
curl http://localhost:5000/aspek
```
