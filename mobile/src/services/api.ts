import axios from 'axios';
import {Product, Transaction, CardData} from '../types';

import {Platform} from 'react-native';

const API_BASE_URL = Platform.OS === 'android'
  ? 'http://10.0.2.2:3000'
  : 'http://localhost:3000';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export async function fetchProducts(): Promise<Product[]> {
  const response = await api.get('/products');
  return response.data;
}

export async function fetchProduct(id: string): Promise<Product> {
  const response = await api.get(`/products/${id}`);
  return response.data;
}

export interface CreateTransactionRequest {
  customerEmail: string;
  items: Array<{productId: string; quantity: number}>;
  cardData: CardData;
  installments: number;
}

export async function createTransaction(
  data: CreateTransactionRequest,
): Promise<Transaction> {
  const response = await api.post('/transactions', data);
  return response.data;
}

export async function getTransaction(id: string): Promise<Transaction> {
  const response = await api.get(`/transactions/${id}`);
  return response.data;
}

export async function refreshTransactionStatus(
  id: string,
): Promise<Transaction> {
  const response = await api.patch(`/transactions/${id}/refresh`);
  return response.data;
}

export {api};
