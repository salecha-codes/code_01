import mongoose from 'mongoose';
import { readConfig } from './config/env.js';
import { connectDatabase } from './config/db.js';
import { createApp } from './app.js';
try {
  const config = readConfig();
  await connectDatabase(config.mongoUri);
  const server = createApp(config).listen(config.port, '0.0.0.0', () =>
    console.log(`ClubPulse API listening on port ${config.port}; MongoDB connected.`),
  );
  async function shutdown() {
    server.close(async () => {
      await mongoose.disconnect();
      process.exit(0);
    });
    setTimeout(() => process.exit(1), 10000).unref();
  }
  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
} catch (error) {
  console.error(
    `Startup failed (${error.name}). Check server environment variables and database connectivity.`,
  );
  process.exit(1);
}
