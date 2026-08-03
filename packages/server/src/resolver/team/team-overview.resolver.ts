import { Auth, Team, TeamGuard } from '@decorator'
import { TeamDetailInput, TeamOverviewType } from '@graphql'
import { TeamModel } from '@model'
import { Args, Query, Resolver } from '@nestjs/graphql'
import { FormService, SubmissionService, TeamService } from '@service'

@Resolver()
@Auth()
export class TeamOverviewResolver {
  constructor(
    private readonly teamService: TeamService,
    private readonly formService: FormService,
    private readonly submissionService: SubmissionService
  ) {}

  @Query(returns => TeamOverviewType)
  @TeamGuard()
  async teamOverview(
    @Team() team: TeamModel,
    @Args('input') input: TeamDetailInput
  ): Promise<TeamOverviewType> {
    const [memberCount, formCount, submissionQuota] = await Promise.all([
      this.teamService.memberCount(team.id),
      this.formService.countAll(team.id),
      this.submissionService.countAllInTeam(team.id)
    ])

    return {
      memberCount,
      formCount,
      submissionQuota,
      storageQuota: team.storageQuota
    }
  }
}
