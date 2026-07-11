import React from 'react';
import renderer, {act} from 'react-test-renderer';
import {Provider} from 'react-redux';
import {configureStore} from '@reduxjs/toolkit';
import productsReducer, {loadProducts} from '../../src/store/slices/productsSlice';
import cartReducer from '../../src/store/slices/cartSlice';
import transactionReducer from '../../src/store/slices/transactionSlice';
import HomeScreen from '../../src/screens/HomeScreen';

jest.mock('../../src/services/api', () => ({
  fetchProducts: jest.fn().mockResolvedValue([
    {
      id: '1',
      name: 'Test Product',
      description: 'A test product',
      price: 10000000,
      currency: 'COP',
      image: 'https://example.com/image.jpg',
      stock: 10,
      category: 'Electronics',
    },
  ]),
}));

const createTestStore = () =>
  configureStore({
    reducer: {
      products: productsReducer,
      cart: cartReducer,
      transaction: transactionReducer,
    },
  });

describe('HomeScreen', () => {
  const mockNavigation = {navigate: jest.fn()};

  it('should render without crashing', async () => {
    const store = createTestStore();
    let tree: any;
    await act(async () => {
      tree = renderer.create(
        <Provider store={store}>
          <HomeScreen navigation={mockNavigation} />
        </Provider>,
      );
    });
    expect(tree.toJSON()).toBeTruthy();
  });

  it('should show loading text initially', () => {
    const store = createTestStore();
    let tree: any;
    act(() => {
      tree = renderer.create(
        <Provider store={store}>
          <HomeScreen navigation={mockNavigation} />
        </Provider>,
      );
    });
    const json = JSON.stringify(tree.toJSON());
    expect(json).toContain('Cargando productos...');
  });

  it('should show products after loading', async () => {
    const store = createTestStore();
    let tree: any;
    await act(async () => {
      tree = renderer.create(
        <Provider store={store}>
          <HomeScreen navigation={mockNavigation} />
        </Provider>,
      );
    });
    const json = JSON.stringify(tree.toJSON());
    expect(json).toContain('Test Product');
  });

  it('should show store title', async () => {
    const store = createTestStore();
    let tree: any;
    await act(async () => {
      tree = renderer.create(
        <Provider store={store}>
          <HomeScreen navigation={mockNavigation} />
        </Provider>,
      );
    });
    const json = JSON.stringify(tree.toJSON());
    expect(json).toContain('Tienda');
  });
});
