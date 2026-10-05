import { CompareController } from './database/compare.controller';
import { DeliveryModule } from './delivery/delivery.module';
import { DatabaseModule } from './database/database.module';
import { DualDbController } from './database/dual-db.controller';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { DatabaseService } from './database.service';
import { OrderModule } from './order/order.module';
import { PaymentModule } from './payment/payment.module';

@Module({
  imports: [
    DeliveryModule,
    DatabaseModule,
    OrderModule,
    PaymentModule,
  ],
  controllers: [
    CompareController,
    DualDbController,AppController],
  providers: [DatabaseService],
})
export class AppModule {}
