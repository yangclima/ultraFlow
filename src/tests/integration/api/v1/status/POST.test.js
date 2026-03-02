import orchestrator from '@/tests/orchestrator';

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
});

describe('POST /api/v1/status', () => {
  describe('Anonymous user', () => {
    test('Attempting to make a request using an Not method.', async () => {
      const response = await fetch('http://localhost:3000/api/v1/status', {
        method: 'POST',
      });
      const responseBody = await response.json();

      expect(responseBody).toEqual({
        name: 'MethodNotAllowedError',
        message: 'Método HTTP não permitido para este endpoint',
        status_code: 405,
        action: 'Verifique se o método HTTP enviado é válido para esta rota',
      });
    });
  });
});
