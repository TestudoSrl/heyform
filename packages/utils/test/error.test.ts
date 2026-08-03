import { expect, test } from 'vitest'

import {
  BadGatewayError,
  BadRequestError,
  ConflictError,
  ForbiddenError,
  GatewayTimeoutError,
  GoneError,
  HttpError,
  HttpStatus,
  HttpVersionNotSupportedError,
  ImATeapotError,
  InternalServerError,
  MethodNotAllowedError,
  MisdirectedError,
  NotAcceptableError,
  NotFoundError,
  NotImplementedError,
  PayloadTooLargeError,
  PreconditionFailedError,
  RequestTimeoutError,
  ServiceUnavailableError,
  TooManyRequestsError,
  UnauthorizedError,
  UnprocessableEntityError,
  UnsupportedMediaTypeError
} from '../src'

test('http error exposes metadata', () => {
  const errors = [{ path: 'name', message: 'required' }]
  const err = new HttpError('Oops', { status: HttpStatus.BAD_REQUEST, code: 'BAD', errors })

  expect(err.name).toBe('HttpError')
  expect(err.status).toBe(HttpStatus.BAD_REQUEST)
  expect(err.code).toBe('BAD')
  expect(err.errors).toStrictEqual(errors)
  expect(err.getStatus()).toBe(HttpStatus.BAD_REQUEST)
  expect(err.getCode()).toBe('BAD')
  expect(err.getErrors()).toStrictEqual(errors)
  expect(err.toJSON()).toStrictEqual({
    status: HttpStatus.BAD_REQUEST,
    code: 'BAD',
    message: 'Oops',
    errors
  })

  expect(Object.getOwnPropertyDescriptor(err, 'status')?.writable).toBe(false)
  expect(Object.getOwnPropertyDescriptor(err, 'code')?.writable).toBe(false)
  expect(Object.getOwnPropertyDescriptor(err, 'errors')?.writable).toBe(false)
})

test('subclass uses defaults and custom values', () => {
  const err = new BadRequestError()

  expect(err.status).toBe(HttpStatus.BAD_REQUEST)
  expect(err.code).toBe('BAD_REQUEST')
  expect(err.message).toBe('Bad Request')

  const custom = new UnprocessableEntityError('Invalid', 'INVALID', [{ message: 'bad' }])

  expect(custom.status).toBe(HttpStatus.UNPROCESSABLE_ENTITY)
  expect(custom.code).toBe('INVALID')
  expect(custom.errors).toStrictEqual([{ message: 'bad' }])
})

test('http error defaults for missing data', () => {
  const err = new HttpError('Oops', { status: undefined as any, code: '' } as any)

  expect(err.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR)
  expect(err.code).toBe('HTTP_ERROR')
  expect(err.errors).toBeUndefined()
})

test('all http error subclasses use defaults', () => {
  const cases: Array<[new (...args: any[]) => HttpError, HttpStatus, string, string]> = [
    [BadGatewayError, HttpStatus.BAD_GATEWAY, 'BAD_GATEWAY', 'Bad Gateway'],
    [BadRequestError, HttpStatus.BAD_REQUEST, 'BAD_REQUEST', 'Bad Request'],
    [ConflictError, HttpStatus.CONFLICT, 'CONFLICT', 'Conflict'],
    [ForbiddenError, HttpStatus.FORBIDDEN, 'FORBIDDEN', 'Forbidden'],
    [GatewayTimeoutError, HttpStatus.GATEWAY_TIMEOUT, 'GATEWAY_TIMEOUT', 'Gateway Timeout'],
    [GoneError, HttpStatus.GONE, 'GONE', 'Gone'],
    [
      HttpVersionNotSupportedError,
      HttpStatus.HTTP_VERSION_NOT_SUPPORTED,
      'HTTP_VERSION_NOT_SUPPORTED',
      'HTTP Version Not Supported'
    ],
    [ImATeapotError, HttpStatus.I_AM_A_TEAPOT, 'I_AM_A_TEAPOT', "I'm a teapot"],
    [
      InternalServerError,
      HttpStatus.INTERNAL_SERVER_ERROR,
      'INTERNAL_SERVER_ERROR',
      'Internal Server Error'
    ],
    [
      MethodNotAllowedError,
      HttpStatus.METHOD_NOT_ALLOWED,
      'METHOD_NOT_ALLOWED',
      'Method Not Allowed'
    ],
    [MisdirectedError, HttpStatus.MISDIRECTED, 'MISDIRECTED', 'Misdirected Request'],
    [NotAcceptableError, HttpStatus.NOT_ACCEPTABLE, 'NOT_ACCEPTABLE', 'Not Acceptable'],
    [NotFoundError, HttpStatus.NOT_FOUND, 'NOT_FOUND', 'Not Found'],
    [NotImplementedError, HttpStatus.NOT_IMPLEMENTED, 'NOT_IMPLEMENTED', 'Not Implemented'],
    [PayloadTooLargeError, HttpStatus.PAYLOAD_TOO_LARGE, 'PAYLOAD_TOO_LARGE', 'Payload Too Large'],
    [
      PreconditionFailedError,
      HttpStatus.PRECONDITION_FAILED,
      'PRECONDITION_FAILED',
      'Precondition Failed'
    ],
    [RequestTimeoutError, HttpStatus.REQUEST_TIMEOUT, 'REQUEST_TIMEOUT', 'Request Timeout'],
    [
      ServiceUnavailableError,
      HttpStatus.SERVICE_UNAVAILABLE,
      'SERVICE_UNAVAILABLE',
      'Service Unavailable'
    ],
    [TooManyRequestsError, HttpStatus.TOO_MANY_REQUESTS, 'TOO_MANY_REQUESTS', 'Too Many Requests'],
    [UnauthorizedError, HttpStatus.UNAUTHORIZED, 'UNAUTHORIZED', 'Unauthorized'],
    [
      UnprocessableEntityError,
      HttpStatus.UNPROCESSABLE_ENTITY,
      'UNPROCESSABLE_ENTITY',
      'Unprocessable Entity'
    ],
    [
      UnsupportedMediaTypeError,
      HttpStatus.UNSUPPORTED_MEDIA_TYPE,
      'UNSUPPORTED_MEDIA_TYPE',
      'Unsupported Media Type'
    ]
  ]

  cases.forEach(([Ctor, status, code, message]) => {
    const err = new Ctor()
    expect(err.status).toBe(status)
    expect(err.code).toBe(code)
    expect(err.message).toBe(message)
  })
})
