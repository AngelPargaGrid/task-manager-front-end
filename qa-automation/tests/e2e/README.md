# End-to-End Tests

E2E tests use Playwright and live in the project root `tests/` directory.

Run: `npm run test` from project root.

Configured in `playwright.config.ts` with:
- baseURL: http://localhost:5173
- Chromium, Firefox, WebKit, Mobile viewports
