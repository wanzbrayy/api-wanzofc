const express = require('express');
const path = require('path');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files (to serve HTML, CSS, JS files)
app.use(express.static(__dirname));

// Function to read users from the users.json file
const getUsers = () => {
  const usersData = fs.readFileSync(path.join(__dirname, 'users.json'), 'utf-8');
  return JSON.parse(usersData);
};

// Function to write users to the users.json file
const saveUser = (users) => {
  fs.writeFileSync(path.join(__dirname, 'users.json'), JSON.stringify(users, null, 2), 'utf-8');
};

// Home route (renders login page)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Sign Up route (renders sign up page)
app.get('/signup', (req, res) => {
  res.sendFile(path.join(__dirname, 'signup.html'));
});

// Handle Sign Up (save user to users.json)
app.post('/signup', async (req, res) => {
  const { username, email, password } = req.body;

  // Hash the password before saving it
  const hashedPassword = await bcrypt.hash(password, 10);

  // Get the current users from users.json
  const users = getUsers();

  // Check if user already exists
  if (users.some(user => user.email === email)) {
    return res.status(400).json({ error: 'User with this email already exists' });
  }

  // Save new user
  users.push({ username, email, password: hashedPassword });
  saveUser(users);

  // Redirect to login after sign up
  res.redirect('/signup-success');
});

// Success page after sign up
app.get('/signup-success', (req, res) => {
  res.send('<h1>Sign Up Successful! Please <a href="/">login</a> now.</h1>');
});

// Handle Sign In (check credentials, generate token)
app.post('/signin', async (req, res) => {
  const { email, password } = req.body;

  // Get users from users.json
  const users = getUsers();

  // Find the user by email
  const user = users.find(u => u.email === email);
  if (!user) {
    return res.status(400).json({ error: 'Invalid email or password' });
  }

  // Check if the password matches
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(400).json({ error: 'Invalid email or password' });
  }

  // Generate a JWT token
  const token = jwt.sign({ userId: user.email }, 'your-secret-key', { expiresIn: '1h' });

  // Redirect to dashboard after login with token
  res.redirect(`/dashboard?token=${token}`);
});

// Dashboard route (protected, requires JWT token)
app.get('/dashboard', (req, res) => {
  const token = req.query.token;

  if (!token) {
    return res.status(403).json({ error: 'Access denied, no token provided' });
  }

  try {
    const decoded = jwt.verify(token, 'your-secret-key');
    res.sendFile(path.join(__dirname, 'dashboard.html'));
  } catch (err) {
    res.status(400).json({ error: 'Invalid token' });
  }
});

// Instagram API route - Requires API Key validation
app.get('/instagram', (req, res) => {
  const apiKey = req.query.apiKey;

  // Validate the API key
  if (apiKey !== 'wanzofc') {
    return res.status(403).json({ error: 'Invalid or missing API key' });
  }

  // Return Instagram API key if valid
  res.json({
    apikey: 'wanzofc',
  });
});

// YouTube API route - Requires API Key validation
app.get('/youtube', (req, res) => {
  const apiKey = req.query.apiKey;

  // Validate the API key
  if (apiKey !== 'wanzofc') {
    return res.status(403).json({ error: 'Invalid or missing API key' });
  }

  // Return YouTube API key if valid
  res.json({
    apikey: 'wanzofc',
  });
});

// TikTok API route - Requires API Key validation
app.get('/tiktok', (req, res) => {
  const apiKey = req.query.apiKey;

  // Validate the API key
  if (apiKey !== 'wanzofc') {
    return res.status(403).json({ error: 'Invalid or missing API key' });
  }

  // Return TikTok API key if valid
  res.json({
    apikey: 'wanzofc',
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
