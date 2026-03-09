import type { NextApiRequest, NextApiResponse } from 'next';
import * as cookie from 'cookie';

import {
  InternalServerError,
  MethodNotAllowedError,
  NotFoundError,
  ServiceError,
  UnauthorizedError,
  ValidationError,
} from './errors';
import { ErrorResponse } from '@/contracts/api/v1/error';
import session from '@/models/session';

async function onNoMatchHandler(
  req: NextApiRequest,
  res: NextApiResponse<ErrorResponse>
) {
  const publicErrorObject = new MethodNotAllowedError();

  res.status(publicErrorObject.statusCode).json(publicErrorObject.toJSON());
}

function onErrorHandler(
  error: Error,
  req: NextApiRequest,
  res: NextApiResponse<ErrorResponse>
) {
  if (error instanceof ServiceError) {
    res.status(error.statusCode).json(error.toJSON());
    console.error(error);
    return;
  }

  if (error instanceof ValidationError) {
    res.status(error.statusCode).json(error.toJSON());
    console.error(error);
    return;
  }

  if (error instanceof NotFoundError) {
    res.status(error.statusCode).json(error.toJSON());
    console.error(error);
    return;
  }

  if (error instanceof UnauthorizedError) {
    clearSessionCookie(res);
    res.status(error.statusCode).json(error.toJSON());
    console.error(error);
    return;
  }

  const publicErrorObject = new InternalServerError({
    cause: error,
  });

  console.error(publicErrorObject);

  res.status(publicErrorObject.statusCode).json(publicErrorObject.toJSON());
}

async function setSessionCookie(sessionToken: string, res: NextApiResponse) {
  const expirationTimeInSeconds = session.EXPIRATION_TIME_IN_MILISECONDS / 1000;

  const setCookie = cookie.serialize('session_id', sessionToken, {
    path: '/',
    maxAge: expirationTimeInSeconds,
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
  });

  res.setHeader('Set-Cookie', setCookie);
}

async function clearSessionCookie(response) {
  const setCookie = cookie.serialize('session_id', 'invalid', {
    path: '/',
    maxAge: -1,
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
  });

  response.setHeader('Set-Cookie', setCookie);
}

const controller = {
  errorHandlers: {
    onNoMatch: onNoMatchHandler,
    onError: onErrorHandler,
  },
  setSessionCookie,
  clearSessionCookie,
};

export default controller;
