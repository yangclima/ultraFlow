import database from '@/infra/database';
import orchestrator from '@/tests/orchestrator';

beforeAll(async () => {
  await database.query('DROP schema public cascade; CREATE schema public;');
  await orchestrator.waitForAllServices();
});

describe('GET /api/v1/status', () => {
  describe('Anonymous user', () => {
    test('For the first time', async () => {
      const response1 = await fetch('http://localhost:3000/api/v1/migrations', {
        method: 'POST',
      });
      const response1Body = await response1.json();

      expect(response1.status).toBe(201);

      expect(Array.isArray(response1Body)).toBe(true);
      expect(response1Body.length).toBeGreaterThan(0);
    });

    test('For the second time', async () => {
      const response2 = await fetch('http://localhost:3000/api/v1/migrations', {
        method: 'POST',
      });
      const response2Body = await response2.json();

      expect(response2.status).toBe(200);

      expect(response2Body.length).toEqual(0);
    });
  });
});
