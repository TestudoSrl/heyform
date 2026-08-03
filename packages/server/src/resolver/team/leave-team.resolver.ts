import { BadRequestException } from '@nestjs/common'

import { Auth, Team, TeamGuard, User } from '@decorator'
import { TeamDetailInput } from '@graphql'
import { TeamModel, UserModel } from '@model'
import { Args, Mutation, Resolver } from '@nestjs/graphql'
import { ProjectService, TeamService } from '@service'

@Resolver()
@Auth()
export class LeaveTeamResolver {
  constructor(
    private readonly teamService: TeamService,
    private readonly projectService: ProjectService
  ) {}

  @Mutation(returns => Boolean)
  @TeamGuard()
  async leaveTeam(
    @User() user: UserModel,
    @Team() team: TeamModel,
    @Args('input') input: TeamDetailInput
  ): Promise<boolean> {
    if (team.isOwner) {
      throw new BadRequestException('This operation is not allowed in the workspace')
    }

    await this.teamService.deleteMember(input.teamId, user.id)

    const projects = await this.projectService.findAllInTeam(input.teamId)
    if (projects.length > 0) {
      await this.projectService.deleteMemberInProjects(
        projects.map(row => row.id),
        user.id
      )
    }

    return true
  }
}
