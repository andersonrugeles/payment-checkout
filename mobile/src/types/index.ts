export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  image: string;
  stock: number;
  category: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface CardData {
  number: string;
  cvc: string;
  exp_month: string;
  exp_year: string;
  card_holder: string;
}

export interface TransactionItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
}

export enum TransactionStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  DECLINED = 'DECLINED',
  ERROR = 'ERROR',
}

export interface Transaction {
  id: string;
  reference: string;
  status: TransactionStatus;
  amountInCents: number;
  currency: string;
  customerEmail: string;
  paymentMethodType: string;
  items: TransactionItem[];
  externalTransactionId?: string;
  createdAt: string;
  updatedAt: string;
}

export type CardBrand = 'visa' | 'mastercard' | 'unknown';
