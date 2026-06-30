const express = require('express');
const mongoose = require('mongoose');
const { verifyAdmin } = require('./auth_admin');
const router = express.Router();

// ==========================================
// MODEL
// ==========================================
const BannerSchema = new mongoose.Schema({
  label: String,
  alt: String,
  url: String, // Base64 or external URL
  createdBy: String,
  createdAt: { type: Date, default: Date.now }
});
const Banner = mongoose.model('Banner', BannerSchema);

// ==========================================
// ROUTES
// ==========================================

// GET all banners (Public - for Customer Website)
router.get('/', async (req, res) => {
  try {
    const banners = await Banner.find().sort({ createdAt: -1 });
    res.json(banners);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CREATE a banner (Protected - for Admin)
router.post('/admin', verifyAdmin, async (req, res) => {
  try {
    const banner = new Banner({ ...req.body, createdBy: req.user.email });
    await banner.save();
    res.json({ success: true, banner });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE a banner (Protected - for Admin)
router.delete('/admin/:id', verifyAdmin, async (req, res) => {
  try {
    await Banner.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = { Banner, bannerRouter: router };
