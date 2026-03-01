import type { NextApiRequest, NextApiResponse } from 'next';
import type {
  MigrationsGetResponse,
  MigrationsPostResponse,
} from '@/contracts/api/v1/migrations';
import type { Client } from 'pg';

import database from '@/infra/database';
import controller from '@/infra/controller';

import { runner } from 'node-pg-migrate';
import path from 'node:path';
import { createRouter } from 'next-connect';

const router = createRouter();

router.get(getHandler);

router.post(postHandler);

export default router.handler(controller.errorHandlers);

export async function getHandler(
  req: NextApiRequest,
  res: NextApiResponse<MigrationsGetResponse>
) {
  let dbClient: Client | undefined = undefined;

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

    return res.status(200).json(migratedMigrations);
  } catch (error) {
    console.error(error);
    throw error;
  } finally {
    dbClient?.end();
  }
}

export async function postHandler(
  req: NextApiRequest,
  res: NextApiResponse<MigrationsPostResponse>
) {
  let dbClient: Client | undefined = undefined;

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
      return res.status(201).json(migratedMigrations);
    }

    return res.status(200).json(migratedMigrations);
  } catch (error) {
    console.error(error);
    throw error;
  } finally {
    dbClient?.end();
  }
}
