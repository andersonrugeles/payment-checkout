import cartReducer, {
  addToCart,
  removeFromCart,
  updateQuantity,
  clearCart,
  selectCartItems,
  selectCartTotal,
  selectCartCount,
} from '../../src/store/slices/cartSlice';
import {Product} from '../../src/types';

const mockProduct: Product = {
  id: '1',
  name: 'Test Product',
  description: 'A test product',
  price: 10000000,
  currency: 'COP',
  image: 'https://example.com/image.jpg',
  stock: 10,
  category: 'Electronics',
};

const mockProduct2: Product = {
  id: '2',
  name: 'Test Product 2',
  description: 'Another test product',
  price: 5000000,
  currency: 'COP',
  image: 'https://example.com/image2.jpg',
  stock: 5,
  category: 'Accessories',
};

describe('cartSlice', () => {
  const initialState = {items: []};

  describe('addToCart', () => {
    it('should add a new product to cart', () => {
      const state = cartReducer(initialState, addToCart(mockProduct));
      expect(state.items).toHaveLength(1);
      expect(state.items[0].product.id).toBe('1');
      expect(state.items[0].quantity).toBe(1);
    });

    it('should increment quantity for existing product', () => {
      const stateWithItem = {items: [{product: mockProduct, quantity: 1}]};
      const state = cartReducer(stateWithItem, addToCart(mockProduct));
      expect(state.items).toHaveLength(1);
      expect(state.items[0].quantity).toBe(2);
    });

    it('should not exceed stock limit', () => {
      const stateWithItem = {items: [{product: mockProduct, quantity: 10}]};
      const state = cartReducer(stateWithItem, addToCart(mockProduct));
      expect(state.items[0].quantity).toBe(10);
    });
  });

  describe('removeFromCart', () => {
    it('should remove product from cart', () => {
      const stateWithItem = {items: [{product: mockProduct, quantity: 2}]};
      const state = cartReducer(stateWithItem, removeFromCart('1'));
      expect(state.items).toHaveLength(0);
    });

    it('should not modify state if product not found', () => {
      const stateWithItem = {items: [{product: mockProduct, quantity: 1}]};
      const state = cartReducer(stateWithItem, removeFromCart('999'));
      expect(state.items).toHaveLength(1);
    });
  });

  describe('updateQuantity', () => {
    it('should update quantity', () => {
      const stateWithItem = {items: [{product: mockProduct, quantity: 1}]};
      const state = cartReducer(
        stateWithItem,
        updateQuantity({productId: '1', quantity: 5}),
      );
      expect(state.items[0].quantity).toBe(5);
    });

    it('should remove item when quantity is 0', () => {
      const stateWithItem = {items: [{product: mockProduct, quantity: 1}]};
      const state = cartReducer(
        stateWithItem,
        updateQuantity({productId: '1', quantity: 0}),
      );
      expect(state.items).toHaveLength(0);
    });

    it('should not exceed stock', () => {
      const stateWithItem = {items: [{product: mockProduct, quantity: 1}]};
      const state = cartReducer(
        stateWithItem,
        updateQuantity({productId: '1', quantity: 99}),
      );
      expect(state.items[0].quantity).toBe(1);
    });

    it('should do nothing for non-existent product', () => {
      const stateWithItem = {items: [{product: mockProduct, quantity: 1}]};
      const state = cartReducer(
        stateWithItem,
        updateQuantity({productId: '999', quantity: 5}),
      );
      expect(state.items[0].quantity).toBe(1);
    });
  });

  describe('clearCart', () => {
    it('should clear all items', () => {
      const stateWithItems = {
        items: [
          {product: mockProduct, quantity: 2},
          {product: mockProduct2, quantity: 1},
        ],
      };
      const state = cartReducer(stateWithItems, clearCart());
      expect(state.items).toHaveLength(0);
    });
  });

  describe('selectors', () => {
    const stateWithItems = {
      cart: {
        items: [
          {product: mockProduct, quantity: 2},
          {product: mockProduct2, quantity: 3},
        ],
      },
    };

    it('selectCartItems returns items', () => {
      expect(selectCartItems(stateWithItems)).toHaveLength(2);
    });

    it('selectCartTotal calculates total', () => {
      expect(selectCartTotal(stateWithItems)).toBe(35000000);
    });

    it('selectCartCount returns total count', () => {
      expect(selectCartCount(stateWithItems)).toBe(5);
    });
  });
});
