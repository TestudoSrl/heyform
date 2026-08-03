import { Controller, Get, Req, Res } from '@nestjs/common'

import { AuthService } from '@service'

@Controller()
export class LogoutController {
  constructor(private readonly authService: AuthService) {}

  @Get('/logout')
  async index(@Req() req: any, @Res() res: any) {
    await this.authService.removeSession(req, res)
    res.redirect(302, '/login')
  }
}
