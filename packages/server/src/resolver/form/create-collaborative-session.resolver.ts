import { BadRequestException } from '@nestjs/common'

import { Auth, FormGuard } from '@decorator'
import { CollaborativeSessionType, CreateCollaborativeSessionInput } from '@graphql'
import { Args, Mutation, Resolver } from '@nestjs/graphql'
import { CollaborativeSessionService, FormService } from '@service'

@Resolver()
@Auth()
export class CreateCollaborativeSessionResolver {
  constructor(
    private readonly formService: FormService,
    private readonly collaborativeSessionService: CollaborativeSessionService
  ) {}

  @Mutation(returns => CollaborativeSessionType)
  @FormGuard()
  async createCollaborativeSession(
    @Args('input') input: CreateCollaborativeSessionInput
  ): Promise<CollaborativeSessionType> {
    const form = await this.formService.findById(input.formId)

    if (!form?.settings?.active || !form.fields?.length) {
      throw new BadRequestException('Publish the form before creating a shared response')
    }

    const session = await this.collaborativeSessionService.create(form.id)

    return {
      token: session.id,
      formId: session.formId,
      values: session.values || {},
      revision: session.revision,
      completed: false,
      participantCount: 0
    }
  }
}
