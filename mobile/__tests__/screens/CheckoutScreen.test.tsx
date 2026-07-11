import React from 'react';
import renderer, {act} from 'react-test-renderer';
import {Provider} from 'react-redux';
import {configureStore} from '@reduxjs/toolkit';
import cartReducer, {addToCart} from '../../src/store/slices/cartSlice';
import transactionReducer from '../../src/store/slices/transactionSlice';
import productsReducer from '../../src/store/slices/productsSlice';
import CheckoutScreen from '../../src/screens/CheckoutScreen';

jest.mock('../../src/services/api', () => ({
  createTransaction: jest.fn().mockResolvedValue({
    id: 'tx-1',
    reference: 'ORDER-123',
    status: 'APPROVED',
    amountInCents: 10000000,
    currency: 'COP',
    customerEmail: 'test@test.com',
    paymentMethodType: 'CARD',
    items: [{productId: '1', productName: 'Test', quantity: 1, unitPrice: 10000000}],
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  }),
  refreshTransactionStatus: jest.fn().mockResolvedValue({
    id: 'tx-1',
    status: 'APPROVED',
  }),
}));

const mockProduct = {
  id: '1',
  name: 'Test Product',
  description: 'Desc',
  price: 10000000,
  currency: 'COP',
  image: 'https://example.com/img.jpg',
  stock: 10,
  category: 'Electronics',
};

const createTestStore = () => {
  const store = configureStore({
    reducer: {
      cart: cartReducer,
      transaction: transactionReducer,
      products: productsReducer,
    },
  });
  store.dispatch(addToCart(mockProduct as any));
  return store;
};

describe('CheckoutScreen', () => {
  const mockNavigation = {navigate: jest.fn(), goBack: jest.fn()};

  it('should render order summary', () => {
    const store = createTestStore();
    let tree: any;
    act(() => {
      tree = renderer.create(
        <Provider store={store}>
          <CheckoutScreen navigation={mockNavigation} />
        </Provider>,
      );
    });
    const json = JSON.stringify(tree.toJSON());
    expect(json).toContain('Resumen del pedido');
    expect(json).toContain('Test Product');
  });

  it('should show pay with card button', () => {
    const store = createTestStore();
    let tree: any;
    act(() => {
      tree = renderer.create(
        <Provider store={store}>
          <CheckoutScreen navigation={mockNavigation} />
        </Provider>,
      );
    });
    const json = JSON.stringify(tree.toJSON());
    expect(json).toContain('Pagar con tarjeta de crédito');
  });

  it('should show checkout header', () => {
    const store = createTestStore();
    let tree: any;
    act(() => {
      tree = renderer.create(
        <Provider store={store}>
          <CheckoutScreen navigation={mockNavigation} />
        </Provider>,
      );
    });
    const json = JSON.stringify(tree.toJSON());
    expect(json).toContain('Checkout');
  });

  it('should show back button', () => {
    const store = createTestStore();
    let tree: any;
    act(() => {
      tree = renderer.create(
        <Provider store={store}>
          <CheckoutScreen navigation={mockNavigation} />
        </Provider>,
      );
    });
    const json = JSON.stringify(tree.toJSON());
    expect(json).toContain('Volver');
  });

  it('should show total price', () => {
    const store = createTestStore();
    let tree: any;
    act(() => {
      tree = renderer.create(
        <Provider store={store}>
          <CheckoutScreen navigation={mockNavigation} />
        </Provider>,
      );
    });
    const json = JSON.stringify(tree.toJSON());
    expect(json).toContain('Total');
  });
});
