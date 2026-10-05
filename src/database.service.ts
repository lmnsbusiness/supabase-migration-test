import { Injectable } from '@nestjs/common';
import { Pool } from 'pg';

@Injectable()
export class DatabaseService {
  private pool: Pool | null = null;

  private getPool(): Pool {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL is not configured');
    }

    if (!this.pool) {
      this.pool = new Pool({
        connectionString: process.env.DATABASE_URL,
      });
    }

    return this.pool;
  }

  async health() {
    const result = await this.getPool().query(`
      SELECT
        current_database() AS database,
        current_user AS db_user,
        current_setting('server_version') AS version,
        NOW() AS server_time
    `);

    return result.rows[0];
  }
}
