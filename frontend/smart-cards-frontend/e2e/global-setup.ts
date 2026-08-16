import { request } from '@playwright/test';

async function globalSetup() {
  const backendUrl = 'http://localhost:5000/api/flashcards';

  try {
    const apiContext = await request.newContext();
    const response = await apiContext.get(backendUrl, { timeout: 5000 });

    if (!response.ok()) {
      console.warn(`⚠️  Backend health check failed: ${response.status()} ${response.statusText()}`);
    } else {
      console.log(`✅ Playwright global setup: backend is available at ${backendUrl}`);
    }

    await apiContext.dispose();
  } catch (error) {
    console.warn(
      `⚠️  The backend server is not running on ${backendUrl}. Frontend-only tests will run, but integration tests may fail.`,
    );
  }
}

export default globalSetup;
