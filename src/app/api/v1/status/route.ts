import database from '@/infra/database';

export async function GET(request: Request) {
  const updatedAt = new Date().toISOString();

  const version = await database.query('SHOW server_version');
  const versionResult = version.rows[0].server_version;

  const maxConnections = await database.query('SHOW max_connections');
  const maxConnectionsResult = Number(maxConnections.rows[0].max_connections);

  const openedConnections = await database.query(
    'SELECT COUNT(*)::int FROM pg_stat_activity WHERE datname = current_database()'
  );
  const openedConnectionsResult = openedConnections.rows[0].count;

  return Response.json({
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
