import type { ErrorResponse } from '@/contracts/api/v1/error';

export class InternalServerError extends Error {
  public statusCode: number;
  public action: string;

  constructor({ cause }) {
    super('Um erro inesperado ocorreu', { cause });
    this.name = 'InternalServerError';
    this.statusCode = 500;
    this.action = 'Entre em contato com o suporte';
  }

  toJSON(): ErrorResponse {
    return {
      name: this.name,
      message: this.message,
      status_code: this.statusCode,
      action: this.action,
    };
  }
}

export class MethodNotAllowedError extends Error {
  public statusCode: number;
  public action: string;

  constructor() {
    super('Método HTTP não permitido para este endpoint');
    this.name = 'MethodNotAllowedError';
    this.statusCode = 405;
    this.action = 'Verifique se o método HTTP enviado é válido para esta rota';
  }

  toJSON(): ErrorResponse {
    return {
      name: this.name,
      message: this.message,
      status_code: this.statusCode,
      action: this.action,
    };
  }
}

export class ServiceError extends Error {
  public statusCode: number;
  public action: string;
  public serviceName: string;

  constructor({
    cause,
    message,
    serviceName,
  }: {
    cause?: Error;
    message?: string;
    serviceName?: string;
  }) {
    super(message || 'Serviço indisponível', { cause });

    this.name = 'ServiceError';
    this.statusCode = 503;
    this.action = 'Verifique se o serviço está disponível';
    this.serviceName = serviceName || 'unknown';
  }

  toJSON(): ErrorResponse {
    return {
      name: this.name,
      message: this.message,
      status_code: this.statusCode,
      action: this.action,
      service_name: this.serviceName,
    };
  }
}

export class ValidationError extends Error {
  public statusCode: number;
  public action: string;

  constructor({
    cause,
    message,
    action,
  }: {
    cause?: Error;
    message?: string;
    action?: string;
  }) {
    super(message || 'Um erro de validação ocorreu', { cause });
    this.name = 'ValidationError';
    this.statusCode = 400;
    this.action = action || 'Ajuste os dados e tente novamente';
  }

  toJSON(): ErrorResponse {
    return {
      name: this.name,
      message: this.message,
      status_code: this.statusCode,
      action: this.action,
    };
  }
}

export class NotFoundError extends Error {
  public statusCode: number;
  public action: string;

  constructor({
    cause,
    message,
    action,
  }: {
    cause?: Error;
    message?: string;
    action?: string;
  }) {
    super(message || 'Não foi possível encontrar este recurso no sistema.', {
      cause,
    });
    this.name = 'NotFoundError';
    this.action =
      action || 'Verifique se os parâmetros enviados na consulta estão certos.';
    this.statusCode = 404;
  }

  toJSON(): ErrorResponse {
    return {
      name: this.name,
      message: this.message,
      action: this.action,
      status_code: this.statusCode,
    };
  }
}
