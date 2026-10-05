import { Module } from '@nestjs/common';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { DatabaseService } from '../database.service';

@Module({
  controllers: [PaymentController],
  providers: [PaymentService, DatabaseService],
})
export class PaymentModule {}
