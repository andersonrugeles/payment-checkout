import { Injectable, BadRequestException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { ProductsService } from '../products/products.service';
import { PaymentService } from '../payment/payment.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import {
  Transaction,
  TransactionStatus,
  TransactionItem,
} from './entities/transaction.entity';

@Injectable()
export class TransactionsService {
  private transactions: Transaction[] = [];

  constructor(
    private readonly productsService: ProductsService,
    private readonly paymentService: PaymentService,
  ) {}

  async create(dto: CreateTransactionDto): Promise<Transaction> {
    // 1. Validate products and calculate total
    const items: TransactionItem[] = [];
    let totalAmountInCents = 0;

    for (const item of dto.items) {
      const product = this.productsService.findOne(item.productId);
      if (product.stock < item.quantity) {
        throw new BadRequestException(
          `Insufficient stock for "${product.name}". Available: ${product.stock}`,
        );
      }
      items.push({
        productId: product.id,
        productName: product.name,
        quantity: item.quantity,
        unitPrice: product.price,
      });
      totalAmountInCents += product.price * item.quantity;
    }

    // 2. Create transaction in PENDING status
    const transaction: Transaction = {
      id: randomUUID(),
      reference: `ORDER-${Date.now()}`,
      status: TransactionStatus.PENDING,
      amountInCents: totalAmountInCents,
      currency: 'COP',
      customerEmail: dto.customerEmail,
      paymentMethodType: 'CARD',
      items,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.transactions.push(transaction);

    // 3. Tokenize card with payment provider
    let tokenData: any;
    try {
      tokenData = await this.paymentService.tokenizeCard({
        number: dto.cardData.number,
        cvc: dto.cardData.cvc,
        exp_month: dto.cardData.exp_month,
        exp_year: dto.cardData.exp_year,
        card_holder: dto.cardData.card_holder,
      });
    } catch (error) {
      transaction.status = TransactionStatus.ERROR;
      transaction.updatedAt = new Date();
      throw new BadRequestException(
        error.message || 'Failed to tokenize card',
      );
    }

    const cardToken = tokenData?.data?.id;
    if (!cardToken) {
      transaction.status = TransactionStatus.ERROR;
      transaction.updatedAt = new Date();
      throw new BadRequestException('Failed to obtain card token');
    }

    // 4. Get acceptance token
    let acceptanceToken: string;
    try {
      acceptanceToken = await this.paymentService.getAcceptanceToken();
    } catch (error) {
      transaction.status = TransactionStatus.ERROR;
      transaction.updatedAt = new Date();
      throw new BadRequestException('Failed to get acceptance token');
    }

    // 5. Create payment with provider
    const signature = this.paymentService.generateSignature(
      transaction.reference,
      totalAmountInCents,
      'COP',
    );

    let paymentResult: any;
    try {
      paymentResult = await this.paymentService.createTransaction({
        amount_in_cents: totalAmountInCents,
        currency: 'COP',
        customer_email: dto.customerEmail,
        payment_method: {
          type: 'CARD',
          token: cardToken,
          installments: dto.installments,
        },
        reference: transaction.reference,
        acceptance_token: acceptanceToken,
        signature,
      });
    } catch (error) {
      transaction.status = TransactionStatus.ERROR;
      transaction.updatedAt = new Date();
      throw new BadRequestException(
        error.message || 'Payment processing failed',
      );
    }

    // 6. Update transaction with result
    const externalStatus = paymentResult?.data?.status;
    transaction.externalTransactionId = paymentResult?.data?.id;
    transaction.updatedAt = new Date();

    if (externalStatus === 'APPROVED') {
      transaction.status = TransactionStatus.APPROVED;
      // Decrease stock for all items
      for (const item of dto.items) {
        this.productsService.decreaseStock(item.productId, item.quantity);
      }
    } else if (externalStatus === 'DECLINED') {
      transaction.status = TransactionStatus.DECLINED;
    } else if (externalStatus === 'PENDING') {
      transaction.status = TransactionStatus.PENDING;
    } else {
      transaction.status = TransactionStatus.ERROR;
    }

    return transaction;
  }

  findAll(): Transaction[] {
    return this.transactions;
  }

  findOne(id: string): Transaction {
    const transaction = this.transactions.find((t) => t.id === id);
    if (!transaction) {
      throw new BadRequestException(`Transaction with id ${id} not found`);
    }
    return transaction;
  }

  async refreshStatus(id: string): Promise<Transaction> {
    const transaction = this.findOne(id);

    if (!transaction.externalTransactionId) {
      return transaction;
    }

    try {
      const result = await this.paymentService.getTransaction(
        transaction.externalTransactionId,
      );
      const externalStatus = result?.data?.status;

      if (externalStatus === 'APPROVED' && transaction.status === TransactionStatus.PENDING) {
        transaction.status = TransactionStatus.APPROVED;
        for (const item of transaction.items) {
          this.productsService.decreaseStock(item.productId, item.quantity);
        }
      } else if (externalStatus === 'DECLINED') {
        transaction.status = TransactionStatus.DECLINED;
      } else if (externalStatus === 'ERROR' || externalStatus === 'VOIDED') {
        transaction.status = TransactionStatus.ERROR;
      }
      transaction.updatedAt = new Date();
    } catch (error) {
      // Keep current status if refresh fails
    }

    return transaction;
  }
}
