import { Module, Global } from '@nestjs/common';
import { Pool } from 'pg';

@Global()
@Module({
  providers: [
    {
      provide: 'SUPABASE_POOL',
      useFactory: () => {
        const connectionString = process.env.SUPABASE_DATABASE_URL;
        return new Pool({
          connectionString,
          ssl: connectionString ? { rejectUnauthorized: false } : false,
        });
      },
    },
    {
      provide: 'NEON_POOL',
      useFactory: () => {
        const connectionString = process.env.NEON_DATABASE_URL || process.env.DATABASE_URL;
        return new Pool({
          connectionString,
          ssl: connectionString ? { rejectUnauthorized: false } : false,
        });
      },
    },
  ],
  exports: ['SUPABASE_POOL', 'NEON_POOL'],
})
export class DatabaseModule {}
