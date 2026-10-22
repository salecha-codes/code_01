import { defineConfig } from '@playwright/test';
import { randomBytes } from 'node:crypto';
import { existsSync } from 'node:fs';

// Credentials exist only for the isolated browser-test database/processes.
process.env.E2E_ADMIN_PASSWORD ||= randomBytes(24).toString('hex');
process.env.E2E_JWT_SECRET ||= randomBytes(48).toString('hex');
const localMongo = '/workspace/.cache/mongodb-binaries/mongod-official-7.0.24';
if (!process.env.MONGOMS_SYSTEM_BINARY && existsSync(localMongo))
  process.env.MONGOMS_SYSTEM_BINARY = localMongo;
const browserPath =
  process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE ||
  (existsSync('/usr/bin/chromium') ? '/usr/bin/chromium' : undefined);
export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  workers: 1,
  timeout: 60000,
  reporter: 'list',
  outputDir: '.playwright/results',
  use: {
    baseURL: 'http://localhost:5174',
    browserName: 'chromium',
    launchOptions: browserPath ? { executablePath: browserPath } : {},
    screenshot: 'only-on-failure',
    trace: 'off',
  },
  webServer: [
    {
      command: 'node server/test/browserServer.js',
      url: 'http://127.0.0.1:5001/api/health',
      timeout: 120000,
      reuseExistingServer: false,
    },
    {
      command: 'npm run dev -w client -- --port 5174 --strictPort',
      url: 'http://localhost:5174',
      env: { CLUBPULSE_API_PROXY: 'http://127.0.0.1:5001' },
      timeout: 60000,
      reuseExistingServer: false,
    },
  ],
});
