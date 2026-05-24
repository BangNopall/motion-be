# Panduan Integrasi Frontend: MOTION Backend

Dokumentasi ini memberikan panduan lengkap bagi pengembang Frontend (Client & Admin) untuk berinteraksi dengan API MOTION.

---

## 1. Konfigurasi Dasar & Utility

### A. Client Utility (Fetch)
Untuk aplikasi Client (User), gunakan standar `fetch` dengan utility berikut:

```javascript
const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:3050/";

const getApiUrl = (path) => new URL(path, API_BASE_URL).toString();

const apiFetch = (path, options = {}) =>
    fetch(getApiUrl(path), {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...(options.headers || {}),
        },
    });

export { API_BASE_URL, apiFetch, getApiUrl };
```

### B. Admin Utility (Axios)
Untuk aplikasi Admin, gunakan `axios` untuk kemudahan penanganan request yang lebih kompleks:

```javascript
import axios from "axios";

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:3050/",
  headers: {
    "Content-Type": "application/json",
  },
});

export default API;
```

---

## 2. Autentikasi (Semua Platform)

Sistem login menggunakan NIM dan Password melalui API eksternal BEM yang divalidasi dengan data internal.

- **Endpoint**: `POST /users/login`
- **Payload**:
  ```json
  {
    "nim": "245150307111006",
    "password": "your_password"
  }
  ```
- **Response Sukses**:
  ```json
  {
    "status": "ok",
    "data": {
      "nim": "245150307111006",
      "nama": "Nama Anggota",
      "token": "jwt_token_here",
      "prodi": "Teknik Informatika",
      "jabatan": { "id_jabatan": 1, "jabatan": "Staff" },
      "kementerian": { "id_kementerian": 1, "kementerian": "Pengembangan Sumber Daya Mahasiswa" }
    }
  }
  ```

---

## 3. Panduan Frontend Client (User)

### A. Dashboard Profil
Mengambil data ringkasan profil anggota.
- **Endpoint**: `GET /users/:nim`

### B. Melihat Rapor (Turn/Periode)
- **Endpoint**: `GET /users/:nim/rapor/:turn`
- **Penting**: Field `indikator` dan `transparansi` sudah dihapus. Data nilai sekarang langsung berada dalam array `detail` yang berisi nilai per `sub_aspek`.

### C. Riwayat Absensi
- **Endpoint**: `GET /users/:nim/absensi/:turn`
- **Response**: Mengembalikan total kegiatan, total kehadiran, dan persentase kehadiran.

---

## 4. Panduan Frontend Admin

### A. Manajemen Anggota
- **List Semua Anggota**: `GET /users`
- **Tambah Anggota**: `POST /users` (Mendukung `multipart/form-data` untuk upload foto).
- **Edit Anggota**: `PUT /users/:nim`
- **Hapus Anggota**: `DELETE /users/:nim`

### B. Manajemen Rapor (Input Nilai)
Admin menginput nilai melalui endpoint rapor.
- **Input/Update Rapor**: `POST /rapor`
- **Payload Utama**:
  ```json
  {
    "nim": "245150307111006",
    "rapor_ke": 1,
    "hobi": "Membaca",
    "feedback_c_level": "Feedback C-Level untuk anggota IRE",
    "motivasi": "Semangat terus",
    "nilai": [
      { "id_subaspek": 1, "nilai": 85.5 },
      { "id_subaspek": 2, "nilai": 90.0 }
    ],
    "kehadiran": [
      { "id_kegiatan": 5, "status": true }
    ]
  }
  ```

### C. Manajemen Kriteria (Aspek & Sub-Aspek)
- **List Aspek**: `GET /aspek`
- **Tambah/Edit Aspek**: `POST /aspek` atau `PUT /aspek/:id`
- **Hapus Aspek**: `DELETE /aspek/:id`

### D. Manajemen Kegiatan (Absensi)
- **Tambah Kegiatan**: `POST /kegiatan`
- **Update Kegiatan**: `PUT /kegiatan/:id`

### E. Best Staff
- **List Semua Best Staff**: `GET /bestStaff`
- **List Best Staff per Phase**: `GET /bestStaff/:phase`
- **Tambah Best Staff**: `POST /bestStaff`
- **Update Best Staff**: `PUT /bestStaff/:id`
- **Hapus Best Staff**: `DELETE /bestStaff/:id`
- **Catatan**:
  - `phase` menggantikan field lama `month`.
  - Nilai `phase` hanya valid dari `1` sampai `3`.
  - Kombinasi `phase` dan `id_kementerian` harus unik, sehingga setiap kementerian hanya punya satu Best Staff pada tiap phase.
- **Payload Tambah/Update**:
  ```json
  {
    "phase": 1,
    "nim": "245150307111006",
    "id_kementerian": 1
  }
  ```
- **Response Data** (`GET /bestStaff` dan `GET /bestStaff/:phase`):
  ```json
  {
    "status": "ok",
    "data": [
      {
        "id": 1,
        "phase": 1,
        "nim": "245150307111006",
        "id_kementerian": 1,
        "staff": {
          "nim": "245150307111006",
          "nama": "Nama Anggota",
          "foto": "https://...",
          "kementerian": {
            "id_kementerian": 1,
            "kementerian": "PSDM"
          }
        }
      }
    ]
  }
  ```

---

## 5. Referensi Data

### ID Kementerian
| ID | Nama Kementerian |
|----|------------------|
| 1  | PSDM             |
| 2  | INTI             |
| ...| ...              |

### ID Jabatan
| ID | Nama Jabatan |
|----|--------------|
| 1  | Staff        |
| 2  | Ketua        |
| ...| ...          |

---

## 6. Tips Integrasi

1. **Error Handling**: Cek field `status` pada response. Jika `status === "err"`, pesan error ada di field `msg`.
2. **Foto Anggota**: Gunakan URL lengkap yang dikembalikan oleh API (dari Supabase Storage).
3. **Validasi Admin**: Endpoint `GET /is_admin/:nim` dapat digunakan untuk proteksi route di sisi Frontend Admin.
