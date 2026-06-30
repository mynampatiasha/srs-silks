const mongoose = require('mongoose');
const Order = require('./models/Order');
const MONGO_URI = "mongodb://srssilktraders1_db_user:9PAq6cGZRGuaB7LN@ac-imtqlti-shard-00-00.ik0nlml.mongodb.net:27017,ac-imtqlti-shard-00-01.ik0nlml.mongodb.net:27017,ac-imtqlti-shard-00-02.ik0nlml.mongodb.net:27017/srssilks?ssl=true&replicaSet=atlas-rzxbyt-shard-0&authSource=admin&retryWrites=true&w=majority";

mongoose.connect(MONGO_URI).then(async () => {
  try {
    const { User } = require('./routes/auth_customer');
    const user = await User.findOne();
    const newOrder = new Order({
      customer: user._id,
      items: [{
        product: new mongoose.Types.ObjectId(), // Dummy ID
        quantity: 1,
        price: 1000
      }],
      shippingAddress: {
        name: "Test", phone: "123", street: "Test", city: "Test", state: "Test", pincode: "123", type: "Home"
      },
      paymentMethod: "COD",
      totalAmount: 1000
    });
    await newOrder.save();
    console.log("Order saved successfully");
  } catch (err) {
    console.error("Order save error:", err);
  }
  process.exit(0);
});
