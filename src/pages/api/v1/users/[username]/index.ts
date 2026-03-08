import { createRouter } from 'next-connect';
import controller from '@/infra/controller';
import user from '@/models/user';
import { NextApiRequest, NextApiResponse } from 'next';
import {
  UsersUsernameGetResponse,
  UsersUsernamePatchRequest,
} from '@/contracts/api/v1/users';

const router = createRouter();

router.get(getHandler);

router.patch(patchHandler);

export default router.handler(controller.errorHandlers);

async function getHandler(
  req: NextApiRequest,
  res: NextApiResponse<UsersUsernameGetResponse>
) {
  const username = Array.isArray(req.query.username)
    ? req.query.username[0]
    : req.query.username;

  const userFound = await user.findOneByUsername(username ?? '');
  return res.status(200).json(userFound);
}

async function patchHandler(
  req: NextApiRequest & { body: UsersUsernamePatchRequest },
  res: NextApiResponse<UsersUsernameGetResponse>
) {
  const username = Array.isArray(req.query.username)
    ? req.query.username[0]
    : req.query.username;

  const updatedUser = await user.update(username ?? '', req.body);
  return res.status(200).json(updatedUser);
}
