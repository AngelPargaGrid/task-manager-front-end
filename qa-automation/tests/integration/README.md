# Integration Tests

Integration tests verify multiple components work together.

- **Backend:** Use pytest against the Flask API (see `api/tests/`)
- **Frontend+API:** Use Playwright or similar for full-stack flows

Run: `pytest api/tests/ -v -m "not performance"` (backend)
Run: `npm run test` (frontend E2E)
