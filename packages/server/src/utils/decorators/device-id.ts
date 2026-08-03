import { ExecutionContext, createParamDecorator } from '@nestjs/common'
import 'reflect-metadata'

import { GqlExecutionContext } from '@nestjs/graphql'

export const GqldeviceId = createParamDecorator((_: any, context: ExecutionContext): string => {
  const ctx = GqlExecutionContext.create(context)
  const { req } = ctx.getContext()
  return req.get('x-device-id')
})

export const HttpdeviceId = createParamDecorator((_: any, ctx: ExecutionContext): string => {
  const req = ctx.switchToHttp().getRequest()
  return req.get('x-device-id')
})
