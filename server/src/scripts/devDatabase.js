import 'dotenv/config';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { homedir } from 'node:os';
// Runs a real mongod process with persistent WiredTiger files, for local development only.
// Production uses MongoDB Atlas through MONGODB_URI.
const dbPath = resolve(process.env.CLUBPULSE_DB_PATH || resolve(homedir(), '.clubpulse/mongo'));
await mkdir(dbPath, { recursive: true });
const database = await MongoMemoryServer.create({
  binary: {
    version: '7.0.24',
    downloadDir: process.env.MONGOMS_DOWNLOAD_DIR || resolve(homedir(), '.cache/mongodb-binaries'),
  },
  instance: {
    port: 27017,
    ip: '127.0.0.1',
    dbPath,
    storageEngine: 'wiredTiger',
    dbName: 'clubpulse',
  },
});
console.log('Local MongoDB listening on 127.0.0.1:27017. Data persists in CLUBPULSE_DB_PATH.');
async function shutdown() {
  await database.stop({ doCleanup: false });
  process.exit(0);
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
