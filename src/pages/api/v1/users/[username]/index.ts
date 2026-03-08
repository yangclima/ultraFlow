import { createRouter } from 'next-connect';
import controller from '@/infra/controller';
import user from '@/models/user';
import { NextApiRequest, NextApiResponse } from 'next';
import { UsersUsernameGetResponse } from '@/contracts/api/v1/users';
import { ValidationError } from '@/infra/errors';

const router = createRouter();

router.get(getHandler);

export default router.handler(controller.errorHandlers);

async function getHandler(
  req: NextApiRequest,
  res: NextApiResponse<UsersUsernameGetResponse>
) {
  const username = Array.isArray(req.query.username)
    ? req.query.username[0]
    : req.query.username;

  if (typeof username !== 'string') {
    const publicErrorObject = new ValidationError({
      message: 'O username deve ser informado como string.',
      action: 'Corrija o username informado e tente novamente.',
    });
    throw publicErrorObject;
  }

  const userFound = await user.findOneByUsername(username);
  return res.status(200).json(userFound);
}
