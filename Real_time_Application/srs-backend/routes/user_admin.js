const express = require('express');
const { verifyAdmin, requirePermission } = require('./auth_admin');
const { User } = require('./auth_customer');
const router = express.Router();

// ==========================================
// ROUTES
// ==========================================

// GET all customers with filters (Admin only)
router.get('/', verifyAdmin, requirePermission('customers'), async (req, res) => {
  try {
    const { search, sortBy } = req.query;
    
    let query = {};
    if (search) {
      query = {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ]
      };
    }

    let sortOption = { createdAt: -1 };
    if (sortBy === 'oldest') sortOption = { createdAt: 1 };
    if (sortBy === 'name') sortOption = { name: 1 };
    if (sortBy === 'lastLogin') sortOption = { lastLogin: -1 };

    const users = await User.find(query).sort(sortOption).select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET customer analytics (Admin only)
router.get('/analytics', verifyAdmin, requirePermission('customers'), async (req, res) => {
  try {
    const now = new Date();
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);

    const totalUsers = await User.countDocuments();
    
    const thisMonthUsers = await User.countDocuments({
      createdAt: { $gte: startOfThisMonth }
    });

    const lastMonthUsers = await User.countDocuments({
      createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth }
    });

    // Active vs Inactive (Logged in within last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(now.getDate() - 30);
    
    const activeUsers = await User.countDocuments({
      lastLogin: { $gte: thirtyDaysAgo }
    });
    
    const inactiveUsers = totalUsers - activeUsers;

    res.json({
      totalUsers,
      thisMonthUsers,
      lastMonthUsers,
      activeUsers,
      inactiveUsers
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE customer (Admin only)
router.delete('/:id', verifyAdmin, requirePermission('customers'), async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = { userRouter: router };
