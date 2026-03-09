import type { NextApiRequest, NextApiResponse } from 'next';

import { createRouter } from 'next-connect';
import controller from '@/infra/controller';
import { UserGetResponse } from '@/contracts/api/v1/user';
import session from '@/models/session';
import user from '@/models/user';

const router = createRouter();

router.get(getHandler);

export default router.handler(controller.errorHandlers);

async function getHandler(
  req: NextApiRequest,
  res: NextApiResponse<UserGetResponse>
) {
  const sessionToken = req.cookies.session_id;

  const sessionFound = await session.findOneValidByToken(sessionToken ?? '');
  const renewedSessionObject = await session.renew(sessionFound.id);
  controller.setSessionCookie(renewedSessionObject.token, res);

  const userFound = await user.findOneById(sessionFound.user_id);

  res.setHeader(
    'Cache-Control',
    'no-store, no-cache, max-age=0, must-revalidate'
  );

  return res.status(200).json(userFound);
}
