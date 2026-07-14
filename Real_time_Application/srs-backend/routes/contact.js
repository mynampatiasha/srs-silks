const express = require('express');
const mongoose = require('mongoose');

const router = express.Router();

const ContactSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String },
  category: {
    type: String,
    enum: ['general', 'bulk', 'seller', 'stitching', 'other'],
    default: 'general'
  },
  extra: { type: String },
  message: { type: String, required: true },
  status: { type: String, enum: ['new', 'read', 'resolved'], default: 'new' },
}, { timestamps: true });

const Contact = mongoose.model('Contact', ContactSchema);

router.post('/', async (req, res) => {
  try {
    const { name, email, phone, category, extra, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Name, email, and message are required.' });
    }

    const entry = new Contact({ name, email, phone, category, extra, message });
    await entry.save();

    res.status(201).json({ success: true, message: 'Your inquiry has been received. We will get back to you soon.' });
  } catch (err) {
    console.error('Error saving contact submission:', err);
    res.status(500).json({ error: 'Something went wrong. Please try again later.' });
  }
});

router.get('/', async (req, res) => {
  try {
    const entries = await Contact.find().sort({ createdAt: -1 });
    res.json(entries);
  } catch (err) {
    console.error('Error fetching contact submissions:', err);
    res.status(500).json({ error: 'Failed to fetch submissions.' });
  }
});

module.exports = { contactRouter: router };
