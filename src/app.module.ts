import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { DatabaseService } from './database.service';
import { OrderModule } from './order/order.module';

@Module({
  imports: [OrderModule],
  controllers: [AppController],
  providers: [DatabaseService],
})
export class AppModule {}
