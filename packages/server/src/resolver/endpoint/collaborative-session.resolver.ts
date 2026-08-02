import { BadRequestException, UseGuards } from '@nestjs/common'

import {
  CollaborativeSessionInput,
  CollaborativeSessionType,
  UpdateCollaborativeSessionInput
} from '@graphql'
import { EndpointAnonymousIdGuard } from '@guard'
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql'
import { CollaborativeSessionService, FormService } from '@service'

@Resolver()
@UseGuards(EndpointAnonymousIdGuard)
export class CollaborativeSessionResolver {
  constructor(
    private readonly formService: FormService,
    private readonly collaborativeSessionService: CollaborativeSessionService
  ) {}

  @Query(returns => CollaborativeSessionType)
  async collaborativeSession(
    @Args('input') input: CollaborativeSessionInput
  ): Promise<CollaborativeSessionType> {
    const session = await this.collaborativeSessionService.findByToken(input.token)

    if (!session || session.expiresAt <= new Date()) {
      throw new BadRequestException('The shared response does not exist or has expired')
    }

    return this.toType(session)
  }

  @Mutation(returns => CollaborativeSessionType)
  async updateCollaborativeSession(
    @Args('input') input: UpdateCollaborativeSessionInput
  ): Promise<CollaborativeSessionType> {
    const session = await this.collaborativeSessionService.findByToken(input.token)

    if (!session) {
      throw new BadRequestException('The shared response does not exist')
    }

    const form = await this.formService.findById(session.formId)

    if (!form?.settings?.active) {
      throw new BadRequestException('The form is no longer active')
    }

    return this.toType(
      await this.collaborativeSessionService.update(input.token, form, input.changes)
    )
  }

  private toType(session: any): CollaborativeSessionType {
    return {
      token: session.id,
      formId: session.formId,
      values: session.values || {},
      revision: session.revision || 0,
      completed: session.completedAt > 0
    }
  }
}
