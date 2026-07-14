const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Review = require('../models/Review');
const { UserSchema } = require('./auth_customer');
const mongoose = require('mongoose');
const User = mongoose.models.User || mongoose.model('User', UserSchema);

router.get('/dashboard-summary', async (req, res) => {
  try {
    const twoDaysAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);

    const [
      newOrders, newOrdersCount,
      returns, returnsCount,
      pendingReviews, pendingReviewsCount,
      newCustomers, newCustomersCount
    ] = await Promise.all([
      Order.find({ status: 'Processing' })
        .sort({ createdAt: -1 }).limit(5)
        .populate('customer', 'name')
        .select('customer totalAmount createdAt shippingAddress'),
      Order.countDocuments({ status: 'Processing' }),

      Order.find({ status: 'Return Requested' })
        .sort({ updatedAt: -1 }).limit(5)
        .populate('customer', 'name')
        .select('customer totalAmount updatedAt shippingAddress'),
      Order.countDocuments({ status: 'Return Requested' }),

      Review.find({ status: 'Pending' })
        .sort({ createdAt: -1 }).limit(5)
        .populate('user', 'name')
        .populate('product', 'name')
        .select('rating createdAt user product'),
      Review.countDocuments({ status: 'Pending' }),

      User.find({ createdAt: { $gte: twoDaysAgo } })
        .sort({ createdAt: -1 }).limit(5)
        .select('name email createdAt'),
      User.countDocuments({ createdAt: { $gte: twoDaysAgo } })
    ]);

    res.json({
      orders: { count: newOrdersCount, items: newOrders },
      returns: { count: returnsCount, items: returns },
      reviews: { count: pendingReviewsCount, items: pendingReviews },
      customers: { count: newCustomersCount, items: newCustomers }
    });
  } catch (err) {
    console.error('Dashboard summary error:', err);
    res.status(500).json({ message: 'Failed to load dashboard summary' });
  }
});

module.exports = router;
