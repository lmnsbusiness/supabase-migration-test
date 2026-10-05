import { Module } from '@nestjs/common';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { DatabaseService } from '../database.service';

@Module({
  controllers: [OrderController],
  providers: [OrderService, DatabaseService],
})
export class OrderModule {}
