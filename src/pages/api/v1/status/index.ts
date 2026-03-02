import type { StatusGetResponse } from '@/contracts/api/v1/status';
import type { NextApiRequest, NextApiResponse } from 'next';

import database from '@/infra/database';

import { createRouter } from 'next-connect';
import controller from '@/infra/controller';

const router = createRouter();

router.get(getHandler);

export default router.handler(controller.errorHandlers);

async function getHandler(
  req: NextApiRequest,
  res: NextApiResponse<StatusGetResponse>
) {
  const updatedAt = new Date().toISOString();

  const version = await database.query('SHOW server_version');
  const versionResult = version.rows[0].server_version;

  const maxConnections = await database.query('SHOW max_connections');
  const maxConnectionsResult = Number(maxConnections.rows[0].max_connections);

  const openedConnections = await database.query(
    'SELECT COUNT(*)::int FROM pg_stat_activity WHERE datname = current_database()'
  );
  const openedConnectionsResult = openedConnections.rows[0].count;

  res.status(200).json({
    updated_at: updatedAt,
    dependencies: {
      database: {
        version: versionResult,
        max_connections: maxConnectionsResult,
        opened_connections: openedConnectionsResult,
      },
    },
  });
}
