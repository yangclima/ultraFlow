import crypto from 'node:crypto';
import database from '@/infra/database';
import { Session } from './types';
import { UnauthorizedError } from '@/infra/errors';

const EXPIRATION_TIME_IN_MILISECONDS = 30 * 24 * 60 * 60 * 1000;

/**
 * Find an active session by its token.
 *
 * Searches for a session in the database that matches the provided token and has not expired.
 *
 * @param token - The token of the session to find.
 * @returns A promise that resolves to the found {@link Session} object.
 *
 */
async function findOneValidByToken(token: string): Promise<Session> {
  const sessionFound = await runSelectQuery(token);
  return sessionFound;

  async function runSelectQuery(sessionToken: string): Promise<Session> {
    const results = await database.query({
      text: `
      SELECT
        *
      FROM
        sessions
      WHERE
        token = $1
        AND expires_at > NOW()
      LIMIT
        1
      ;`,
      values: [sessionToken],
    });

    if (results.rowCount === 0) {
      const unauthorizedErrorObject = new UnauthorizedError({
        message: 'Usuário não possui sessão ativa.',
        action: 'Verifique se este usuário está logado e tente novamente.',
      });

      throw unauthorizedErrorObject;
    }

    return results.rows[0];
  }
}

/**
 * Creates a new session for the given user.
 *
 * Generates a cryptographically secure token and stores the session
 * in the database with an expiration date of 30 days from creation.
 *
 * @param userId - The ID of the user to create a session for.
 * @returns A promise that resolves to the created {@link Session} object.
 *
 */
async function create(userId: string): Promise<Session> {
  const token = crypto.randomBytes(48).toString('hex');
  const expiresAt = new Date(Date.now() + EXPIRATION_TIME_IN_MILISECONDS);

  const newSession = await runInsertQuery(userId, token, expiresAt);
  return newSession;

  async function runInsertQuery(
    sessionUserId: string,
    sessionToken: string,
    expirationDate: Date
  ): Promise<Session> {
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

/**
 * Renews an existing session by extending its expiration date.
 *
 * The session's expiration date is updated to be 30 days from the time of renewal.
 *
 * @param sessionId - The ID of the session to renew.
 * @returns A promise that resolves to the renewed {@link Session} object.
 */
async function renew(sessionId: string): Promise<Session> {
  const newExpirationDate = new Date(
    Date.now() + EXPIRATION_TIME_IN_MILISECONDS
  );

  const renewedSession = await runUpdateQuery(sessionId, newExpirationDate);
  return renewedSession;

  async function runUpdateQuery(
    sessionIdToRenew: string,
    newExpirationDate: Date
  ): Promise<Session> {
    const results = await database.query({
      text: `
      UPDATE
        sessions
      SET
        expires_at = $2,
        updated_at = timezone('UTC', now())
      WHERE
        id = $1
      RETURNING
        *
      ;`,
      values: [sessionIdToRenew, newExpirationDate],
    });

    if (results.rowCount === 0) {
      const unauthorizedErrorObject = new UnauthorizedError({
        message: 'Sessão não encontrada.',
        action: 'Tente novamente ou entre em contato com o suporte.',
      });

      throw unauthorizedErrorObject;
    }

    return results.rows[0];
  }
}

/**
 * Expires a session by its ID.
 *
 * Updates the session's expiration date to be in the past, effectively expiring it.
 *
 * @param sessionId
 * @returns A promise that resolves to the expired {@link Session} object.
 */
async function expireById(sessionId: string): Promise<Session> {
  const expiredSession = await runUpdateQuery(sessionId);
  return expiredSession;

  async function runUpdateQuery(sessionIdToExpire: string): Promise<Session> {
    const results = await database.query({
      text: `
      UPDATE
        sessions
      SET
        expires_at = expires_at - interval '1 year',
        updated_at = timezone('UTC', now())
      WHERE
        id = $1
      RETURNING
        *
      ;`,
      values: [sessionIdToExpire],
    });

    return results.rows[0];
  }
}

/** Manage the user session. */
const session = {
  /** Duration of a session in milliseconds. Equivalent to 30 days. */
  EXPIRATION_TIME_IN_MILISECONDS,
  findOneValidByToken,
  create,
  renew,
  expireById,
} as const;

export default session;
