export enum HttpStatus {
  CONTINUE = 100,
  SWITCHING_PROTOCOLS = 101,
  PROCESSING = 102,
  EARLYHINTS = 103,
  OK = 200,
  CREATED = 201,
  ACCEPTED = 202,
  NON_AUTHORITATIVE_INFORMATION = 203,
  NO_CONTENT = 204,
  RESET_CONTENT = 205,
  PARTIAL_CONTENT = 206,
  MULTI_STATUS = 207,
  ALREADY_REPORTED = 208,
  CONTENT_DIFFERENT = 210,
  AMBIGUOUS = 300,
  MOVED_PERMANENTLY = 301,
  FOUND = 302,
  SEE_OTHER = 303,
  NOT_MODIFIED = 304,
  TEMPORARY_REDIRECT = 307,
  PERMANENT_REDIRECT = 308,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  PAYMENT_REQUIRED = 402,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  METHOD_NOT_ALLOWED = 405,
  NOT_ACCEPTABLE = 406,
  PROXY_AUTHENTICATION_REQUIRED = 407,
  REQUEST_TIMEOUT = 408,
  CONFLICT = 409,
  GONE = 410,
  LENGTH_REQUIRED = 411,
  PRECONDITION_FAILED = 412,
  PAYLOAD_TOO_LARGE = 413,
  URI_TOO_LONG = 414,
  UNSUPPORTED_MEDIA_TYPE = 415,
  REQUESTED_RANGE_NOT_SATISFIABLE = 416,
  EXPECTATION_FAILED = 417,
  I_AM_A_TEAPOT = 418,
  MISDIRECTED = 421,
  UNPROCESSABLE_ENTITY = 422,
  LOCKED = 423,
  FAILED_DEPENDENCY = 424,
  PRECONDITION_REQUIRED = 428,
  TOO_MANY_REQUESTS = 429,
  UNRECOVERABLE_ERROR = 456,
  INTERNAL_SERVER_ERROR = 500,
  NOT_IMPLEMENTED = 501,
  BAD_GATEWAY = 502,
  SERVICE_UNAVAILABLE = 503,
  GATEWAY_TIMEOUT = 504,
  HTTP_VERSION_NOT_SUPPORTED = 505,
  INSUFFICIENT_STORAGE = 507,
  LOOP_DETECTED = 508
}

interface Options {
  status: HttpStatus
  code?: string
  errors?: Array<{
    path?: string
    message: string
  }>
}

export class HttpError extends Error {
  public readonly status!: HttpStatus
  public readonly code!: string
  public readonly errors?: Options['errors']

  constructor(message: string, { status, code, errors }: Options) {
    super(message)
    this.name = 'HttpError'

    // Make properties truly readonly at runtime
    Object.defineProperty(this, 'status', {
      value: status ?? HttpStatus.INTERNAL_SERVER_ERROR,
      writable: false,
      enumerable: true,
      configurable: false
    })

    Object.defineProperty(this, 'code', {
      value: code || 'HTTP_ERROR',
      writable: false,
      enumerable: true,
      configurable: false
    })

    Object.defineProperty(this, 'errors', {
      value: errors,
      writable: false,
      enumerable: true,
      configurable: false
    })
  }

  getStatus(): number {
    return this.status
  }

  getCode(): string {
    return this.code
  }

  getErrors(): Array<{ path?: string; message: string }> | undefined {
    return this.errors
  }

  toJSON(): Record<string, any> {
    return {
      status: this.status,
      code: this.code,
      message: this.message,
      errors: this.errors
    }
  }
}

export class BadGatewayError extends HttpError {
  constructor(
    message: string = 'Bad Gateway',
    code: string = 'BAD_GATEWAY',
    errors?: Options['errors']
  ) {
    super(message, { status: HttpStatus.BAD_GATEWAY, code, errors })
  }
}

export class BadRequestError extends HttpError {
  constructor(
    message: string = 'Bad Request',
    code: string = 'BAD_REQUEST',
    errors?: Options['errors']
  ) {
    super(message, { status: HttpStatus.BAD_REQUEST, code, errors })
  }
}

export class ConflictError extends HttpError {
  constructor(message: string = 'Conflict', code: string = 'CONFLICT', errors?: Options['errors']) {
    super(message, { status: HttpStatus.CONFLICT, code, errors })
  }
}

export class ForbiddenError extends HttpError {
  constructor(
    message: string = 'Forbidden',
    code: string = 'FORBIDDEN',
    errors?: Options['errors']
  ) {
    super(message, { status: HttpStatus.FORBIDDEN, code, errors })
  }
}

export class TooManyRequestsError extends HttpError {
  constructor(
    message: string = 'Too Many Requests',
    code: string = 'TOO_MANY_REQUESTS',
    errors?: Options['errors']
  ) {
    super(message, { status: HttpStatus.TOO_MANY_REQUESTS, code, errors })
  }
}

