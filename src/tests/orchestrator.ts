import retry from 'async-retry';
import database from '@/infra/database';
import migrationsRunner from '@/infra/migrations-runner';
import user from '@/models/user';
import { faker } from '@faker-js/faker';
import type { CreateUserDTO, User } from '@/models/user/types';
import session from '@/models/session';

async function waitForAllServices() {
  await waitForWebServer();

  async function waitForWebServer() {
    return retry(fetchStatusPage, {
      retries: 100,
      maxTimeout: 1000,
    });

    async function fetchStatusPage() {
      const response = await fetch('http://localhost:3000/api/v1/status');

      if (response.status !== 200) {
        throw Error();
      }
    }
  }
}

async function runPendingMigrations() {
  await migrationsRunner.runPendingMigrations();
}

async function clearDatabase() {
  await database.query('DROP schema public cascade; CREATE schema public;');
}

async function createUser(userObject: CreateUserDTO): Promise<User> {
  return await user.create({
    username:
      userObject?.username || faker.internet.username().replace(/[_.-]/g, ''),
    email: userObject?.email || faker.internet.email(),
    password: userObject?.password || 'validpassword',
  });
}

async function createSession(userId) {
  return await session.create(userId);
}

const orchestrator = {
  waitForAllServices,
  clearDatabase,
  runPendingMigrations,
  createUser,
  createSession,
};

export default orchestrator;
