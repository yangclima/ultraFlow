import { runner } from 'node-pg-migrate';
import path from 'node:path';
import database from './database';
import { ServiceError } from './errors';

const defaultMigrationOptions = {
  dryRun: true,
  dir: path.join(process.cwd(), 'src', 'infra', 'migrations'),
  direction: 'up',
  log: () => {},
  migrationsTable: 'pgmigrations',
} as const;

async function getPendingMigrations() {
  const dbClient = await database.getNewClient();
  try {
    return await runner({
      ...defaultMigrationOptions,
      dbClient,
    });
  } catch (error) {
    const serviceErrorObject = new ServiceError({
      serviceName: 'Migrations',
      message: 'Erro ao obter as migrações pendentes',
      cause: error,
    });
    throw serviceErrorObject;
  } finally {
    dbClient.end();
  }
}

async function runPendingMigrations() {
  const dbClient = await database.getNewClient();
  try {
    return await runner({
      ...defaultMigrationOptions,
      dbClient,
      dryRun: false,
    });
  } catch (error) {
    const serviceErrorObject = new ServiceError({
      serviceName: 'Migrations',
      message: 'Erro ao rodar as migrações pendentes',
      cause: error,
    });
    throw serviceErrorObject;
  } finally {
    dbClient.end();
  }
}

const migrationsRunner = {
  getPendingMigrations,
  runPendingMigrations,
};

export default migrationsRunner;
