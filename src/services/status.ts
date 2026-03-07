import database from '@/infra/database';

async function getStatus() {
  const databaseStatus = await database.getStatus();

  return {
    database: databaseStatus,
  };
}

const statusService = {
  getStatus,
};

export default statusService;
