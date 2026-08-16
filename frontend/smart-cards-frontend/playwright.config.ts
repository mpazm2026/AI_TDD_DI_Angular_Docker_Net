import { defineConfig, devices } from '@playwright/test';

const frontendUrl = 'http://localhost:4200';
const backendUrl = 'http://localhost:5000';

export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  fullyParallel: true,
  expect: {
    timeout: 10_000,
  },
  reporter: [['list']],
  use: {
    baseURL: frontendUrl,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    headless: true,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  globalSetup: require.resolve('./e2e/global-setup.ts'),
  webServer: {
    command: 'npm run start -- --host 0.0.0.0 --port 4200',
    url: frontendUrl,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
  metadata: {
    backendUrl,
    note: 'The backend API must be running before Playwright tests start.',
  },
});
