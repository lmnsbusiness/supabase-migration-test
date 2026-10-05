import { DatabaseModule } from './database/database.module';
import { DualDbController } from './database/dual-db.controller';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { DatabaseService } from './database.service';
import { OrderModule } from './order/order.module';
import { PaymentModule } from './payment/payment.module';

@Module({
  imports: [
    DatabaseModule,
    OrderModule,
    PaymentModule,
  ],
  controllers: [
    DualDbController,AppController],
  providers: [DatabaseService],
})
export class AppModule {}
