  const express = require('express');
const path = require('path');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const cors = require('cors'); // Middleware CORS

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors()); // Aktifkan CORS

// Fungsi membaca dan menyimpan data pengguna
const getUsers = () => {
  const usersData = fs.readFileSync(path.join(__dirname, 'users.json'), 'utf-8');
  return JSON.parse(usersData);
};
const saveUser = (users) => {
  fs.writeFileSync(path.join(__dirname, 'users.json'), JSON.stringify(users, null, 2), 'utf-8');
};

// Static files
app.use(express.static(__dirname));

// Halaman utama
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Route Sign Up
app.get('/signup', (req, res) => {
  res.sendFile(path.join(__dirname, 'signup.html'));
});
app.post('/signup', async (req, res) => {
  const { username, email, password } = req.body;
  const users = getUsers();

  // Cek apakah email sudah terdaftar
  if (users.some(user => user.email === email)) {
    return res.status(400).json({ error: 'Email sudah terdaftar.' });
  }

  // Simpan user baru
  const hashedPassword = await bcrypt.hash(password, 10);
  users.push({ username, email, password: hashedPassword });
  saveUser(users);

  res.redirect('/signup-success');
});
app.get('/signup-success', (req, res) => {
  res.send('<h1>Sign Up Berhasil! Silakan <a href="/">login</a>.</h1>');
});

// Route Sign In
app.post('/signin', async (req, res) => {
  const { email, password } = req.body;
  const users = getUsers();
  const user = users.find(u => u.email === email);

  // Validasi email dan password
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(400).json({ error: 'Email atau password salah.' });
  }

  // Buat token
  const token = jwt.sign({ userId: user.email }, 'wanz', { expiresIn: '1h' });
  res.redirect(`/dashboard?token=${token}`);
});

// Route Dashboard
app.get('/dashboard', (req, res) => {
  const token = req.query.token;

  if (!token) {
    return res.status(403).send('<h1>Token not found. Please log in again.</h1>');
  }

  try {
    jwt.verify(token, 'wanz'); // Verifikasi token
    res.sendFile(path.join(__dirname, 'dashboard.html'));
  } catch (err) {
    res.status(400).send('<h1>Invalid token. Please log in again.</h1>');
  }
});

// Middleware verifikasi token
function verifyToken(req, res, next) {
  const token = req.query.token || req.headers['authorization'];

  if (!token) {
    return res.status(403).json({ error: 'Access denied, no token provided.' });
  }

  try {
    jwt.verify(token, 'wanz');
    next();
  } catch (err) {
    res.status(400).json({ error: 'Invalid token.' });
  }
}

// Route API (TikTok, Instagram, YouTube) Tanpa Validasi API Key
app.get('/instagram', verifyToken, (req, res) => {
  res.json({
    platform: 'Instagram',
    message: 'Access granted to Instagram API for everyone.',
    apikey: 'wanzofc'
  });
});
app.get('/youtube', verifyToken, (req, res) => {
  res.json({
    platform: 'YouTube',
    message: 'Access granted to YouTube API for everyone.',
    apikey: 'wanzofc'
  });
});
app.get('/tiktok', verifyToken, (req, res) => {
  res.json({
    platform: 'TikTok',
    message: 'Access granted to TikTok API for everyone.',
    apikey: 'wanzofc'
  });
});

// Debug API
app.get('/debug', (req, res) => {
  console.log('Query Parameters:', req.query);
  res.json({ receivedToken: req.query.token || 'None' });
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
