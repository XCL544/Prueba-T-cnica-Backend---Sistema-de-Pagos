export class BaseException extends Error {
  public readonly statusCode: number;
  public readonly code: string;

  constructor(message: string, statusCode: number, code: string) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    Object.setPrototypeOf(this, new.target.prototype);
  }

  toJSON() {
    return {
      statusCode: this.statusCode.toString(),
      code: this.code,
      message: this.message,
    };
  }
}
