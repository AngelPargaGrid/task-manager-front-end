/**
 * k6 load test script for API and frontend
 * Run: k6 run qa-automation/performance/k6-load-test.js
 * Requires: API at K6_BASE_URL (default http://localhost:5001) and/or frontend at K6_FRONTEND_URL (default http://localhost:5173)
 */
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 10 },
    { duration: '1m', target: 20 },
    { duration: '30s', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],
    http_req_failed: ['rate<0.1'],
  },
};

const API_BASE = __ENV.K6_BASE_URL || 'http://localhost:5001';
const FRONTEND_URL = __ENV.K6_FRONTEND_URL || 'http://localhost:5173';

export default function () {
  // Test API health / root
  const apiRes = http.get(`${API_BASE}/api/v1/`);
  check(apiRes, { 'API status 200 or 404': (r) => r.status === 200 || r.status === 404 });

  // Test frontend
  const frontRes = http.get(FRONTEND_URL);
  check(frontRes, { 'Frontend status 200': (r) => r.status === 200 });

  sleep(1);
}
