import database from '@/infra/database';
import orchestrator from '@/tests/orchestrator';

beforeAll(async () => {
  await database.query('DROP schema public cascade; CREATE schema public;');
  await orchestrator.waitForAllServices();
});

test('GET to /api/v1/status', async () => {
  const response = await fetch('http://localhost:3000/api/v1/status');
  const responseBody = await response.json();

  expect(response.status).toBe(200);

  const parseUpdatedAt = new Date(responseBody.updated_at).toISOString();
  expect(parseUpdatedAt).toEqual(responseBody.updated_at);

  expect(responseBody.dependencies.database.version).toEqual('18.2');
  expect(responseBody.dependencies.database.max_connections).toEqual(100);
  expect(responseBody.dependencies.database.opened_connections).toEqual(1);
});
