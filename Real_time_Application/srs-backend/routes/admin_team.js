const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();
const { verifyAdmin } = require('./auth_admin');
const AdminUser = require('../models/AdminUser');

const requireOwner = (req, res, next) => {
  if (req.user?.role !== 'owner') return res.status(403).json({ error: 'Owner access only' });
  next();
};

// GET all admin team members (Owner only)
router.get('/', verifyAdmin, requireOwner, async (req, res) => {
  try {
    const users = await AdminUser.find().select('-passwordHash').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CREATE a team member (Owner only)
router.post('/', verifyAdmin, requireOwner, async (req, res) => {
  try {
    const { name, email, password, role = 'staff', permissions = {} } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'name, email and password are required' });
    }
    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    const existing = await AdminUser.findOne({ email: email.toLowerCase() });
    if (existing) return res.status(409).json({ error: 'A user with this email already exists' });

    const passwordHash = await bcrypt.hash(password, 12);
    const user = new AdminUser({ name, email: email.toLowerCase(), passwordHash, role, permissions });
    await user.save();

    const { passwordHash: _omit, ...safe } = user.toObject();
    res.json({ success: true, user: safe });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE a team member's role/permissions/status/password (Owner only)
router.put('/:id', verifyAdmin, requireOwner, async (req, res) => {
  try {
    const { name, role, permissions, status, password } = req.body;
    const update = { name, role, permissions, status };

    if (password) {
      if (password.length < 8) {
        return res.status(400).json({ error: 'Password must be at least 8 characters' });
      }
      update.passwordHash = await bcrypt.hash(password, 12);
    }

    const user = await AdminUser.findByIdAndUpdate(req.params.id, update, { new: true }).select('-passwordHash');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE a team member (Owner only)
router.delete('/:id', verifyAdmin, requireOwner, async (req, res) => {
  try {
    if (req.params.id === String(req.user.id)) {
      return res.status(400).json({ error: "You can't delete your own account" });
    }

    const target = await AdminUser.findById(req.params.id);
    if (!target) return res.status(404).json({ error: 'User not found' });

    if (target.role === 'owner') {
      const ownerCount = await AdminUser.countDocuments({ role: 'owner' });
      if (ownerCount <= 1) return res.status(400).json({ error: 'At least one owner account must remain' });
    }

    await AdminUser.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = { adminTeamRouter: router };
