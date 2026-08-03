import { APP_HOMEPAGE_URL } from '@environments'
import { AppType } from '@graphql'
import { Query, Resolver } from '@nestjs/graphql'
import { AppService } from '@service'

@Resolver()
export class AppsResolver {
  constructor(private readonly appService: AppService) {}

  @Query(returns => [AppType])
  async apps(): Promise<AppType[]> {
    return this.appService.findAll().map(i => ({
      ...i,
      icon: APP_HOMEPAGE_URL + i.icon
    }))
  }
}
