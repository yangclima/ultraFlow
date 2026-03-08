import type {
  SessionsPostRequest,
  SessionsPostResponse,
} from '@/contracts/api/v1/sessions';
import type { NextApiRequest, NextApiResponse } from 'next';

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

  controller.setSessionCookie(newSession.token, res);

  return res.status(201).json(newSession);
}
