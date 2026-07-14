const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));

const PORT = process.env.PORT || 5000;

// ==========================================
// 1. MONGODB CONNECTION
// ==========================================
// Using the explicit replica set bypass with the exact replicaSet name discovered via TXT.
const MONGO_URI = "mongodb://srssilktraders1_db_user:9PAq6cGZRGuaB7LN@ac-imtqlti-shard-00-00.ik0nlml.mongodb.net:27017,ac-imtqlti-shard-00-01.ik0nlml.mongodb.net:27017,ac-imtqlti-shard-00-02.ik0nlml.mongodb.net:27017/srssilks?ssl=true&replicaSet=atlas-rzxbyt-shard-0&authSource=admin&retryWrites=true&w=majority";

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

app.use('/api/admin', authRouter);
app.use('/api/admin', require('./routes/admin_dashboard'));
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
