import type {
  SessionsPostRequest,
  SessionsPostResponse,
} from '@/contracts/api/v1/sessions';
import type { NextApiRequest, NextApiResponse } from 'next';
import * as cookie from 'cookie';

import { createRouter } from 'next-connect';

import controller from '@/infra/controller';
import session from '@/models/session';
import authentication from '@/services/authentication';

const router = createRouter();

router.post(postHandler);

export default router.handler(controller.errorHandlers);

async function postHandler(
  req: NextApiRequest & { body: SessionsPostRequest },
  res: NextApiResponse<SessionsPostResponse>
) {
  const userInputValues = req.body;

  const authenticatedUser = await authentication.getAuthenticatedUser(
    userInputValues.email,
    userInputValues.password
  );

  const newSession = await session.create(authenticatedUser.id);
  const expirationTimeInSeconds = session.EXPIRATION_TIME_IN_MILISECONDS / 1000;

  const setCookie = cookie.serialize('session_id', newSession.token, {
    path: '/',
    maxAge: expirationTimeInSeconds,
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
  });

  res.setHeader('Set-Cookie', setCookie);

  return res.status(201).json(newSession);
}
