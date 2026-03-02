import type { NextApiRequest, NextApiResponse } from 'next';

import { InternalServerError, MethodNotAllowedError } from './errors';

async function onNoMatchHandler(
  req: NextApiRequest,
  res: NextApiResponse<MethodNotAllowedError>
) {
  const publicErrorObject = new MethodNotAllowedError();

  res.status(publicErrorObject.statusCode).json(publicErrorObject);
}

function onErrorHandler(
  error: Error,
  request: NextApiRequest,
  response: NextApiResponse<Error>
) {
  const publicErrorObject = new InternalServerError({
    cause: error,
  });

  console.error(publicErrorObject);

  response.status(publicErrorObject.statusCode).json(publicErrorObject);
}

const controller = {
  errorHandlers: {
    onNoMatch: onNoMatchHandler,
    onError: onErrorHandler,
  },
};

export default controller;
