// One-off script: creates (or updates) the first owner AdminUser account
// from OWNER_NAME / OWNER_EMAIL / OWNER_PASSWORD in .env.
// Run: node scripts/seedOwner.js

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const AdminUser = require('../models/AdminUser');

async function run() {
  const { MONGO_URI, OWNER_NAME, OWNER_EMAIL, OWNER_PASSWORD } = process.env;

  if (!MONGO_URI) throw new Error('MONGO_URI is not set in .env');
  if (!OWNER_EMAIL || !OWNER_PASSWORD) {
    throw new Error('Set OWNER_EMAIL and OWNER_PASSWORD in .env before running this script');
  }
  if (OWNER_PASSWORD === 'REPLACE_WITH_A_REAL_PASSWORD') {
    throw new Error('OWNER_PASSWORD is still the placeholder — set a real password in .env first');
  }
  if (OWNER_PASSWORD.length < 8) {
    throw new Error('OWNER_PASSWORD must be at least 8 characters');
  }

  await mongoose.connect(MONGO_URI);

  const email = OWNER_EMAIL.toLowerCase();
  const passwordHash = await bcrypt.hash(OWNER_PASSWORD, 12);

  const allPermissions = Object.fromEntries(AdminUser.PERMISSION_KEYS.map(k => [k, true]));

  const existing = await AdminUser.findOne({ email });
  if (existing) {
    existing.passwordHash = passwordHash;
    existing.role = 'owner';
    existing.status = 'active';
    existing.permissions = allPermissions;
    if (OWNER_NAME) existing.name = OWNER_NAME;
    await existing.save();
    console.log(`Updated existing owner account: ${email}`);
  } else {
    await AdminUser.create({
      name: OWNER_NAME || 'Owner',
      email,
      passwordHash,
      role: 'owner',
      status: 'active',
      permissions: allPermissions,
    });
    console.log(`Created owner account: ${email}`);
  }

  await mongoose.disconnect();
}

run().catch(err => {
  console.error('Seed failed:', err.message);
  process.exit(1);
});
