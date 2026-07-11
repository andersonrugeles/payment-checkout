import React from 'react';
import renderer, {act} from 'react-test-renderer';
import {Provider} from 'react-redux';
import {configureStore} from '@reduxjs/toolkit';
import cartReducer, {addToCart} from '../../src/store/slices/cartSlice';
import CartScreen from '../../src/screens/CartScreen';

const mockProduct = {
  id: '1',
  name: 'Test Product',
  description: 'Desc',
  price: 10000000,
  currency: 'COP',
  image: 'https://example.com/image.jpg',
  stock: 10,
  category: 'Electronics',
};

const createTestStore = (withItems = false) => {
  const store = configureStore({reducer: {cart: cartReducer}});
  if (withItems) {
    store.dispatch(addToCart(mockProduct as any));
  }
  return store;
};

describe('CartScreen', () => {
  const mockNavigation = {navigate: jest.fn(), goBack: jest.fn()};

  it('should show empty cart message when no items', () => {
    const store = createTestStore();
    let tree: any;
    act(() => {
      tree = renderer.create(
        <Provider store={store}>
          <CartScreen navigation={mockNavigation} />
        </Provider>,
      );
    });
    const json = JSON.stringify(tree.toJSON());
    expect(json).toContain('Tu carrito está vacío');
  });

  it('should show product when items in cart', () => {
    const store = createTestStore(true);
    let tree: any;
    act(() => {
      tree = renderer.create(
        <Provider store={store}>
          <CartScreen navigation={mockNavigation} />
        </Provider>,
      );
    });
    const json = JSON.stringify(tree.toJSON());
    expect(json).toContain('Test Product');
  });

  it('should show checkout button with items', () => {
    const store = createTestStore(true);
    let tree: any;
    act(() => {
      tree = renderer.create(
        <Provider store={store}>
          <CartScreen navigation={mockNavigation} />
        </Provider>,
      );
    });
    const json = JSON.stringify(tree.toJSON());
    expect(json).toContain('Pagar con tarjeta de crédito');
  });

  it('should show quantity controls', () => {
    const store = createTestStore(true);
    let tree: any;
    act(() => {
      tree = renderer.create(
        <Provider store={store}>
          <CartScreen navigation={mockNavigation} />
        </Provider>,
      );
    });
    const json = JSON.stringify(tree.toJSON());
    expect(json).toContain('1'); // quantity
  });
});
