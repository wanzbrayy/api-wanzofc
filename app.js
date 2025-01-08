const express = require('express');
const path = require('path');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const cors = require('cors'); // Tambahkan middleware CORS

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors()); // Aktifkan middleware CORS

// Static files (untuk HTML, CSS, JS)
app.use(express.static(__dirname));

// Fungsi untuk membaca data users dari file
const getUsers = () => {
  const usersData = fs.readFileSync(path.join(__dirname, 'users.json'), 'utf-8');
  return JSON.parse(usersData);
};

// Fungsi untuk menyimpan data users ke file
const saveUser = (users) => {
  fs.writeFileSync(path.join(__dirname, 'users.json'), JSON.stringify(users, null, 2), 'utf-8');
};

// Home route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Sign Up route
app.get('/signup', (req, res) => {
  res.sendFile(path.join(__dirname, 'signup.html'));
});

// Handle Sign Up
app.post('/signup', async (req, res) => {
  const { username, email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const users = getUsers();

  if (users.some(user => user.email === email)) {
    return res.status(400).json({ error: 'User with this email already exists' });
  }

  users.push({ username, email, password: hashedPassword });
  saveUser(users);

  res.redirect('/signup-success');
});

app.get('/signup-success', (req, res) => {
  res.send('<h1>Sign Up Successful! Please <a href="/">login</a> now.</h1>');
});

// Handle Sign In
app.post('/signin', async (req, res) => {
  const { email, password } = req.body;
  const users = getUsers();
  const user = users.find(u => u.email === email);

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(400).json({ error: 'Invalid email or password' });
  }

  const token = jwt.sign({ userId: user.email }, 'wanz', { expiresIn: '1h' });
  res.redirect(`/dashboard?token=${token}`);
});

// Dashboard route
app.get('/dashboard', (req, res) => {
  const token = req.query.token;

  if (!token) {
    return res.status(403).json({ error: 'Access denied, no token provided' });
  }

  try {
    jwt.verify(token, 'your-secret-key');
    res.sendFile(path.join(__dirname, 'dashboard.html'));
  } catch (err) {
    res.status(400).json({ error: 'Invalid token' });
  }
});

// Middleware untuk verifikasi token
function verifyToken(req, res, next) {
  const token = req.query.token || req.headers['authorization'];
  if (!token) {
    return res.status(403).json({ error: 'Access denied, no token provided' });
  }

  try {
    jwt.verify(token, 'wanz'); // Verifikasi token
    next();
  } catch (err) {
    res.status(400).json({ error: 'Invalid token' });
  }
}

// Instagram API route
app.get('/instagram', verifyToken, (req, res) => {
  const apiKey = req.query.apiKey;

  if (!apiKey) {
    return res.status(400).json({ error: 'Missing API key' });
  }

  if (apiKey !== 'wanzofc') {
    return res.status(403).json({ error: 'Invalid API key' });
  }

  res.json({
    message: 'Access granted',
    apikey: 'wanzofc',
  });
});

// YouTube API route
app.get('/youtube', verifyToken, (req, res) => {
  const apiKey = req.query.apiKey;

  if (!apiKey) {
    return res.status(400).json({ error: 'Missing API key' });
  }

  if (apiKey !== 'wanzofc') {
    return res.status(403).json({ error: 'Invalid API key' });
  }

  res.json({
    message: 'Access granted',
    apikey: 'wanzofc',
  });
});

// TikTok API route
app.get('/tiktok', verifyToken, (req, res) => {
  const apiKey = req.query.apiKey;

  if (!apiKey) {
    return res.status(400).json({ error: 'Missing API key' });
  }

  if (apiKey !== 'wanzofc') {
    return res.status(403).json({ error: 'Invalid API key' });
  }

  res.json({
    message: 'Access granted',
    apikey: 'wanzofc',
  });
});

// Debug API untuk cek parameter yang diterima
app.get('/debug', (req, res) => {
  console.log('Query Parameters:', req.query);
  res.json({
    receivedApiKey: req.query.apiKey || 'None',
  });
});

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
