const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_srs_key_for_demo';

// Middleware to verify Admin JWT Token
const verifyAdmin = (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token) return res.status(403).json({ error: 'No token provided' });

  jwt.verify(token.split(' ')[1], JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ error: 'Unauthorized' });
    req.user = decoded; // Attach user info (e.g. email)
    next();
  });
};

// Login Route (Now using email and password)
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  
  // Hardcoded as requested
  if (email === 'admin@srs.in' && password === 'admin123') {
    const token = jwt.sign({ role: 'admin', email }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ success: true, token });
  } else {
    res.status(401).json({ success: false, message: 'Invalid credentials' });
  }
});

module.exports = { authRouter: router, verifyAdmin };
