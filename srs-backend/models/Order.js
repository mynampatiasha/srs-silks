const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true }
  }],
  shippingAddress: {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    type: { type: String, default: 'Home' }
  },
  paymentMethod: { type: String, default: 'COD' },
  totalAmount: { type: Number, required: true },
  status: { type: String, default: 'Processing' }, // Processing, Dispatched, Shipped, Delivered, Return Requested, Return Accepted, Returned
  statusHistory: [{
    status: { type: String, required: true },
    date: { type: Date, default: Date.now }
  }],
  returnImage: { type: String }, // Legacy
  returnImages: [{ type: String }],
  returnReason: { type: String },
  adminRejectReason: { type: String }
}, { timestamps: true });

// Ensure initial status is logged in history
OrderSchema.pre('save', function() {
  if (this.isNew) {
    this.statusHistory.push({ status: this.status, date: new Date() });
  }
});

module.exports = mongoose.model('Order', OrderSchema);
