import { Auth } from '@decorator'
import { TemplateDetailInput, TemplateType } from '@graphql'
import { Args, Query, Resolver } from '@nestjs/graphql'

@Resolver()
@Auth()
export class TemplateDetailResolver {
  @Query(returns => TemplateType)
  async templateDetail(@Args('input') input: TemplateDetailInput) {
    return {} // TODO: implement this
  }
}
