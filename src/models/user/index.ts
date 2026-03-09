import type { CreateUserDTO, UpdateUserDTO, User } from './types';

import database from '@/infra/database';
import password from '@/infra/password';
import { ValidationError, NotFoundError } from '@/infra/errors';

async function findOneByUsername(username: string): Promise<User> {
  const userFound = await runSelectQuery(username);

  return userFound;

  async function runSelectQuery(username) {
    const results = await database.query({
      text: `
        SELECT
          *
        FROM
          users
        WHERE
          LOWER(username) = LOWER($1)
        LIMIT
          1
        ;`,
      values: [username],
    });

    if (results.rowCount === 0) {
      throw new NotFoundError({
        message: 'O username informado não foi encontrado no sistema.',
        action: 'Verifique se o username está digitado corretamente.',
      });
    }

    return results.rows[0];
  }
}

async function findOneByEmail(email: string): Promise<User> {
  const userFound = await runSelectQuery(email);

  return userFound;

  async function runSelectQuery(email: string) {
    const results = await database.query({
      text: `
        SELECT
          *
        FROM
          users
        WHERE
          LOWER(email) = LOWER($1)
        LIMIT
          1
        ;`,
      values: [email],
    });

    if (results.rowCount === 0) {
      throw new NotFoundError({
        message: 'O email informado não foi encontrado no sistema.',
        action: 'Verifique se o email está digitado corretamente.',
      });
    }

    return results.rows[0];
  }
}

async function findOneById(id: string): Promise<User> {
  const userFound = await runSelectQuery(id);

  return userFound;

  async function runSelectQuery(userId: string) {
    const results = await database.query({
      text: `
        SELECT
          *
        FROM
          users
        WHERE
          id = $1
        LIMIT
          1
        ;`,
      values: [userId],
    });

    if (results.rowCount === 0) {
      throw new NotFoundError({
        message: 'O usuário informado não foi encontrado no sistema.',
        action: 'Verifique se o ID e tente novamente.',
      });
    }

    return results.rows[0];
  }
}

async function create(userInputValues: CreateUserDTO): Promise<User> {
  await validateUniqueEmail(userInputValues.email);
  await validateUniqueUsername(userInputValues.username);
  await hashPasswordInObject(userInputValues);

  const newUser = await runInsertQuery(userInputValues);
  return newUser;

  async function hashPasswordInObject(
    userInputValues: CreateUserDTO
  ): Promise<CreateUserDTO> {
    const hashedPassword = await password.hash(userInputValues.password);
    userInputValues.password = hashedPassword;
    return userInputValues;
  }

  async function runInsertQuery(userInputValues: CreateUserDTO): Promise<User> {
    const results = await database.query({
      text: `
        INSERT INTO
          users (username, email, password)
        VALUES
          ($1, $2, $3)
        RETURNING
          *
        ;`,
      values: [
        userInputValues.username,
        userInputValues.email,
        userInputValues.password,
      ],
    });
    return results.rows[0];
  }
}

async function update(
  username: string,
  userInputValues: UpdateUserDTO
): Promise<User> {
  const userFound = await findOneByUsername(username);

  if (userInputValues.email) {
    await validateUniqueEmail(userInputValues.email);
  }

  if (userInputValues.username) {
    await validateUniqueUsername(userInputValues.username);
  }

  if (userInputValues.password) {
    const hashedPassword = await password.hash(userInputValues.password);
    userInputValues.password = hashedPassword;
  }

  const newUserData = {
    ...userFound,
    ...userInputValues,
  };

  const updatedUser = await runUpdateQuery(newUserData);

  return updatedUser;

  async function runUpdateQuery(newUserData: CreateUserDTO): Promise<User> {
    const results = await database.query({
      text: `
        UPDATE
          users
        SET
          username = $1,
          email = $2,
          password = $3,
          updated_at = timezone('UTC', now())
        WHERE
          id = $4
        RETURNING
          *
        ;`,
      values: [
        newUserData.username,
        newUserData.email,
        newUserData.password,
        userFound.id,
      ],
    });
    return results.rows[0];
  }
}

async function validateUniqueEmail(email: string) {
  const results = await database.query({
    text: `
        SELECT
          email
        FROM
          users
        WHERE
          LOWER(email) = LOWER($1)
        ;`,
    values: [email],
  });

  if ((results.rowCount ?? 0) > 0) {
    throw new ValidationError({
      message: 'O email informado já está sendo utilizado.',
      action: 'Utilize outro email para realizar o cadastro.',
    });
  }
}

async function validateUniqueUsername(username: string) {
  const results = await database.query({
    text: `
        SELECT
          username
        FROM
          users
        WHERE
          LOWER(username) = LOWER($1)
        ;`,
    values: [username],
  });

  if ((results.rowCount ?? 0) > 0) {
    throw new ValidationError({
      message: 'O username informado já está sendo utilizado.',
      action: 'Utilize outro username para realizar o cadastro.',
    });
  }
}

const user = {
  findOneByUsername,
  findOneByEmail,
  findOneById,
  create,
  update,
};

export default user;
