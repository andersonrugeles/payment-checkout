import { Module } from '@nestjs/common';
import { TransactionsController } from './transactions.controller';
import { TransactionsService } from './transactions.service';
import { ProductsModule } from '../products/products.module';
import { PaymentModule } from '../payment/payment.module';

@Module({
  imports: [ProductsModule, PaymentModule],
  controllers: [TransactionsController],
  providers: [TransactionsService],
})
export class TransactionsModule {}
