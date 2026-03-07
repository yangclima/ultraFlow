import type { NextApiRequest, NextApiResponse } from 'next';

import {
  InternalServerError,
  MethodNotAllowedError,
  ServiceError,
} from './errors';
import { ErrorResponse } from '@/contracts/api/v1/error';

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
    const publicErrorObject = new ServiceError({
      cause: error,
    });

    res.status(publicErrorObject.statusCode).json(publicErrorObject.toJSON());
    return;
  }

  const publicErrorObject = new InternalServerError({
    cause: error,
  });

  console.error(publicErrorObject);

  res.status(publicErrorObject.statusCode).json(publicErrorObject.toJSON());
}

const controller = {
  errorHandlers: {
    onNoMatch: onNoMatchHandler,
    onError: onErrorHandler,
  },
};

export default controller;
