const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Order = require('../models/Order');
const Product = require('../models/Product');
const { verifyAdmin, requirePermission } = require('./auth_admin');

const SECRET = process.env.JWT_SECRET || 'srs_silks_super_secret_key_2026';

// Middleware to verify customer token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Access Denied' });

  jwt.verify(token, SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid Token' });
    req.user = user;
    next();
  });
};

// @route   POST /api/orders
// @desc    Place a new order
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod, totalAmount } = req.body;
    
    // Create the order
    const newOrder = new Order({
      customer: req.user.id,
      items,
      shippingAddress,
      paymentMethod,
      totalAmount
    });

    const savedOrder = await newOrder.save();
    
    // (Optional) Decrease product stock based on quantity here if needed in future

    res.status(201).json(savedOrder);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/orders/my-orders
// @desc    Get orders for logged in customer
router.get('/my-orders', authenticateToken, async (req, res) => {
  try {
    const orders = await Order.find({ customer: req.user.id })
                              .populate('items.product')
                              .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/orders/:id/return
// @desc    Customer requests a return
router.put('/:id/return', authenticateToken, async (req, res) => {
  try {
    const { returnImage, returnReason } = req.body;
    
    const order = await Order.findOne({ _id: req.params.id, customer: req.user.id });
    if (!order) return res.status(404).json({ message: 'Order not found' });

    order.status = 'Return Requested';
    order.returnImage = returnImage;
    order.returnReason = returnReason;
    order.statusHistory.push({ status: 'Return Requested', date: new Date() });
    
    await order.save();
    
    res.json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ==========================================
// ADMIN ROUTES
// ==========================================

// @route   GET /api/orders/admin/all
// @desc    Get all orders for admin
router.get('/admin/all', verifyAdmin, requirePermission('orders'), async (req, res) => {
  try {
    const orders = await Order.find()
                              .populate('customer', 'name email phone')
                              .populate('items.product')
                              .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/orders/admin/:id/status
// @desc    Update order status and add to history
router.put('/admin/:id/status', verifyAdmin, requirePermission('orders'), async (req, res) => {
  try {
    const { status } = req.body;
    
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.status = status;
    order.statusHistory.push({ status, date: new Date() });
    
    await order.save();
    
    res.json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/orders/admin/:id/return-action
// @desc    Admin accepts or rejects a return
router.put('/admin/:id/return-action', verifyAdmin, requirePermission('returns'), async (req, res) => {
  try {
    const { action, adminRejectReason } = req.body; // action = 'Accept' or 'Reject'
    
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    if (action === 'Accept') {
      order.status = 'Return Accepted';
      order.statusHistory.push({ status: 'Return Accepted', date: new Date() });
    } else if (action === 'Reject') {
      order.status = 'Delivered'; // Revert back to delivered
      order.adminRejectReason = adminRejectReason;
      order.statusHistory.push({ status: 'Return Rejected', date: new Date() });
    }

    await order.save();
    res.json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/orders/admin/:id
// @desc    Delete an order completely
router.delete('/admin/:id', verifyAdmin, requirePermission('orders'), async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.json({ message: 'Order deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
