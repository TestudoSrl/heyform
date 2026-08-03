import { UseGuards, applyDecorators } from '@nestjs/common'

import { AuthGuard, DeviceIdGuard } from '@guard'

export function Auth(): any {
  return applyDecorators(UseGuards(DeviceIdGuard, AuthGuard))
}
