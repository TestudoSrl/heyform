import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common'

import { ChangelogService } from '@service'

@Controller()
export class ChangelogController {
  constructor(private readonly changelogService: ChangelogService) {}

  @Get('/api/changelog/latest')
  @HttpCode(HttpStatus.OK)
  async getLatestRelease() {
    return this.changelogService.getLatestRelease()
  }

  @Get('/api/changelogs')
  @HttpCode(HttpStatus.OK)
  async changelogs() {
    return this.changelogService.getAllReleases()
  }
}
