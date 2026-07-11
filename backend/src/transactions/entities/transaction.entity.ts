export enum TransactionStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  DECLINED = 'DECLINED',
  ERROR = 'ERROR',
  VOIDED = 'VOIDED',
}

export class TransactionItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
}

export class Transaction {
  id: string;
  reference: string;
  status: TransactionStatus;
  amountInCents: number;
  currency: string;
  customerEmail: string;
  paymentMethodType: string;
  items: TransactionItem[];
  externalTransactionId?: string;
  createdAt: Date;
  updatedAt: Date;
}
