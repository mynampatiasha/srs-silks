const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'srs_silks_super_secret_key_2026';

// ==========================================
// MODEL
// ==========================================
const AddressSchema = new mongoose.Schema({
  name: String,
  phone: String,
  street: String,
  city: String,
  state: String,
  pincode: String,
  type: String
});

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: false },
  password: { type: String, required: false }, // Hashed
  authProvider: { type: String, default: 'local' },
  wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  addresses: [AddressSchema],
  lastLogin: { type: Date },
  createdAt: { type: Date, default: Date.now }
});
const User = mongoose.model('User', UserSchema);

// ==========================================
// ROUTES
// ==========================================

// Register a new customer
router.post('/register', async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;
    
    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already in use' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = new User({
      name,
      email,
      phone,
      password: hashedPassword,
      lastLogin: new Date()
    });
    await user.save();

    // Create token
    const token = jwt.sign({ id: user._id, email: user.email, role: 'customer' }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      success: true,
      token,
      user: { id: user._id, name: user.name, email: user.email }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Login customer
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Create token
    const token = jwt.sign({ id: user._id, email: user.email, role: 'customer' }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      success: true,
      token,
      user: { id: user._id, name: user.name, email: user.email }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Google Login / Registration
router.post('/google-login', async (req, res) => {
  try {
    const { name, email, authProvider } = req.body;

    // Check if user exists
    let user = await User.findOne({ email });

    if (!user) {
      // Create new user if doesn't exist
      user = new User({
        name,
        email,
        authProvider: 'google',
        lastLogin: new Date()
      });
      await user.save();
    } else {
      // Update last login
      user.lastLogin = new Date();
      if (!user.authProvider || user.authProvider === 'local') {
        user.authProvider = 'google';
      }
      await user.save();
    }

    // Create token
    const token = jwt.sign({ id: user._id, email: user.email, role: 'customer' }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      success: true,
      token,
      user: { id: user._id, name: user.name, email: user.email }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Middleware to verify customer token
const verifyCustomer = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Access denied. No token provided.' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(400).json({ error: 'Invalid token.' });
  }
};

// ==========================================
// WISHLIST ROUTES
// ==========================================

// Get user wishlist
router.get('/wishlist', verifyCustomer, async (req, res) => {
  try {
    // Populate the product details
    const user = await User.findById(req.user.id).populate('wishlist');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user.wishlist);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Toggle wishlist item
router.post('/wishlist/toggle', verifyCustomer, async (req, res) => {
  try {
    const { productId } = req.body;
    if (!productId) return res.status(400).json({ error: 'Product ID required' });

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const index = user.wishlist.indexOf(productId);
    if (index > -1) {
      // Remove if exists
      user.wishlist.splice(index, 1);
    } else {
      // Add if doesn't exist
      user.wishlist.push(productId);
    }

    await user.save();
    
    // Return populated wishlist
    const populatedUser = await User.findById(req.user.id).populate('wishlist');
    res.json(populatedUser.wishlist);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// ADDRESS ROUTES
// ==========================================

// Get user addresses
router.get('/addresses', verifyCustomer, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user.addresses || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add new address
router.post('/addresses', verifyCustomer, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    user.addresses.push(req.body);
    await user.save();
    
    res.json(user.addresses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete address
router.delete('/addresses/:id', verifyCustomer, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    user.addresses = user.addresses.filter(addr => addr._id.toString() !== req.params.id);
    await user.save();
    
    res.json(user.addresses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = { authCustomerRouter: router, verifyCustomer, User };
