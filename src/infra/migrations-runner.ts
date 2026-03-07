import { runner } from 'node-pg-migrate';
import path from 'node:path';
import database from './database';

async function getPendingMigrations() {
  const dbClient = await database.getNewClient();
  try {
    return await runner({
      dbClient,
      dryRun: true,
      dir: path.join(process.cwd(), 'src', 'infra', 'migrations'),
      direction: 'up',
      migrationsTable: 'pgmigrations',
      log: () => {},
    });
  } finally {
    dbClient.end();
  }
}

async function runPendingMigrations() {
  const dbClient = await database.getNewClient();
  try {
    return await runner({
      dbClient,
      dryRun: false,
      dir: path.join(process.cwd(), 'src', 'infra', 'migrations'),
      direction: 'up',
      migrationsTable: 'pgmigrations',
      log: console.log,
    });
  } finally {
    dbClient.end();
  }
}

const migrationsRunner = {
  getPendingMigrations,
  runPendingMigrations,
};

export default migrationsRunner;
