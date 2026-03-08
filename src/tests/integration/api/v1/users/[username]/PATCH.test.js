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
      const response1 = await fetch('http://localhost:3000/api/v1/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: 'duplicatedusername',
          email: 'duplicated.email@email.com',
          password: 'senha123',
        }),
      });

      expect(response1.status).toBe(201);

      const response2 = await fetch('http://localhost:3000/api/v1/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: 'username',
          email: 'email@email.com',
          password: 'senha123',
        }),
      });

      expect(response2.status).toBe(201);

      const response3 = await fetch(
        'http://localhost:3000/api/v1/users/username',
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: 'novo.email@email.com',
            password: 'novasenha123',
            username: 'duplicatedusername',
          }),
        }
      );

      expect(response3.status).toBe(400);

      const responseBody = await response3.json();

      expect(responseBody).toEqual({
        name: 'ValidationError',
        message: 'O username informado já está sendo utilizado.',
        action: 'Utilize outro username para realizar o cadastro.',
        status_code: 400,
      });
    });

    test('With duplicated email', async () => {
      const response1 = await fetch('http://localhost:3000/api/v1/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: 'duplicatedusername1',
          email: 'duplicated.email1@email.com',
          password: 'senha123',
        }),
      });

      expect(response1.status).toBe(201);

      const response2 = await fetch('http://localhost:3000/api/v1/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: 'username1',
          email: 'email@email.com1',
          password: 'senha123',
        }),
      });

      expect(response2.status).toBe(201);

      const response3 = await fetch(
        'http://localhost:3000/api/v1/users/username1',
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: 'duplicated.email1@email.com',
          }),
        }
      );

      expect(response3.status).toBe(400);

      const responseBody = await response3.json();

      expect(responseBody).toEqual({
        name: 'ValidationError',
        message: 'O email informado já está sendo utilizado.',
        action: 'Utilize outro email para realizar o cadastro.',
        status_code: 400,
      });
    });

    test('With unique username', async () => {
      const response1 = await fetch('http://localhost:3000/api/v1/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: 'username2',
          email: 'email2@email.com',
          password: 'senha123',
        }),
      });

      expect(response1.status).toBe(201);

      const response2 = await fetch(
        'http://localhost:3000/api/v1/users/username2',
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username: 'uniqueusername',
          }),
        }
      );

      expect(response2.status).toBe(200);

      const response2body = await response2.json();

      expect(response2body).toEqual({
        id: response2body.id,
        username: 'uniqueusername',
        email: 'email2@email.com',
        password: response2body.password,
        created_at: response2body.created_at,
        updated_at: response2body.updated_at,
      });

      expect(uuidVersion(response2body.id)).toBe(4);
      expect(Date.parse(response2body.created_at)).not.toBeNaN();
      expect(Date.parse(response2body.updated_at)).not.toBeNaN();

      const response3 = await fetch(
        'http://localhost:3000/api/v1/users/uniqueusername'
      );

      const response3body = await response3.json();

      expect(response3body).toEqual({
        id: response3body.id,
        username: 'uniqueusername',
        email: 'email2@email.com',
        password: response3body.password,
        created_at: response3body.created_at,
        updated_at: response3body.updated_at,
      });

      expect(uuidVersion(response3body.id)).toBe(4);
      expect(Date.parse(response3body.created_at)).not.toBeNaN();
      expect(Date.parse(response3body.updated_at)).not.toBeNaN();
    });

    test('With unique email', async () => {
      const response1 = await fetch('http://localhost:3000/api/v1/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: 'username3',
          email: 'email3@email.com',
          password: 'senha123',
        }),
      });

      expect(response1.status).toBe(201);

      const response2 = await fetch(
        'http://localhost:3000/api/v1/users/username3',
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

      expect(response2.status).toBe(200);

      const response2body = await response2.json();

      expect(response2body).toEqual({
        id: response2body.id,
        username: response2body.username,
        email: 'unique.email@email.com',
        password: response2body.password,
        created_at: response2body.created_at,
        updated_at: response2body.updated_at,
      });

      expect(uuidVersion(response2body.id)).toBe(4);
      expect(Date.parse(response2body.created_at)).not.toBeNaN();
      expect(Date.parse(response2body.updated_at)).not.toBeNaN();

      const response3 = await fetch(
        'http://localhost:3000/api/v1/users/username3'
      );

      const response3body = await response3.json();

      expect(response3body).toEqual({
        id: response3body.id,
        username: response3body.username,
        email: 'unique.email@email.com',
        password: response3body.password,
        created_at: response3body.created_at,
        updated_at: response3body.updated_at,
      });

      expect(uuidVersion(response3body.id)).toBe(4);
      expect(Date.parse(response3body.created_at)).not.toBeNaN();
      expect(Date.parse(response3body.updated_at)).not.toBeNaN();
    });

    test("With new 'password'", async () => {
      const user1Response = await fetch('http://localhost:3000/api/v1/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: 'username4',
          email: 'email4@email.com',
          password: 'password123',
        }),
      });

      expect(user1Response.status).toBe(201);

      const response = await fetch(
        'http://localhost:3000/api/v1/users/username4',
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
        username: 'username4',
        email: 'email4@email.com',
        password: responseBody.password,
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });

      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();

      expect(responseBody.updated_at > responseBody.created_at).toBe(true);

      const userInDatabase = await user.findOneByUsername('username4');
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
