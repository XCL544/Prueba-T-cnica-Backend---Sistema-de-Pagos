import { BaseException } from './base.exception';

export class ConflictException extends BaseException {
  constructor(message: string, code: string = 'CONFLICT') {
    super(message, 409, code);
  }
}

export class BadRequestException extends BaseException {
  constructor(message: string, code: string = 'BAD_REQUEST') {
    super(message, 400, code);
  }
}

export class NotFoundException extends BaseException {
  constructor(message: string, code: string = 'NOT_FOUND') {
    super(message, 404, code);
  }
}

export class InternalServerException extends BaseException {
  constructor(message: string = 'Internal Server Error', code: string = 'INTERNAL_SERVER_ERROR') {
    super(message, 500, code);
  }
}
