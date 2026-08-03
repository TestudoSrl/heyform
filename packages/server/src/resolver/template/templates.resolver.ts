import { Auth } from '@decorator'
import { TemplateType } from '@graphql'
import { Query, Resolver } from '@nestjs/graphql'

@Resolver()
@Auth()
export class TemplatesResolver {
  @Query(returns => [TemplateType])
  async templates(): Promise<TemplateType[]> {
    return []
  }
}
