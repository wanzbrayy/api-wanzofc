const express = require("express");
const path = require("path");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const fs = require("fs");
const cors = require("cors");

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(express.static(__dirname));

// Fungsi untuk membaca dan menyimpan data pengguna
const getUsers = () => {
  const usersData = fs.readFileSync(path.join(__dirname, "users.json"), "utf-8");
  return JSON.parse(usersData);
};
const saveUser = (users) => {
  fs.writeFileSync(path.join(__dirname, "users.json"), JSON.stringify(users, null, 2));
};

// Route utama
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.get("/signup", (req, res) => {
  res.sendFile(path.join(__dirname, "signup.html"));
});

app.post("/signup", async (req, res) => {
  const { username, email, password } = req.body;
  const users = getUsers();

  if (users.some((user) => user.email === email)) {
    return res.status(400).json({ error: "Email sudah terdaftar." });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  users.push({ username, email, password: hashedPassword });
  saveUser(users);

  res.redirect("/");
});

app.post("/signin", async (req, res) => {
  const { email, password } = req.body;
  const users = getUsers();
  const user = users.find((u) => u.email === email);

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(400).json({ error: "Email atau password salah." });
  }

  const token = jwt.sign({ userId: user.email }, "wanz", { expiresIn: "1h" });
  res.redirect(`/dashboard.html?token=${token}`);
});

app.get("/tiktok", (req, res) => {
  const { apiKey, token } = req.query;

  if (apiKey === "wanzofc" && token) {
    return res.json({ platform: "TikTok", apiKey, token });
  }

  res.status(400).json({ error: "Invalid API Key or Token" });
});

// Server
app.listen(port, () => console.log(`Server running on port ${port}`));
