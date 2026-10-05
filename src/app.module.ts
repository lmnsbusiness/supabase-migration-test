import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { DatabaseService } from './database.service';
import { OrderModule } from './order/order.module';
import { PaymentModule } from './payment/payment.module';

@Module({
  imports: [
    OrderModule,
    PaymentModule,
  ],
  controllers: [AppController],
  providers: [DatabaseService],
})
export class AppModule {}
