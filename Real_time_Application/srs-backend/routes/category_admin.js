const express = require('express');
const mongoose = require('mongoose');
const { verifyAdmin, requirePermission } = require('./auth_admin');
const router = express.Router();

// ==========================================
// MODEL
// ==========================================
const CategorySchema = new mongoose.Schema({
  id: String, // String ID for URL matching (e.g., 'soft_silk')
  name: String,
  img: String,
  parentId: { type: String, default: null }, // If null, it's a Parent. If set, it's a Child pointing to a Parent's ID
  showInHeader: { type: Boolean, default: false }, // Only applicable to Parent Categories
  updatedBy: String,
  updatedAt: { type: Date, default: Date.now }
});
const Category = mongoose.model('Category', CategorySchema);

// ==========================================
// ROUTES
// ==========================================

// GET all categories (Public - for Customer Website)
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find();
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CREATE or UPDATE a category (Protected - for Admin)
router.post('/admin', verifyAdmin, requirePermission('categories'), async (req, res) => {
  try {
    const { id, _id, ...rest } = req.body; // strip _id to avoid immutable field error
    const data = {
      ...rest,
      id,
      parentId: rest.parentId || null,  // normalize empty string to null
      updatedBy: req.user.email,
      updatedAt: Date.now()
    };
    const updated = await Category.findOneAndUpdate({ id }, data, { upsert: true, new: true });
    res.json({ success: true, category: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE an existing category (Protected - for Admin)
router.put('/admin/:id', verifyAdmin, requirePermission('categories'), async (req, res) => {
  try {
    const { _id, ...rest } = req.body; // strip _id
    const data = { ...rest, parentId: rest.parentId || null, updatedBy: req.user.email, updatedAt: Date.now() };
    const updated = await Category.findOneAndUpdate({ id: req.params.id }, data, { new: true });
    if (!updated) return res.status(404).json({ error: 'Category not found' });
    res.json({ success: true, category: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE a category (Protected - for Admin)
router.delete('/admin/:id', verifyAdmin, requirePermission('categories'), async (req, res) => {
  try {
    await Category.findOneAndDelete({ id: req.params.id });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = { Category, categoryRouter: router };
