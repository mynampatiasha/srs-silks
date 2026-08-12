const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));

const PORT = process.env.PORT || 5000;

// ==========================================
// 1. MONGODB CONNECTION
// ==========================================
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  throw new Error('MONGO_URI is not set. Copy .env.example to .env and fill in your credentials.');
}

mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB Atlas'))
  .catch(err => console.error('❌ MongoDB Connection Error:', err));

// ==========================================
// 2. IMPORT MODULAR ROUTES
// ==========================================
const orderRoutes = require('./routes/orders');
const { authRouter } = require('./routes/auth_admin');
const { authCustomerRouter } = require('./routes/auth_customer');
const { productRouter } = require('./routes/product_admin');
const { categoryRouter } = require('./routes/category_admin');
const { bannerRouter } = require('./routes/banner_admin');
const { userRouter } = require('./routes/user_admin');
const { contactRouter } = require('./routes/contact');
const { adminTeamRouter } = require('./routes/admin_team');

app.use('/api/admin', authRouter);
app.use('/api/admin', require('./routes/admin_dashboard'));
app.use('/api/admin-team', adminTeamRouter);
app.use('/api/customer', authCustomerRouter);
app.use('/api/orders', orderRoutes);
app.use('/api/products', productRouter);
app.use('/api/categories', categoryRouter);
app.use('/api/banners', bannerRouter);
app.use('/api/users', userRouter);
app.use('/api/contact', contactRouter);

// ==========================================
// 3. START SERVER
// ==========================================
app.listen(PORT, () => {
  console.log(`🚀 SRS Backend is running on port ${PORT}`);
});
