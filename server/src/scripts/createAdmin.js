import 'dotenv/config';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import Admin from '../models/Admin.js';
import { connectDatabase } from '../config/db.js';
try {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (
    !email ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
    !password ||
    password.length < 12 ||
    Buffer.byteLength(password, 'utf8') > 72
  )
    throw new Error(
      'Set ADMIN_EMAIL and a password of at least 12 characters and at most 72 UTF-8 bytes.',
    );
  if (!process.env.MONGODB_URI) throw new Error('Set MONGODB_URI.');
  await connectDatabase(process.env.MONGODB_URI);
  await Admin.init();
  if (await Admin.exists({ email }))
    console.log('Admin already exists; password was left unchanged.');
  else {
    await Admin.create({ email, passwordHash: await bcrypt.hash(password, 12) });
    console.log('Admin created. Remove ADMIN_PASSWORD from the environment after initialization.');
  }
} catch (error) {
  console.error(
    error.name === 'Error' ? error.message : `Admin initialization failed (${error.name}).`,
  );
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
