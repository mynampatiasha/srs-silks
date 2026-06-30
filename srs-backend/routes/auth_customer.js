const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'srs_silks_super_secret_key_2026';

// ==========================================
// MODEL
// ==========================================
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: false },
  password: { type: String, required: false }, // Optional for OAuth
  authProvider: { type: String, default: 'local' },
  addresses: [{
    name: { type: String, required: true },
    phone: { type: String, required: true },
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    type: { type: String, default: 'Home' }
  }],
  wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
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

// Google Login / Register
router.post('/google-login', async (req, res) => {
  try {
    const { name, email } = req.body;
    
    // Check if user exists
    let user = await User.findOne({ email });
    
    if (!user) {
      // Create new user
      user = new User({
        name,
        email,
        authProvider: 'google',
        lastLogin: new Date()
      });
      await user.save();
    } else {
      // Update last login and provider if needed
      user.lastLogin = new Date();
      if (user.authProvider !== 'google') {
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
// PROFILE ROUTES
// ==========================================

// Get user profile
router.get('/profile', verifyCustomer, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update user profile
router.put('/profile', verifyCustomer, async (req, res) => {
  try {
    const { name, phone } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (name) user.name = name;
    if (phone) user.phone = phone;

    await user.save();
    
    // Create new token in case name changed, so frontend can update
    const token = jwt.sign({ id: user._id, email: user.email, name: user.name, role: 'customer' }, JWT_SECRET, { expiresIn: '7d' });
    
    res.json({ success: true, user: { id: user._id, name: user.name, email: user.email, phone: user.phone }, token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Change user password
router.put('/change-password', verifyCustomer, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (!user.password) return res.status(400).json({ error: 'This account uses external login (e.g. Google) and does not have a password.' });

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(400).json({ error: 'Incorrect current password' });

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    user.password = hashedPassword;
    await user.save();

    res.json({ success: true, message: 'Password updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// ADDRESSES ROUTES
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

// Add a new address
router.post('/addresses', verifyCustomer, async (req, res) => {
  try {
    const { name, phone, street, city, state, pincode, type } = req.body;
    if (!name || !phone || !street || !city || !state || !pincode) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const newAddress = { name, phone, street, city, state, pincode, type: type || 'Home' };
    user.addresses.push(newAddress);
    await user.save();

    res.json(user.addresses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete an address
router.delete('/addresses/:addressId', verifyCustomer, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    user.addresses = user.addresses.filter(addr => addr._id.toString() !== req.params.addressId);
    await user.save();

    res.json(user.addresses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

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

module.exports = { authCustomerRouter: router, verifyCustomer, User };
