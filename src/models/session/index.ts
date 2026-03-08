import crypto from 'node:crypto';
import database from '@/infra/database';
import { Session } from './types';

const EXPIRATION_TIME_IN_MILISECONDS = 30 * 24 * 60 * 60 * 1000;

async function create(userId: string): Promise<Session> {
  const token = crypto.randomBytes(48).toString('hex');
  const expiresAt = new Date(Date.now() + EXPIRATION_TIME_IN_MILISECONDS);

  const newSession = await runInsertQuery(userId, token, expiresAt);
  return newSession;

  async function runInsertQuery(
    sessionUserId: string,
    sessionToken: string,
    expirationDate: Date
  ) {
    const results = await database.query({
      text: `
      INSERT INTO
        sessions (user_id, token, expires_at)
      VALUES
        ($1, $2, $3)
      RETURNING
        *
      ;`,
      values: [sessionUserId, sessionToken, expirationDate],
    });

    return results.rows[0];
  }
}

const session = {
  EXPIRATION_TIME_IN_MILISECONDS,
  create,
};

export default session;
