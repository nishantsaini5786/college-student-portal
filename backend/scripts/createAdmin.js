require('dotenv').config();
const readline = require('readline');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Admin = require('../models/Admin');

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const ask = q => new Promise(resolve => rl.question(q, resolve));

(async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const name = await ask('Admin name: ');
    const email = (await ask('Admin email: ')).trim().toLowerCase();
    const password = await ask('Admin password (12+ characters): ');
    if (password.length < 12) throw new Error('Password must be at least 12 characters.');
    if (await Admin.exists({ email })) throw new Error('An admin with this email already exists.');
    await Admin.create({ name, email, passwordHash: await bcrypt.hash(password, 12) });
    console.log('Admin created successfully. Keep these credentials private.');
  } catch (e) { console.error(e.message); process.exitCode = 1; }
  finally { await mongoose.disconnect(); rl.close(); }
})();
