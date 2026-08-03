import { Auth, FormGuard } from '@decorator'
import { UpdateHiddenFieldsInput } from '@graphql'
import { Args, Mutation, Resolver } from '@nestjs/graphql'
import { FormService } from '@service'

@Resolver()
@Auth()
export class UpdateFormHiddenFieldsResolver {
  constructor(private readonly formService: FormService) {}

  @Mutation(returns => Boolean)
  @FormGuard()
  async updateFormHiddenFields(@Args('input') input: UpdateHiddenFieldsInput): Promise<boolean> {
    return this.formService.update(input.formId, {
      hiddenFields: input.hiddenFields
    })
  }
}
