import type { StatusGetResponse } from '@/contracts/api/v1/status';
import type { NextApiRequest, NextApiResponse } from 'next';

import { createRouter } from 'next-connect';
import controller from '@/infra/controller';
import statusService from '@/services/status';

const router = createRouter();

router.get(getHandler);

export default router.handler(controller.errorHandlers);

async function getHandler(
  req: NextApiRequest,
  res: NextApiResponse<StatusGetResponse>
) {
  const updatedAt = new Date().toISOString();
  const status = await statusService.getStatus();

  const databaseStatus = status.database;

  res.status(200).json({
    updated_at: updatedAt,
    dependencies: {
      database: {
        version: databaseStatus.version,
        max_connections: databaseStatus.maxConnections,
        opened_connections: databaseStatus.openedConnections,
      },
    },
  });
}
