import { version as uuidVersion } from 'uuid';
import orchestrator from '@/tests/orchestrator';
import user from '@/models/user';
import password from '@/infra/password';
import { expect, test, describe, beforeAll } from 'vitest';

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe('PATCH /api/v1/users/[username]', () => {
  describe('Anonymous user', () => {
    test('With nonexistent username', async () => {
      const response = await fetch(
        'http://localhost:3000/api/v1/users/UsuarioInexistente',
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: 'novo.email@email.com',
            password: 'novasenha123',
            username: 'novonomeusuario',
          }),
        }
      );

      expect(response.status).toBe(404);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        name: 'NotFoundError',
        message: 'O username informado não foi encontrado no sistema.',
        action: 'Verifique se o username está digitado corretamente.',
        status_code: 404,
      });
    });

    test('With duplicated username', async () => {
      await orchestrator.createUser({
        username: 'user1',
      });

      await orchestrator.createUser({
        username: 'user2',
      });

      const response = await fetch('http://localhost:3000/api/v1/users/user1', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'novo.email@email.com',
          password: 'novasenha123',
          username: 'user2',
        }),
      });

      expect(response.status).toBe(400);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        name: 'ValidationError',
        message: 'O username informado já está sendo utilizado.',
        action: 'Utilize outro username para realizar o cadastro.',
        status_code: 400,
      });
    });

    test('With duplicated email', async () => {
      const createdUser = await orchestrator.createUser({
        email: 'email1@email.com',
      });

      await orchestrator.createUser({
        email: 'email2@email.com',
      });

      const response = await fetch(
        `http://localhost:3000/api/v1/users/${createdUser.username}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: 'email2@email.com',
          }),
        }
      );

      expect(response.status).toBe(400);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        name: 'ValidationError',
        message: 'O email informado já está sendo utilizado.',
        action: 'Utilize outro email para realizar o cadastro.',
        status_code: 400,
      });
    });

    test('With unique username', async () => {
      const createdUser = await orchestrator.createUser();

      const response = await fetch(
        `http://localhost:3000/api/v1/users/${createdUser.username}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username: 'uniqueUser',
          }),
        }
      );

      expect(response.status).toBe(200);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        id: responseBody.id,
        username: 'uniqueUser',
        email: createdUser.email,
        password: responseBody.password,
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });

      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();

      const response2 = await fetch(
        'http://localhost:3000/api/v1/users/uniqueUser'
      );

      const response2Body = await response2.json();

      expect(response2Body).toEqual({
        id: response2Body.id,
        username: 'uniqueUser',
        email: createdUser.email,
        password: response2Body.password,
        created_at: response2Body.created_at,
        updated_at: response2Body.updated_at,
      });

      expect(uuidVersion(response2Body.id)).toBe(4);
      expect(Date.parse(response2Body.created_at)).not.toBeNaN();
      expect(Date.parse(response2Body.updated_at)).not.toBeNaN();
    });

    test('With unique email', async () => {
      const createdUser = await orchestrator.createUser();

      const response = await fetch(
        `http://localhost:3000/api/v1/users/${createdUser.username}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: 'unique.email@email.com',
          }),
        }
      );

      expect(response.status).toBe(200);

      const responsebody = await response.json();

      expect(responsebody).toEqual({
        id: responsebody.id,
        username: responsebody.username,
        email: 'unique.email@email.com',
        password: responsebody.password,
        created_at: responsebody.created_at,
        updated_at: responsebody.updated_at,
      });

      expect(uuidVersion(responsebody.id)).toBe(4);
      expect(Date.parse(responsebody.created_at)).not.toBeNaN();
      expect(Date.parse(responsebody.updated_at)).not.toBeNaN();

      const response2 = await fetch(
        `http://localhost:3000/api/v1/users/${createdUser.username}`
      );

      const response2body = await response2.json();

      expect(response2body).toEqual({
        id: response2body.id,
        username: createdUser.username,
        email: 'unique.email@email.com',
        password: response2body.password,
        created_at: response2body.created_at,
        updated_at: response2body.updated_at,
      });

      expect(uuidVersion(response2body.id)).toBe(4);
      expect(Date.parse(response2body.created_at)).not.toBeNaN();
      expect(Date.parse(response2body.updated_at)).not.toBeNaN();
    });

    test("With new 'password'", async () => {
      const createdUser = await orchestrator.createUser();

      const response = await fetch(
        `http://localhost:3000/api/v1/users/${createdUser.username}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            password: 'newPassword',
          }),
        }
      );

      expect(response.status).toBe(200);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        id: responseBody.id,
        username: createdUser.username,
        email: createdUser.email,
        password: responseBody.password,
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });

      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();

      expect(responseBody.updated_at > responseBody.created_at).toBe(true);

      const userInDatabase = await user.findOneByUsername(createdUser.username);
      const correctPasswordMatch = await password.compare(
        'newPassword',
        userInDatabase.password
      );

      const incorrectPasswordMatch = await password.compare(
        'newPassword1',
        userInDatabase.password
      );

      expect(correctPasswordMatch).toBe(true);
      expect(incorrectPasswordMatch).toBe(false);
    });
  });
});