export class GatewayTimeoutError extends HttpError {
  constructor(
    message: string = 'Gateway Timeout',
    code: string = 'GATEWAY_TIMEOUT',
    errors?: Options['errors']
  ) {
    super(message, { status: HttpStatus.GATEWAY_TIMEOUT, code, errors })
  }
}

export class GoneError extends HttpError {
  constructor(message: string = 'Gone', code: string = 'GONE', errors?: Options['errors']) {
    super(message, { status: HttpStatus.GONE, code, errors })
  }
}

export class HttpVersionNotSupportedError extends HttpError {
  constructor(
    message: string = 'HTTP Version Not Supported',
    code: string = 'HTTP_VERSION_NOT_SUPPORTED',
    errors?: Options['errors']
  ) {
    super(message, { status: HttpStatus.HTTP_VERSION_NOT_SUPPORTED, code, errors })
  }
}

export class ImATeapotError extends HttpError {
  constructor(
    message: string = "I'm a teapot",
    code: string = 'I_AM_A_TEAPOT',
    errors?: Options['errors']
  ) {
    super(message, { status: HttpStatus.I_AM_A_TEAPOT, code, errors })
  }
}

export class InternalServerError extends HttpError {
  constructor(
    message: string = 'Internal Server Error',
    code: string = 'INTERNAL_SERVER_ERROR',
    errors?: Options['errors']
  ) {
    super(message, { status: HttpStatus.INTERNAL_SERVER_ERROR, code, errors })
  }
}

export class MethodNotAllowedError extends HttpError {
  constructor(
    message: string = 'Method Not Allowed',
    code: string = 'METHOD_NOT_ALLOWED',
    errors?: Options['errors']
  ) {
    super(message, { status: HttpStatus.METHOD_NOT_ALLOWED, code, errors })
  }
}

export class MisdirectedError extends HttpError {
  constructor(
    message: string = 'Misdirected Request',
    code: string = 'MISDIRECTED',
    errors?: Options['errors']
  ) {
    super(message, { status: HttpStatus.MISDIRECTED, code, errors })
  }
}

export class NotAcceptableError extends HttpError {
  constructor(
    message: string = 'Not Acceptable',
    code: string = 'NOT_ACCEPTABLE',
    errors?: Options['errors']
  ) {
    super(message, { status: HttpStatus.NOT_ACCEPTABLE, code, errors })
  }
}

export class NotFoundError extends HttpError {
  constructor(
    message: string = 'Not Found',
    code: string = 'NOT_FOUND',
    errors?: Options['errors']
  ) {
    super(message, { status: HttpStatus.NOT_FOUND, code, errors })
  }
}

export class NotImplementedError extends HttpError {
  constructor(
    message: string = 'Not Implemented',
    code: string = 'NOT_IMPLEMENTED',
    errors?: Options['errors']
  ) {
    super(message, { status: HttpStatus.NOT_IMPLEMENTED, code, errors })
  }
}

export class PayloadTooLargeError extends HttpError {
  constructor(
    message: string = 'Payload Too Large',
    code: string = 'PAYLOAD_TOO_LARGE',
    errors?: Options['errors']
  ) {
    super(message, { status: HttpStatus.PAYLOAD_TOO_LARGE, code, errors })
  }
}

export class PreconditionFailedError extends HttpError {
  constructor(
    message: string = 'Precondition Failed',
    code: string = 'PRECONDITION_FAILED',
    errors?: Options['errors']
  ) {
    super(message, { status: HttpStatus.PRECONDITION_FAILED, code, errors })
  }
}

export class RequestTimeoutError extends HttpError {
  constructor(
    message: string = 'Request Timeout',
    code: string = 'REQUEST_TIMEOUT',
    errors?: Options['errors']
  ) {
    super(message, { status: HttpStatus.REQUEST_TIMEOUT, code, errors })
  }
}

export class ServiceUnavailableError extends HttpError {
  constructor(
    message: string = 'Service Unavailable',
    code: string = 'SERVICE_UNAVAILABLE',
    errors?: Options['errors']
  ) {
    super(message, { status: HttpStatus.SERVICE_UNAVAILABLE, code, errors })
  }
}

export class UnauthorizedError extends HttpError {
  constructor(
    message: string = 'Unauthorized',
    code: string = 'UNAUTHORIZED',
    errors?: Options['errors']
  ) {
    super(message, { status: HttpStatus.UNAUTHORIZED, code, errors })
  }
}

export class UnprocessableEntityError extends HttpError {
  constructor(
    message: string = 'Unprocessable Entity',
    code: string = 'UNPROCESSABLE_ENTITY',
    errors?: Options['errors']
  ) {
    super(message, { status: HttpStatus.UNPROCESSABLE_ENTITY, code, errors })
  }
}

export class UnsupportedMediaTypeError extends HttpError {
  constructor(
    message: string = 'Unsupported Media Type',
    code: string = 'UNSUPPORTED_MEDIA_TYPE',
    errors?: Options['errors']
  ) {
    super(message, { status: HttpStatus.UNSUPPORTED_MEDIA_TYPE, code, errors })
  }
}
