import os
import subprocess

# 1. src/database 폴더 생성
os.makedirs('src/database', exist_ok=True)

# 2. src/database/database.module.ts 생성 (Supabase Pool + Neon Pool 동시 공급)
database_module_content = """import { Module, Global } from '@nestjs/common';
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
"""

with open('src/database/database.module.ts', 'w') as f:
    f.write(database_module_content)
print("생성 완료: src/database/database.module.ts")

# 3. src/database/dual-db.controller.ts 생성 (검증용 엔드포인트)
dual_db_controller_content = """import { Controller, Get, Inject } from '@nestjs/common';
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
"""

with open('src/database/dual-db.controller.ts', 'w') as f:
    f.write(dual_db_controller_content)
print("생성 완료: src/database/dual-db.controller.ts")

# 4. src/app.module.ts 에 DatabaseModule 및 DualDbController 등록
app_module_path = 'src/app.module.ts'
if os.path.exists(app_module_path):
    with open(app_module_path, 'r') as f:
        app_content = f.read()

    # Import 추가
    if 'DatabaseModule' not in app_content:
        import_stmt = "import { DatabaseModule } from './database/database.module';\nimport { DualDbController } from './database/dual-db.controller';\n"
        app_content = import_stmt + app_content
        
        # imports 배열에 DatabaseModule 추가
        app_content = app_content.replace('imports: [', 'imports: [\n    DatabaseModule,', 1)
        # controllers 배열에 DualDbController 추가
        app_content = app_content.replace('controllers: [', 'controllers: [\n    DualDbController,', 1)

        with open(app_module_path, 'w') as f:
            f.write(app_content)
        print("업데이트 완료: src/app.module.ts")

# 5. Git Commit & Push
print("\nGit 커밋 및 배포를 진행합니다...")
subprocess.run(["git", "add", "."])
subprocess.run(["git", "commit", "-m", "feat: Supabase(그룹A) 및 Neon(그룹B) 듀얼 DB 연결 구성"])
subprocess.run(["git", "push", "origin", "main"])
