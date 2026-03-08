import { Client, QueryResult } from 'pg';
import { ServiceError } from './errors';

type DatabaseQueryObject =
  | {
      text: string;
      values: unknown[];
    }
  | string;

async function query(queryObject: DatabaseQueryObject): Promise<QueryResult> {
  let client: Client | undefined = undefined;

  try {
    client = await getNewClient();

    const result = await client.query(queryObject);
    return result;
  } catch (error) {
    const serviceErrorObject = new ServiceError({
      serviceName: 'Database',
      message: 'Erro ao realizar consulta no banco de dados',
      cause: error,
    });

    throw serviceErrorObject;
  } finally {
    client?.end();
  }
}

function getSSLValues() {
  if (process.env.NODE_ENV === 'production') {
    return {
      ca: process.env.POSTGRES_CA,
      rejectUnauthorized: true,
    };
  }

  return false;
}

async function getNewClient() {
  try {
    const client = new Client({
      host: process.env.POSTGRES_HOST,
      port: Number(process.env.POSTGRES_PORT),
      user: process.env.POSTGRES_USER,
      database: process.env.POSTGRES_DB,
      password: process.env.POSTGRES_PASSWORD,
      ssl: getSSLValues(),
    });

    await client.connect();

    return client;
  } catch (error) {
    const serviceErrorObject = new ServiceError({
      serviceName: 'Database',
      message: 'Erro ao estabelecer conexão com o banco de dados',
      cause: error,
    });
    throw serviceErrorObject;
  }
}

async function getStatus() {
  const version = await database.query('SHOW server_version');
  const versionResult = version.rows[0].server_version;

  const maxConnections = await database.query('SHOW max_connections');
  const maxConnectionsResult = Number(maxConnections.rows[0].max_connections);

  const openedConnections = await database.query(
    'SELECT COUNT(*)::int FROM pg_stat_activity WHERE datname = current_database()'
  );
  const openedConnectionsResult = openedConnections.rows[0].count;

  return {
    version: versionResult,
    maxConnections: maxConnectionsResult,
    openedConnections: openedConnectionsResult,
  };
}

const database = {
  query,
  getNewClient,
  getStatus,
};

export default database;
