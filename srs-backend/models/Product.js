const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name: String,
  price: Number,
  orig: Number,
  cat: String,          // kept for backward compatibility
  categories: [String], // NEW: multi-category array
  groupId: String,      // Used to group variants (different colors) together
  desc: String,
  highlights: [{ key: String, value: String }], // e.g. [{key: "Fabric", value: "Silk"}]
  tags: [String],
  metaTitle: String,
  metaDesc: String,
  img: String,
  imgUrls: [String],
  inStock: { type: Boolean, default: true },
  stockQuantity: { type: Number, default: 10 },
  reviews: [{
    user: String,
    rating: Number,
    comment: String,
    image: String,
    date: { type: Date, default: Date.now }
  }],
  createdBy: String,
  updatedBy: String,
  updatedAt: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.models.Product || mongoose.model('Product', ProductSchema);
