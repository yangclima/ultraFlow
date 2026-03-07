import type {
  UsersPostRequest,
  UsersPostResponse,
} from '@/contracts/api/v1/users';
import type { NextApiRequest, NextApiResponse } from 'next';

import { createRouter } from 'next-connect';

import controller from '@/infra/controller';
import user from '@/models/user';

const router = createRouter();

router.post(postHandler);

export default router.handler(controller.errorHandlers);

async function postHandler(
  req: NextApiRequest & { body: UsersPostRequest },
  res: NextApiResponse<UsersPostResponse>
) {
  const userInputValues = req.body;
  const newUser = await user.create(userInputValues);
  return res.status(201).json(newUser);
}
