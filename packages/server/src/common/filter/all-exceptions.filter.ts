import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  InternalServerErrorException
} from '@nestjs/common'

import { helper } from '@heyform-inc/utils'
import { GqlExecutionContext } from '@nestjs/graphql'
import { Logger } from '@utils'

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name)

  catch(exception: Error, host: ArgumentsHost): any {
    this.logger.error(exception, (exception as any).stack)

    const gqlCtx = GqlExecutionContext.create(host as any)
    const ctx = gqlCtx.getContext()

    if (helper.isValid(ctx.req)) {
      return exception
    }

    const res = host.switchToHttp().getResponse()

    let httpException = exception as HttpException

    if (!(exception instanceof HttpException)) {
      httpException = new InternalServerErrorException(exception.message)
    }

    if (res.get('content-type') === 'text/event-stream') {
      const response = httpException.getResponse()
      let message = response as string

      if (helper.isObject(response)) {
        message = (response as any).message[0]
      }

      res.sse(`data: [ERROR] ${message}\n\n`)
      return res.end()
    }

    res.status(httpException.getStatus()).json(httpException.getResponse())
  }
}
