import { Injectable } from '@nestjs/common'

import * as apps from '../apps'

@Injectable()
export class AppService {
  private readonly apps = apps

  findAll() {
    return Object.values(this.apps)
  }

  findById(id: string) {
    return this.apps[id]
  }
}
