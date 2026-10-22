import 'dotenv/config';
import mongoose from 'mongoose';
import Event from '../models/Event.js';
import { connectDatabase } from '../config/db.js';
try {
  if (!process.env.MONGODB_URI) throw new Error('Set MONGODB_URI.');
  await connectDatabase(process.env.MONGODB_URI);
  // Optional, clearly labeled demonstration events. No feedback or analytics is seeded.
  for (const event of [
    {
      title: 'Demo · Web Development Workshop',
      description:
        'A sample event for practicing the complete feedback flow. Replace with your actual club event.',
      date: new Date('2026-10-24T00:00:00Z'),
    },
    {
      title: 'Demo · Git & Open Source',
      description: 'A sample event about collaboration and first contributions.',
      date: new Date('2026-10-25T00:00:00Z'),
    },
  ]) {
    await Event.updateOne(
      { title: event.title },
      { $setOnInsert: { ...event, status: 'active' } },
      { upsert: true },
    );
  }
  console.log('Sample events are available. No feedback records were created.');
} catch (error) {
  console.error(
    `Event seeding failed (${error.name}). Check configuration and database connectivity.`,
  );
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
