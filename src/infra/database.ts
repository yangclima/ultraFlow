import { Client, Query } from 'pg';
import { ServiceError } from './errors';

async function query(queryObject: string) {
  let client = await getNewClient();

  try {
    client = await getNewClient();

    const result = await client.query(queryObject);
    return result;
  } catch (error) {
    const serviceErrorObject = new ServiceError({
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
      message: 'Erro ao estabelecer conexão com o banco de dados',
      cause: error,
    });
    throw serviceErrorObject;
  }
}

const database = {
  query,
  getNewClient,
};

export default database;
