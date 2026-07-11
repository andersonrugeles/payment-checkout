import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { PaymentService } from './payment.service';

@Module({
  imports: [HttpModule, ConfigModule],
  providers: [PaymentService],
  exports: [PaymentService],
})
export class PaymentModule {}
