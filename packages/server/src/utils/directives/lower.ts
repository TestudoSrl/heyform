import { MapperKind, getDirective, mapSchema } from '@graphql-tools/utils'
import {
  DirectiveLocation,
  GraphQLDirective,
  GraphQLFieldConfig,
  GraphQLSchema,
  defaultFieldResolver
} from 'graphql'

export const lowerDirective = new GraphQLDirective({
  name: 'lower',
  locations: [DirectiveLocation.FIELD_DEFINITION]
})

export function lowerDirectiveTransformer(schema: GraphQLSchema): GraphQLSchema {
  return mapSchema(schema, {
    [MapperKind.OBJECT_FIELD]: (fieldConfig: GraphQLFieldConfig<any, any>) => {
      const directive = getDirective(schema, fieldConfig, 'lower')

      if (!directive?.length) {
        return fieldConfig
      }

      const { resolve = defaultFieldResolver } = fieldConfig
      fieldConfig.resolve = async (source, args, context, info) => {
        const result = await resolve(source, args, context, info)

        return typeof result === 'string' ? result.toLowerCase() : result
      }

      return fieldConfig
    }
  })
}
