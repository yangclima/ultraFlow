import { NotFoundError, UnauthorizedError } from '@/infra/errors';
import password from '@/infra/password';
import user from '@/models/user';
import type { User } from '@/models/user/types';

async function getAuthenticatedUser(
  providedEmail: string,
  providedPassword: string
): Promise<User> {
  const storedUser = await findOneByEmail(providedEmail);

  await validatePassword(providedPassword, storedUser.password);

  return storedUser;
}

async function validatePassword(
  providedPassword: string,
  storedPassword: string
) {
  const matchPassword = await password.compare(
    providedPassword,
    storedPassword
  );

  if (!matchPassword) {
    const unauthorizedErrorObject = new UnauthorizedError({
      message: 'Os dados enviados não conferem',
      action: 'Ajuste os dados e tente novamente',
    });
    throw unauthorizedErrorObject;
  }
}

async function findOneByEmail(email: string): Promise<User> {
  let storedUser: User | undefined;

  try {
    storedUser = await user.findOneByEmail(email);
  } catch (error) {
    if (error instanceof NotFoundError) {
      const unauthorizedErrorObject = new UnauthorizedError({
        message: 'O Email fornecido não confere',
        action: 'Verifique os dados e tente novamente',
      });
      throw unauthorizedErrorObject;
    }

    throw error;
  }

  return storedUser;
}

const authentication = {
  getAuthenticatedUser,
};

export default authentication;
