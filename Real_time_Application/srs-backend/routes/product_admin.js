const express = require('express');
const mongoose = require('mongoose');
const { verifyAdmin } = require('./auth_admin');
const router = express.Router();

// ==========================================
// MODEL
// ==========================================
const Product = require('../models/Product');
const Review = require('../models/Review');
const Order = require('../models/Order');
const { verifyCustomer } = require('./auth_customer');

// ==========================================
// ROUTES
// ==========================================

// GET all products (Public - for Customer Website)
router.get('/', async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET a single product by ID (Public - for Customer Website)
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CREATE a product (Protected - for Admin)
router.post('/admin', verifyAdmin, async (req, res) => {
  try {
    const product = new Product({ ...req.body, createdBy: req.user.email, updatedBy: req.user.email, updatedAt: Date.now() });
    await product.save();
    res.json({ success: true, product });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE a product (Protected - for Admin)
router.put('/admin/:id', verifyAdmin, async (req, res) => {
  try {
    const data = { ...req.body, updatedBy: req.user.email, updatedAt: Date.now() };
    const product = await Product.findByIdAndUpdate(req.params.id, data, { new: true });
    res.json({ success: true, product });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE a product (Protected - for Admin)
router.delete('/admin/:id', verifyAdmin, async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// TOGGLE STOCK (Protected - for Admin)
router.put('/admin/:id/toggleStock', verifyAdmin, async (req, res) => {
  try {
    const { inStock } = req.body;
    const product = await Product.findByIdAndUpdate(req.params.id, { inStock, updatedBy: req.user.email, updatedAt: Date.now() }, { new: true });
    res.json({ success: true, product });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// REVIEW ROUTES
// ==========================================

// POST a review (Protected - for Customer)
router.post('/:id/reviews', verifyCustomer, async (req, res) => {
  try {
    const productId = req.params.id;
    const customerId = req.user.id;
    const { rating, comment, image } = req.body;

    // Verify if the customer has a "Delivered" order for this product
    const order = await Order.findOne({
      customer: customerId,
      "items.product": productId,
      status: "Delivered"
    });

    // Uncomment this for strict verification. Commented out for easier testing in development
    /*
    if (!order) {
      return res.status(403).json({ error: 'You can only review products that have been delivered to you.' });
    }
    */

    const review = new Review({
      user: customerId,
      product: productId,
      rating,
      comment,
      image,
      status: 'Pending'
    });

    await review.save();
    res.status(201).json({ success: true, review });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET all approved reviews for a product (Public)
router.get('/:id/reviews', async (req, res) => {
  try {
    const reviews = await Review.find({ product: req.params.id, status: 'Approved' })
      .populate('user', 'name')
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET all reviews (Protected - for Admin)
router.get('/admin/all-reviews', verifyAdmin, async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate('user', 'name email')
      .populate('product', 'name imgUrls img')
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE review status (Protected - for Admin)
router.put('/admin/reviews/:reviewId', verifyAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    if (!['Pending', 'Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    const review = await Review.findByIdAndUpdate(req.params.reviewId, { status }, { new: true });
    res.json({ success: true, review });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = { Product, productRouter: router };
