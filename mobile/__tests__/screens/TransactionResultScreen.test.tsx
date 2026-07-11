import React from 'react';
import renderer, {act} from 'react-test-renderer';
import {Provider} from 'react-redux';
import {configureStore} from '@reduxjs/toolkit';
import transactionReducer, {
  processPayment,
} from '../../src/store/slices/transactionSlice';
import TransactionResultScreen from '../../src/screens/TransactionResultScreen';
import {TransactionStatus} from '../../src/types';

const mockApprovedTx = {
  id: 'tx-1',
  reference: 'ORDER-123',
  status: TransactionStatus.APPROVED,
  amountInCents: 25000000,
  currency: 'COP',
  customerEmail: 'test@test.com',
  paymentMethodType: 'CARD',
  items: [{productId: '1', productName: 'Test Product', quantity: 1, unitPrice: 25000000}],
  createdAt: '2024-01-01',
  updatedAt: '2024-01-01',
};

const createTestStore = (transaction: any = null) => {
  const store = configureStore({reducer: {transaction: transactionReducer}});
  if (transaction) {
    store.dispatch(processPayment.fulfilled(transaction, 'req', {} as any));
  }
  return store;
};

describe('TransactionResultScreen', () => {
  const mockNavigation = {reset: jest.fn()};

  it('should show success for APPROVED', () => {
    const store = createTestStore(mockApprovedTx);
    let tree: any;
    act(() => {
      tree = renderer.create(
        <Provider store={store}>
          <TransactionResultScreen navigation={mockNavigation} />
        </Provider>,
      );
    });
    const json = JSON.stringify(tree.toJSON());
    expect(json).toContain('Pago exitoso');
  });

  it('should show declined for DECLINED', () => {
    const store = createTestStore({...mockApprovedTx, status: TransactionStatus.DECLINED});
    let tree: any;
    act(() => {
      tree = renderer.create(
        <Provider store={store}>
          <TransactionResultScreen navigation={mockNavigation} />
        </Provider>,
      );
    });
    const json = JSON.stringify(tree.toJSON());
    expect(json).toContain('Pago rechazado');
  });

  it('should show pending for PENDING', () => {
    const store = createTestStore({...mockApprovedTx, status: TransactionStatus.PENDING});
    let tree: any;
    act(() => {
      tree = renderer.create(
        <Provider store={store}>
          <TransactionResultScreen navigation={mockNavigation} />
        </Provider>,
      );
    });
    const json = JSON.stringify(tree.toJSON());
    expect(json).toContain('Pago pendiente');
  });

  it('should show error for ERROR', () => {
    const store = createTestStore({...mockApprovedTx, status: TransactionStatus.ERROR});
    let tree: any;
    act(() => {
      tree = renderer.create(
        <Provider store={store}>
          <TransactionResultScreen navigation={mockNavigation} />
        </Provider>,
      );
    });
    const json = JSON.stringify(tree.toJSON());
    expect(json).toContain('Error en el pago');
  });

  it('should show transaction reference', () => {
    const store = createTestStore(mockApprovedTx);
    let tree: any;
    act(() => {
      tree = renderer.create(
        <Provider store={store}>
          <TransactionResultScreen navigation={mockNavigation} />
        </Provider>,
      );
    });
    const json = JSON.stringify(tree.toJSON());
    expect(json).toContain('ORDER-123');
  });

  it('should show go home button', () => {
    const store = createTestStore(mockApprovedTx);
    let tree: any;
    act(() => {
      tree = renderer.create(
        <Provider store={store}>
          <TransactionResultScreen navigation={mockNavigation} />
        </Provider>,
      );
    });
    const json = JSON.stringify(tree.toJSON());
    expect(json).toContain('Volver a la tienda');
  });
});
