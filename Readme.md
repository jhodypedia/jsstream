# 📺 JsStream — DoodStream Video Streaming Platform

🎬 **JsStream** adalah platform streaming video berbasis **Node.js + Express + EJS**, dirancang untuk menampilkan video dari **DoodStream iframe**. Mendukung navigasi **SPA/AJAX tanpa reload**, panel admin lengkap, sistem komentar, statistik, dan UI modern.

---

## 🚀 Fitur Utama

- ✅ Menonton video via iframe DoodStream  
- ✅ Infinite scroll & filter video: Terbaru / Populer  
- ✅ Navigasi AJAX SPA (tanpa reload halaman)  
- ✅ UI responsif & mobile-friendly  
- ✅ Dashboard untuk User & Admin  
- ✅ Panel Admin: CRUD video & pengguna  
- ✅ Login Multi Role: Admin / User  
- ✅ Komentar AJAX + notifikasi email  
- ✅ Sistem like video (per user/IP)  
- ✅ Statistik views total, per user, dan video  
- ✅ Register dengan verifikasi email (multi domain)  
- ✅ Reset password via email  
- ✅ Validasi nomor HP otomatis ke format +62  
- ✅ Tampilan elegan dengan Bootstrap 5, AOS, Toastr  
- ✅ Hash password menggunakan bcryptjs  
- ✅ Aman dari XSS & shell upload  
- ✅ Database: MySQL

---

## 🖼️ Cuplikan Tampilan

![JsStream Home](https://i.imgur.com/ExSample.png)  
<sub>Beranda video: card responsif, tombol like, filter, dan infinite scroll.</sub>

---

## 📦 Teknologi yang Digunakan

- 🟢 Node.js + Express
- 🎨 EJS + express-ejs-layouts
- 🗄️ MySQL + mysql2
- 🔐 bcryptjs (hash password)
- ✉️ nodemailer (email verifikasi / reset)
- 🧠 jQuery AJAX (SPA)
- 💬 Toastr + AOS + FontAwesome + Bootstrap 5

---

## 📁 Struktur Proyek

```
jsstream/
├── views/
│   ├── layout.ejs
│   └── pages/
│       ├── home.ejs
│       ├── login.ejs
│       ├── register.ejs
│       ├── upload.ejs
│       ├── account.ejs
│       ├── admin_dashboard.ejs
│       └── ...
├── public/
│   ├── css/
│   └── js/
├── routes/
├── server.js
├── db.sql
└── README.md
```

---

## ⚙️ Cara Instalasi

1. **Clone proyek**
```bash
git clone https://github.com/yourusername/jsstream.git
cd jsstream
```

2. **Install dependency**
```bash
npm install
```

3. **Import database**
```bash
# Gunakan phpMyAdmin atau MySQL CLI
mysql -u root -p jsstream < db.sql
```

4. **Konfigurasi `.env`**
Buat file `.env`:
```env
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASS=your_mysql_password
DB_NAME=jsstream

EMAIL_HOST=smtp.yourhost.com
EMAIL_USER=your@email.com
EMAIL_PASS=your_email_password

SITE_NAME=JsStream
```

5. **Jalankan server**
```bash
node server.js
```

---

## 🔐 Admin Default (Demo)

```text
Email: admin@jsstream.com
Password: admin123
```
> Harap ubah setelah login pertama!

---

## 💡 Kontribusi

Pull request sangat diterima. Fork repo ini dan kirim PR dengan deskripsi fitur/perbaikan yang jelas.

---

## 📧 Kontak

- **Author:** [@4rc0d3](https://github.com/jhodypedia)  
- **Email:** jhodypedia@gmail.com

---

## 🔥 Live Demo

`(Segera hadir...)`

---

> © 2025 JsStream — Dibuat dengan ❤️ oleh 4rc0d3
