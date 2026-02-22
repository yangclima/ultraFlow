import orchestrator from '@/tests/orchestrator';

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
});

describe('GET /api/v1/status', () => {
  describe('Anonymous user', () => {
    test('Retrieving the system status', async () => {
      const response = await fetch('http://localhost:3000/api/v1/status');
      const responseBody = await response.json();

      expect(response.status).toBe(200);

      const parseUpdatedAt = new Date(responseBody.updated_at).toISOString();
      expect(parseUpdatedAt).toEqual(responseBody.updated_at);

      expect(responseBody.dependencies.database.version).toEqual('18.2');
      expect(responseBody.dependencies.database.max_connections).toEqual(100);
      expect(responseBody.dependencies.database.opened_connections).toEqual(1);
    });
  });
});
