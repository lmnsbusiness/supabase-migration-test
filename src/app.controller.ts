import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get('health')
  health() {
    return {
      status: 'ok',
      service: 'supabase-migration-test',
      runtime: 'NestJS 11'
    };
  }
}
