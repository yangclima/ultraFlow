import orchestrator from '@/tests/orchestrator';
import { expect, test, describe, beforeAll } from 'vitest';

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
});

describe('NotAllowedMethod /api/v1/users/[username]', () => {
  describe('Any user', () => {
    test('Attempting to make a request using an Not Allowed method.', async () => {
      const notAllowedMethods = ['POST', 'PUT', 'DELETE', 'OPTIONS'];

      for (const method of notAllowedMethods) {
        const response = await fetch(
          'http://localhost:3000/api/v1/users/username',
          {
            method: method,
          }
        );

        expect(response.status).toBe(405);

        const responseBody = await response.json();

        expect(responseBody).toEqual({
          name: 'MethodNotAllowedError',
          message: 'Método HTTP não permitido para este endpoint',
          status_code: 405,
          action: 'Verifique se o método HTTP enviado é válido para esta rota',
        });
      }
    });
  });
});
