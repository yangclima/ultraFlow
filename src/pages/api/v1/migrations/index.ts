import type { NextApiRequest, NextApiResponse } from 'next';
import type {
  MigrationsGetResponse,
  MigrationsPostResponse,
} from '@/contracts/api/v1/migrations';

import controller from '@/infra/controller';
import { createRouter } from 'next-connect';
import migrationsRunner from '@/infra/migrations-runner';

const router = createRouter();

router.get(getHandler);

router.post(postHandler);

export default router.handler(controller.errorHandlers);

export async function getHandler(
  req: NextApiRequest,
  res: NextApiResponse<MigrationsGetResponse>
) {
  const migrations = await migrationsRunner.getPendingMigrations();
  return res.status(200).json(migrations);
}

export async function postHandler(
  req: NextApiRequest,
  res: NextApiResponse<MigrationsPostResponse>
) {
  const migrations = await migrationsRunner.runPendingMigrations();
  const status = migrations.length > 0 ? 201 : 200;
  return res.status(status).json(migrations);
}
