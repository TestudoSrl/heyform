import { ApolloServerPluginLandingPageDisabled } from '@apollo/server/plugin/disabled'
import { ApolloDriverConfig } from '@nestjs/apollo'
import { Injectable } from '@nestjs/common'

import { helper } from '@heyform-inc/utils'
import { GqlOptionsFactory } from '@nestjs/graphql'
import { lowerDirective, lowerDirectiveTransformer } from '@utils'

@Injectable()
export class GraphqlService implements GqlOptionsFactory<ApolloDriverConfig> {
  async createGqlOptions(): Promise<ApolloDriverConfig> {
    return {
      buildSchemaOptions: {
        directives: [lowerDirective]
      },
      resolverValidationOptions: {
        requireResolversForResolveType: 'ignore'
      },
      autoSchemaFile: true,
      introspection: true,
      plugins: [ApolloServerPluginLandingPageDisabled()],
      transformSchema: schema => lowerDirectiveTransformer(schema),
      formatError: e => {
        const originalError =
          e.extensions?.originalError && typeof e.extensions.originalError === 'object'
            ? (e.extensions.originalError as Record<string, any>)
            : undefined
        const response =
          originalError && 'response' in originalError
            ? (originalError as { response?: any }).response
            : undefined
        const { response: _response, ...exception } = originalError ?? {}
        let code = e.extensions?.code
        let message = e.message as string

        if (helper.isValid(response)) {
          if (helper.isValid(response.code)) {
            code = response.code
          } else if (helper.isValid(response.error)) {
            code = response.error.replace(/\s+/g, '_').toUpperCase()
          }

          if (helper.isValid(response.message)) {
            message = helper.isArray(response.message) ? response.message[0] : response.message
          }
        }

        return {
          code,
          message: e.message,
          ...exception,
          ...{ message }
        }
      },
      context: ({ req, res }) => ({ req, res })
    }
  }
}
