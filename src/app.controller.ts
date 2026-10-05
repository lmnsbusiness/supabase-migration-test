import { Controller, Get } from '@nestjs/common';
import { DatabaseService } from './database.service';

@Controller()
export class AppController {
  constructor(private readonly databaseService: DatabaseService) {}

  @Get('health')
  health() {
    return {
      status: 'ok',
      service: 'supabase-migration-test',
      runtime: 'NestJS 11'
    };
  }

  @Get('health/db')
  async databaseHealth() {
    const db = await this.databaseService.health();

    return {
      status: 'ok',
      database: db.database,
      user: db.db_user,
      version: db.version,
      serverTime: db.server_time
    };
  }
}
