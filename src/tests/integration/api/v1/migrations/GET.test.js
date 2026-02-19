import database from '@/infra/database';
import orchestrator from '@/tests/orchestrator';

beforeAll(async () => {
  await database.query('DROP schema public cascade; CREATE schema public;');
  await orchestrator.waitForAllServices();
});

test('GET to /api/v1/migrations', async () => {
  const response = await fetch('http://localhost:3000/api/v1/migrations');

  const responseBody = await response.json();

  expect(response.status).toBe(200);

  expect(Array.isArray(responseBody)).toBe(true);
  expect(responseBody.length).toBeGreaterThan(0);
});
