import { Controller, Get, Inject } from '@nestjs/common';
import { Pool } from 'pg';

@Controller('health/db')
export class DualDbController {
  constructor(
    @Inject('SUPABASE_POOL') private readonly supabasePool: Pool,
    @Inject('NEON_POOL') private readonly neonPool: Pool,
  ) {}

  // 그룹 A: Supabase DB 조회 엔드포인트
  @Get('supabase')
  async checkSupabase() {
    try {
      const res = await this.supabasePool.query('SELECT current_database(), current_user, version()');
      return {
        target: 'Group A (Supabase DB)',
        status: 'ok',
        database: res.rows[0].current_database,
        user: res.rows[0].current_user,
        version: res.rows[0].version,
      };
    } catch (error) {
      return { target: 'Group A (Supabase DB)', status: 'error', message: error.message };
    }
  }

  // 그룹 B: Neon DB 조회 엔드포인트
  @Get('neon')
  async checkNeon() {
    try {
      const res = await this.neonPool.query('SELECT current_database(), current_user, version()');
      return {
        target: 'Group B (Neon DB)',
        status: 'ok',
        database: res.rows[0].current_database,
        user: res.rows[0].current_user,
        version: res.rows[0].version,
      };
    } catch (error) {
      return { target: 'Group B (Neon DB)', status: 'error', message: error.message };
    }
  }
}
