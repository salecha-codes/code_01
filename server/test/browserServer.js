import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { createApp } from '../src/app.js';
import Admin from '../src/models/Admin.js';
import Event from '../src/models/Event.js';
if (!process.env.E2E_ADMIN_PASSWORD || !process.env.E2E_JWT_SECRET)
  throw new Error('Run with npm run test:e2e.');
const database = await MongoMemoryServer.create({ binary: { version: '7.0.24' } });
await mongoose.connect(database.getUri());
await Admin.create({
  email: 'judge@example.test',
  passwordHash: await bcrypt.hash(process.env.E2E_ADMIN_PASSWORD, 12),
});
await Event.create([
  {
    title: 'Browser Test · Web Workshop',
    date: new Date('2026-10-22'),
    status: 'active',
    description: 'An isolated event for automated browser verification.',
  },
  { title: 'Browser Test · Closed Workshop', date: new Date('2026-10-21'), status: 'closed' },
]);
const app = createApp({
  jwtSecret: process.env.E2E_JWT_SECRET,
  production: false,
  sameSite: 'lax',
  origins: ['http://localhost:5174'],
});
const server = app.listen(5001, '127.0.0.1');
async function stop() {
  server.close();
  await mongoose.disconnect();
  await database.stop();
  process.exit(0);
}
process.on('SIGTERM', stop);
process.on('SIGINT', stop);
