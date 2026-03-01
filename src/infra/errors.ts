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
