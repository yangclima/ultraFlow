import database from '@/infra/database';
import { runner } from 'node-pg-migrate';
import path from 'node:path';

import type { Client } from 'pg';

export async function GET() {
  let dbClient: Client;

  try {
    dbClient = await database.getNewClient();

    const migrationOptions = {
      dbClient: dbClient,
      dryRun: true,
      dir: path.join(process.cwd(), 'src', 'infra', 'migrations'),
      direction: 'up',
      migrationsTable: 'pgmigrations',
      verbose: true,
      log: () => {},
    } as const;

    const migratedMigrations = await runner(migrationOptions);

    return Response.json(migratedMigrations, { status: 200 });
  } catch (error) {
    console.error(error);
    throw error;
  } finally {
    dbClient?.end();
  }
}

export async function POST() {
  let dbClient: Client;

  try {
    dbClient = await database.getNewClient();

    const migrationOptions = {
      dbClient: dbClient,
      dryRun: false,
      dir: path.join(process.cwd(), 'src', 'infra', 'migrations'),
      direction: 'up',
      migrationsTable: 'pgmigrations',
      verbose: true,
      log: (msg) => {
        console.log(msg);
      },
    } as const;

    const migratedMigrations = await runner(migrationOptions);

    if (migratedMigrations.length > 0) {
      return Response.json(migratedMigrations, { status: 201 });
    }

    return Response.json(migratedMigrations, { status: 200 });
  } catch (error) {
    console.error(error);
    throw error;
  } finally {
    dbClient?.end();
  }
}
