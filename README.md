# MetaPanel - Trading & Cashflow Dashboard

MetaPanel adalah platform dasbor keuangan minimalis premium bergaya **Stripe Style (Light Theme)** yang dirancang untuk melacak jurnal trading harian (Metatrader) dan arus kas (cashflow) secara terpadu. Dasbor ini terhubung secara langsung (*real-time*) ke Google Spreadsheet Anda dengan dukungan fallback database offline lokal.

---

## 🌟 Fitur Utama

### 1. **Stripe-Style Premium UI**
*   **Desain Minimalis Modern**: Menggunakan kombinasi warna dasar abu-abu kebiruan lembut (`#f8fafc`), kartu bulat (`16px`) berbayangan tipis, dan visualisasi ikon melingkar pastel yang elegan.
*   **Tata Letak Presisi**: Area menu header tergulir secara melayang (*frosted glass effect*) dan terpusat sejajar vertikal dengan grid konten dasbor di bawahnya.
*   **Responsive Layout**: Ramah pengguna di semua ukuran perangkat (Desktop, Tablet, dan Mobile).

### 2. **Kalkulasi & Sinkronisasi Real-time**
*   **Live Google Sheets Sync**: Mengunduh data CSV terbaru langsung dari Google Sheets setiap kali halaman dimuat (dilengkapi pencegah cache waktu `Date.now()`).
*   **Offline Fallback Database**: Otomatis mendeteksi jika koneksi internet terputus dan menggunakan basis data offline lokal (`dashboard_data.js`) sebagai fallback agar aplikasi tetap berjalan lancar.

### 3. **Interaktivitas Cerdas**
*   **Widget Kurs USD/IDR Interaktif (Editable)**: Menampilkan kurs USD aktif di bagian kanan menu header. Kurs ini **dapat diklik dan diedit langsung**. Ketika diedit, dasbor secara instan menghitung ulang semua nominal rupiah (KPI, rekap bulanan, dan jurnal harian) secara langsung tanpa perlu memuat ulang halaman!
*   **Filter Tanggal & Status di Pojok Kanan**: Pilihan filter bulan dan tipe/status diposisikan rapi di pojok kanan atas kartu tabel (*SaaS-inspired layout*).
*   **Sortir Interaktif dari Header Tabel (`th`)**: Cukup klik nama kolom di header tabel untuk mengurutkan baris secara naik/turun (*ascending/descending*), lengkap dengan indikator panah arah (`▲` / `▼`).

### 4. **Akurasi Data Rekap Bulanan**
*   **Rekap Kas Tanpa Konversi**: Nilai nominal *Deposit*, *Withdraw*, dan *Biaya Server* dihitung dari penjumlahan transaksi asli Arus Kas tanpa adanya konversi kurs (menjaga konsistensi data riil).
*   **Visualisasi Redup (Dimmed Rows)**: Bulan-bulan yang belum berjalan secara otomatis tampil lebih samar/redup untuk memberikan kejelasan fokus visual.
*   **Gaya Akuntansi pada TOTAL**: Baris TOTAL di bagian paling bawah tabel Rekap Bulanan disajikan dengan gaya akuntansi tebal dan bergaris ganda.

---

## 📂 Struktur File Project

*   **`index.html`** – Halaman web dasbor utama. Berisi struktur HTML, desain CSS premium, dan logika manipulasi data interaktif.
*   **`generate_dashboard_data.js`** – Skrip compiler Node.js untuk mengambil data segar dari Google Sheets dan menyimpannya sebagai file cadangan lokal.
*   **`dashboard_data.js`** – File cadangan lokal (offline fallback database) yang dibuat secara otomatis oleh skrip compiler.
*   **`lucide.js`** – Pustaka ikon lokal untuk rendering visual grafis UI secara offline.
*   **`REKAP_EXCEL_BARU.xlsx`** – File template spreadsheet pendukung.

---

## 🚀 Cara Menjalankan Project

### 1. Membuka Dasbor di Browser
Cukup buka file `index.html` langsung di browser Anda, atau jalankan melalui web server lokal seperti XAMPP/Apache:
```bash
# Salin ke direktori htdocs XAMPP Anda
C:/xampp/htdocs/meta/retrade/index.html
```

### 2. Mengompilasi Ulang Data Offline Cadangan
Jika Anda melakukan pembaruan data pada Google Sheets dan ingin memperbarui basis data lokal cadangan (`dashboard_data.js`), jalankan perintah berikut di terminal Anda:
```bash
# Masuk ke folder retrade
cd c:/xampp/htdocs/meta/retrade

# Jalankan compiler
node generate_dashboard_data.js
```
Skrip ini akan mengunduh data terbaru dari tautan Google Sheets Anda dan membuat ulang file `dashboard_data.js` secara otomatis.

---
*Developed with ❤️ for premium financial management.*
