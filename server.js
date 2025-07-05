const express = require('express');
const app = express();
const session = require('express-session');
const mysql = require('mysql');
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const path = require('path');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const expressLayouts = require('express-ejs-layouts');

require('dotenv').config();

// Setup View Engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(expressLayouts);
app.set('layout', 'layout');

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(session({
  secret: 'jsstream_secret',
  resave: false,
  saveUninitialized: false
}));

// DB Connect
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'jsstream'
});
db.connect(err => {
  if (err) throw err;
  console.log('✅ MySQL Connected');
});

// Email
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASS
  }
});

function generateEmailHTML(subject, body) {
  return `
  <div style="max-width:600px;margin:0 auto;font-family:sans-serif;border:1px solid #ddd;padding:20px">
    <h2 style="color:#4a4a4a">${subject}</h2>
    <p>${body}</p>
    <hr/>
    <p style="font-size:12px;color:#888;text-align:center">Email ini dikirim otomatis oleh sistem <b>JsStream</b>.</p>
  </div>`;
}

// Middleware Auth
function isLogin(req, res, next) {
  if (req.session.user) return next();
  res.redirect('/');
}
function isAdmin(req, res, next) {
  if (req.session.user?.role === 'admin') return next();
  res.redirect('/');
}

// ======================== ROUTES ========================

// Halaman
app.get('/', (req, res) => res.render('pages/home', { user: req.session.user }));
app.get('/login', (req, res) => res.render('pages/login'));
app.get('/register', (req, res) => res.render('pages/register'));
app.get('/forgot', (req, res) => res.render('pages/forgot_password'));
app.get('/reset/:token', (req, res) => res.render('pages/reset_password', { token: req.params.token }));
app.get('/upload', isLogin, (req, res) => res.render('pages/upload', { user: req.session.user }));
app.get('/account', isLogin, (req, res) => res.render('pages/account', { user: req.session.user }));
app.get('/admin', isAdmin, (req, res) => res.render('pages/admin_dashboard', { user: req.session.user }));

// Logout
app.get('/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/'));
});

// ====================== AUTH =========================

// Register
app.post('/register', (req, res) => {
  const { username, email, nohp, password } = req.body;
  const phone = nohp.startsWith('08') ? nohp.replace(/^08/, '+628') : nohp;
  if (!email.includes('@')) return res.status(400).json({ error: 'Email tidak valid' });

  db.query('SELECT * FROM users WHERE email = ?', [email], (err, users) => {
    if (users.length) return res.status(400).json({ error: 'Email sudah terdaftar' });
    const hashed = bcrypt.hashSync(password, 10);
    const token = crypto.randomBytes(20).toString('hex');
    db.query('INSERT INTO users(username,email,nohp,password,role,verified,token) VALUES(?,?,?,?,?,?,?)',
      [username, email, phone, hashed, 'user', 0, token], err => {
        if (err) return res.status(500).json({ error: 'Gagal mendaftar' });

        const link = `http://localhost:3000/verify/${token}`;
        const html = generateEmailHTML('Verifikasi Email JsStream', `Silakan klik link berikut untuk verifikasi akun:<br><a href="${link}">${link}</a>`);
        transporter.sendMail({
          from: 'JsStream <noreply@jsstream.com>',
          to: email,
          subject: 'Verifikasi Email',
          html
        }, () => res.json({ message: 'Pendaftaran berhasil! Cek email untuk verifikasi.' }));
      });
  });
});

// Verifikasi Email
app.get('/verify/:token', (req, res) => {
  const token = req.params.token;
  db.query('UPDATE users SET verified=1 WHERE token=?', [token], () => {
    res.redirect('/login');
  });
});

// Login
app.post('/login', (req, res) => {
  const { email, password } = req.body;
  db.query('SELECT * FROM users WHERE email=?', [email], (err, users) => {
    if (!users.length) return res.status(400).json({ error: 'Akun tidak ditemukan' });
    const user = users[0];
    if (!user.verified) return res.status(400).json({ error: 'Email belum diverifikasi' });
    if (!bcrypt.compareSync(password, user.password)) return res.status(400).json({ error: 'Password salah' });

    req.session.user = user;
    res.json({ message: 'Login berhasil', redirect: '/' });
  });
});

