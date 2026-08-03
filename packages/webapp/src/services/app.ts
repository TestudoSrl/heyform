import { apollo } from '@/utils'

import { APPS_GQL } from '@/consts'

export class AppService {
  static async apps() {
    return apollo.query({
      query: APPS_GQL
    })
  }
}
