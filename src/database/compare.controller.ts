import { Controller, Get, Post, Body, Query, Inject } from '@nestjs/common';
import { Pool } from 'pg';
import { randomUUID } from 'crypto';

@Controller('compare')
export class CompareController {
  constructor(
    @Inject('SUPABASE_POOL') private readonly supabasePool: Pool,
    @Inject('NEON_POOL') private readonly neonPool: Pool,
  ) {}

  // 1. 테이블 초기 생성 (Supabase와 Neon 양쪽에 동일 스키마 생성)
  @Get('init-tables')
  async initTables() {
    const ddl = `
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        item_name VARCHAR(100),
        amount INTEGER,
        status VARCHAR(20) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS payments (
        id SERIAL PRIMARY KEY,
        order_id VARCHAR(50),
        toss_order_id VARCHAR(100),
        payment_key VARCHAR(100),
        amount INTEGER,
        status VARCHAR(20),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    const results: any = {};

    try {
      await this.supabasePool.query(ddl);
      results.supabase = '성공: Supabase에 orders 및 payments 테이블 생성 완료';
    } catch (err: any) {
      results.supabase = `실패: ${err.message}`;
    }

    try {
      await this.neonPool.query(ddl);
      results.neon = '성공: Neon에 orders 및 payments 테이블 생성 완료';
    } catch (err: any) {
      results.neon = `실패: ${err.message}`;
    }

    return results;
  }

  // 2. 브라우저/curl 테스트: Supabase DB에 1건 INSERT 후 최근 내역 조회
  @Get('supabase')
  async testSupabase() {
    const tossOrderId = `TOSS_SUPA_${randomUUID()}`;
    const insertSql = `
      INSERT INTO payments (order_id, toss_order_id, amount, status)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `;
    const inserted = await this.supabasePool.query(insertSql, ['1', tossOrderId, 15000, 'ready']);
    const list = await this.supabasePool.query('SELECT * FROM payments ORDER BY id DESC LIMIT 5;');

    return {
      target: 'Group A: Supabase PostgreSQL',
      insertedRow: inserted.rows[0],
      recentRows: list.rows,
    };
  }

  // 3. 브라우저/curl 테스트: Neon DB에 1건 INSERT 후 최근 내역 조회
  @Get('neon')
  async testNeon() {
    const tossOrderId = `TOSS_NEON_${randomUUID()}`;
    const insertSql = `
      INSERT INTO payments (order_id, toss_order_id, amount, status)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `;
    const inserted = await this.neonPool.query(insertSql, ['1', tossOrderId, 15000, 'ready']);
    const list = await this.neonPool.query('SELECT * FROM payments ORDER BY id DESC LIMIT 5;');

    return {
      target: 'Group B: Neon PostgreSQL',
      insertedRow: inserted.rows[0],
      recentRows: list.rows,
    };
  }

  // 4. curl/Postman 공용: target 파라미터(supabase | neon)로 결제건 생성
  @Post('payments/prepare')
  async preparePayment(
    @Query('target') target: string,
    @Body() body: { orderId: string; amount: number },
  ) {
    const pool = (target === 'supabase') ? this.supabasePool : this.neonPool;
    const dbName = (target === 'supabase') ? 'Supabase' : 'Neon';
    const tossOrderId = `TOSS_${dbName.toUpperCase()}_${randomUUID()}`;

    const sql = `
      INSERT INTO payments (order_id, toss_order_id, amount, status)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `;
    const res = await pool.query(sql, [body.orderId || '1', tossOrderId, body.amount || 15000, 'ready']);

    return {
      database: dbName,
      data: res.rows[0],
    };
  }
}
