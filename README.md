<div align="center">

<h1>💰 Expense Tracker – Personal Finance Manager 📊</h1>

<h3>Solusi Manajemen Keuangan Pribadi yang Cerdas & Terintegrasi</h3>

<p>
Platform manajemen keuangan modern untuk membantu pengguna melacak
<strong>Pemasukan</strong>, <strong>Pengeluaran</strong>, dan <strong>Anggaran</strong>
dalam satu ekosistem yang bersih dan intuitif.
</p>

<p>
Dibangun dengan arsitektur <em>Full-Stack</em> yang handal untuk menangani
logika transaksi, validasi saldo dompet, dan visualisasi data secara real-time.
</p>

</div>

<p align="center">
  <img src="https://img.shields.io/badge/React-16.x-61DAFB?style=for-the-badge&logo=react&logoColor=black">
  <img src="https://img.shields.io/badge/Node.js-18.x-339933?style=for-the-badge&logo=nodedotjs&logoColor=white">
  <img src="https://img.shields.io/badge/Express.js-4.x-000000?style=for-the-badge&logo=express&logoColor=white">
  <img src="https://img.shields.io/badge/Prisma-ORM-2D3748?style=for-the-badge&logo=prisma&logoColor=white">
  <img src="https://img.shields.io/badge/MySQL-8.0-4479A1?style=for-the-badge&logo=mysql&logoColor=white">
  <img src="https://img.shields.io/badge/Tailwind_CSS-3.x-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white">
</p>

---

## 📋 Tentang Aplikasi

**FinanceMate** adalah aplikasi manajemen keuangan pribadi yang dirancang
untuk membantu pengguna mengontrol arus kas secara terstruktur.

Tidak hanya sebagai pencatat pengeluaran, FinanceMate mengintegrasikan:

- 💳 **Multi-Wallet System**
- 🎯 **Smart Budgeting**
- 📊 **Financial Analytics**

untuk memberikan gambaran **kesehatan finansial** yang lebih akurat.

### Highlight Implementasi
- ♻️ **Soft Delete & Recycle Bin** untuk kategori
- 🔒 **Validasi saldo ketat** pada transfer antar dompet
- 🚦 **Visualisasi budget dinamis** dengan indikator warna

---

## ✨ Fitur Unggulan & Teknis

<table width="100%">
<tr>
<td width="50%" valign="top">

### 📊 Dashboard & Analitik
- 📈 **Interactive Charts**  
  Area chart arus kas & donut chart proporsi pengeluaran.
- 👁️ **Privacy Mode**  
  Masking saldo untuk penggunaan di tempat umum.
- ⚡ **Skeleton Loading**  
  Loading halus tanpa layout shift.

### 💳 Manajemen Dompet (Wallets)
- 🏦 **Multi-Account Support**  
  Bank, E-Wallet, dan Tunai.
- 🔄 **Secure Transfer Logic**  
  Validasi saldo + fitur swap cepat.
- 🎨 **Dynamic Card UI**  
  Gradasi warna kartu berdasarkan tipe akun.

</td>
<td width="50%" valign="top">

### 🎯 Smart Budgeting
- 🚦 **Dynamic Progress Indicator**  
  Hijau (Aman), Kuning (Waspada), Merah (Over).
- 📅 **Date Range Budgeting**  
  Budget berdasarkan periode waktu.
- 🧮 **Real-time Calculation**  
  Persentase dihitung langsung dari transaksi.

### ⚙️ Architecture & Security
- 🏷️ **Advanced Category Management**  
  Soft Delete, Restore, Hard Delete.
- 🔍 **Global Search & Filter**  
  Filter transaksi (Date, Wallet, Category).
- 🔐 **JWT Authentication**  
  Login aman dengan Bcrypt hashing.

</td>
</tr>
</table>

---

## 🚀 Panduan Memulai

<details>
<summary><strong>📦 Klik untuk melihat langkah instalasi & konfigurasi</strong></summary>

### Prasyarat
- Node.js & NPM
- MySQL Database

---

### 1️⃣ Clone Repository
```bash
git clone https://github.com/username-anda/financemate.git
cd financemate
```

### 2️⃣ Setup Backend (Server)
```bash
cd server
npm install
```
Buat file `.env` 
```bash
DATABASE_URL="mysql://root:password_mysql_anda@localhost:3306/financemate_db"
JWT_SECRET="rahasia_super_aman_123"
PORT=5000
```

Migrasi dan Seeding database
```bash
npx prisma migrate dev --name init
npx prisma db seed
```

Jalankan server
```bash
npm run dev
```

Server berjalan di: `http://localhost:5000`

### 3️⃣ Setup Frontend (Client)
```bash
cd client
npm install
npm run dev
```

Frontend berjalan di `http://localhost:5173`

🎉 FinanceMate siap digunakan!

</details>

## 🔑 Akun Demo

Gunakan akun demo berikut untuk mencoba seluruh fitur **FinanceMate** tanpa perlu registrasi manual.

| Role | Email | Password |
|------|------|----------|
| 👑 **User (Mahasiswa)** | `dinda.student@example.com` | `password123` |
| 💰 **User (Normal)** | `budi.normal@example.com` | `password123` |
| 💸 **User (Boros)** | `kevin.boros@example.com` | `password123` |
| 📉 **User (Hemat)** | `siti.hemat@example.com` | `password123` |
| 💻 **User (Freelancer)** | `rian.freelance@example.com` | `password123` |


> ⚡ **Catatan:**  
> Akun-akun di atas dihasilkan melalui **database seeder**, lengkap dengan dompet, transaksi, dan anggaran,
> sehingga siap digunakan untuk mendemokan seluruh fitur FinanceMate.


<div align="center"> <h3>💡 FinanceMate – Smart Financial Freedom</h3> <p> Project ini dibuat sebagai <strong>portfolio Full-Stack Development</strong>, mencakup React Hooks, Context API, RESTful API, dan relasi database kompleks menggunakan Prisma ORM. </p> <p> Jika repository ini bermanfaat, jangan lupa beri bintang ⭐ untuk mendukung pengembangan selanjutnya. </p> <hr style="height:1px; width:50%; border-width:0; background-color:gray; margin: 20px auto;"> <p> <a href="mailto:nyomangedeewisaya@gmail">📧 Email</a> &nbsp;&nbsp;|&nbsp;&nbsp; <a href="https://wa.me/6285788773480">💬 WhatsApp</a> &nbsp;&nbsp;|&nbsp;&nbsp; <a href="https://github.com/nyomangedewisaya">🌐 GitHub</a> </p> </div> 
