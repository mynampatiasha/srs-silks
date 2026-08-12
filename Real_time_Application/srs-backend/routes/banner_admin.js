const express = require('express');
const mongoose = require('mongoose');
const { verifyAdmin, requirePermission } = require('./auth_admin');
const router = express.Router();

// ==========================================
// MODEL
// ==========================================
const BannerSchema = new mongoose.Schema({
  label: String,
  alt: String,
  url: String, // Base64 or external URL
  linkCategoryIds: [String],
  isActive: { type: Boolean, default: true },
  createdBy: String,
  createdAt: { type: Date, default: Date.now }
});
const Banner = mongoose.model('Banner', BannerSchema);

// ==========================================
// ROUTES
// ==========================================

// GET all banners (Public - for Customer Website) — only active ones
router.get('/', async (req, res) => {
  try {
    const banners = await Banner.find({ isActive: { $ne: false } }).sort({ createdAt: -1 });
    res.json(banners);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET all banners (Protected - for Admin) — includes inactive ones
router.get('/admin/all', verifyAdmin, requirePermission('banners'), async (req, res) => {
  try {
    const banners = await Banner.find().sort({ createdAt: -1 });
    res.json(banners);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CREATE a banner (Protected - for Admin)
router.post('/admin', verifyAdmin, requirePermission('banners'), async (req, res) => {
  try {
    const payload = { ...req.body };
    if (!payload._id) delete payload._id; // Prevent CastError if _id is empty string
    
    const banner = new Banner({ ...payload, createdBy: req.user.email });
    await banner.save();
    res.json({ success: true, banner });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE a banner (Protected - for Admin)
router.put('/admin/:id', verifyAdmin, requirePermission('banners'), async (req, res) => {
  try {
    const payload = { ...req.body };
    delete payload._id; // Ensure we don't try to mutate _id
    
    const banner = await Banner.findByIdAndUpdate(req.params.id, payload, { new: true });
    if (!banner) return res.status(404).json({ error: 'Banner not found' });
    res.json({ success: true, banner });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// TOGGLE active/inactive (Protected - for Admin)
router.patch('/admin/:id/toggle', verifyAdmin, requirePermission('banners'), async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);
    if (!banner) return res.status(404).json({ error: 'Banner not found' });
    banner.isActive = !banner.isActive;
    await banner.save();
    res.json({ success: true, banner });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE a banner (Protected - for Admin)
router.delete('/admin/:id', verifyAdmin, requirePermission('banners'), async (req, res) => {
  try {
    await Banner.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = { Banner, bannerRouter: router };
