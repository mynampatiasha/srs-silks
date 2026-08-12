const mongoose = require('mongoose');

const PERMISSION_KEYS = ['products', 'categories', 'banners', 'orders', 'returns', 'reviews', 'customers'];

const AdminUserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['owner', 'staff'], default: 'staff' },
  permissions: {
    products: { type: Boolean, default: false },
    categories: { type: Boolean, default: false },
    banners: { type: Boolean, default: false },
    orders: { type: Boolean, default: false },
    returns: { type: Boolean, default: false },
    reviews: { type: Boolean, default: false },
    customers: { type: Boolean, default: false },
  },
  status: { type: String, enum: ['active', 'disabled'], default: 'active' },
  createdAt: { type: Date, default: Date.now },
});

const AdminUser = mongoose.models.AdminUser || mongoose.model('AdminUser', AdminUserSchema);
AdminUser.PERMISSION_KEYS = PERMISSION_KEYS;

module.exports = AdminUser;