// Forgot Password
app.post('/forgot', (req, res) => {
  const { email } = req.body;
  db.query('SELECT * FROM users WHERE email=?', [email], (err, users) => {
    if (!users.length) return res.status(400).json({ error: 'Email tidak ditemukan' });
    const token = crypto.randomBytes(20).toString('hex');
    db.query('UPDATE users SET token=? WHERE email=?', [token, email]);

    const link = `http://localhost:3000/reset/${token}`;
    const html = generateEmailHTML('Reset Password JsStream', `Klik link berikut untuk atur ulang password:<br><a href="${link}">${link}</a>`);
    transporter.sendMail({
      from: 'JsStream <noreply@jsstream.com>',
      to: email,
      subject: 'Reset Password',
      html
    }, () => res.json({ message: 'Link reset telah dikirim ke email Anda' }));
  });
});

// Reset Password
app.post('/reset', (req, res) => {
  const { token, password } = req.body;
  const hashed = bcrypt.hashSync(password, 10);
  db.query('UPDATE users SET password=?, token=NULL WHERE token=?', [hashed, token], err => {
    if (err) return res.status(500).json({ error: 'Gagal reset password' });
    res.json({ message: 'Password berhasil direset!' });
  });
});

// ====================== VIDEO =========================

// Upload Video (iframe DoodStream)
app.post('/api/upload', isLogin, (req, res) => {
  const { title, iframe_url, duration } = req.body;
  if (!iframe_url.includes('<iframe')) return res.status(400).json({ error: 'Iframe tidak valid' });
  db.query('INSERT INTO videos(user_id,title,iframe_url,duration,views,likes,created_at) VALUES(?,?,?,?,0,0,NOW())',
    [req.session.user.id, title, iframe_url, duration], err => {
      if (err) return res.status(500).json({ error: 'Gagal upload' });
      res.json({ message: 'Video berhasil ditambahkan' });
    });
});

// Get Videos
app.get('/api/videos', (req, res) => {
  const { filter = 'latest', q = '', page = 1 } = req.query;
  const offset = (parseInt(page) - 1) * 8;
  let sql = 'SELECT * FROM videos WHERE title LIKE ?';
  if (filter === 'popular') sql += ' ORDER BY views DESC';
  else sql += ' ORDER BY created_at DESC';
  sql += ' LIMIT 8 OFFSET ?';

  db.query(sql, [`%${q}%`, offset], (err, videos) => {
    const badges = ['primary', 'danger', 'success', 'warning', 'info'];
    const withBadge = videos.map(v => ({ ...v, badge: badges[Math.floor(Math.random() * badges.length)] }));
    res.json(withBadge);
  });
});

// Like Video
app.post('/api/like/:id', (req, res) => {
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  const video_id = req.params.id;
  db.query('SELECT * FROM likes WHERE video_id=? AND ip=?', [video_id, ip], (err, rows) => {
    if (rows.length) return res.status(400).json({ error: 'Sudah like' });
    db.query('INSERT INTO likes(video_id,ip) VALUES(?,?)', [video_id, ip]);
    db.query('UPDATE videos SET likes = likes + 1 WHERE id=?', [video_id]);
    db.query('SELECT likes FROM videos WHERE id=?', [video_id], (err, r) => {
      res.json({ likes: r[0].likes });
    });
  });
});

// Komentar
app.post('/api/comment', (req, res) => {
  const { video_id, comment, name } = req.body;
  const nama = name || 'Anonymous';
  if (!comment || comment.length < 2) return res.status(400).json({ error: 'Komentar kosong' });

  db.query('INSERT INTO comments(video_id,name,comment) VALUES(?,?,?)', [video_id, nama, comment], () => {
    res.json({ comment: `<strong>${nama}</strong>: ${comment}` });
  });
});

// Dashboard Stats Admin
app.get('/api/admin/stats', isAdmin, (req, res) => {
  db.query('SELECT COUNT(*) as users FROM users', (err, u) => {
    db.query('SELECT COUNT(*) as videos FROM videos', (err, v) => {
      db.query('SELECT SUM(views) as views FROM videos', (err, vw) => {
        res.json({ users: u[0].users, videos: v[0].videos, views: vw[0].views });
      });
    });
  });
});

// Dashboard Stats User
app.get('/api/account/views', isLogin, (req, res) => {
  db.query('SELECT SUM(views) as views FROM videos WHERE user_id=?', [req.session.user.id], (err, v) => {
    res.json({ views: v[0].views || 0 });
  });
});

// Start Server
app.listen(3000, () => {
  console.log('🚀 JsStream running on http://localhost:3000');
});
