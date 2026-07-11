import productsReducer, {
  loadProducts,
} from '../../src/store/slices/productsSlice';

describe('productsSlice', () => {
  const initialState = {items: [], loading: false, error: null};

  it('should have initial state', () => {
    const state = productsReducer(undefined, {type: 'unknown'});
    expect(state.items).toEqual([]);
    expect(state.loading).toBe(false);
    expect(state.error).toBeNull();
  });

  it('should set loading on pending', () => {
    const state = productsReducer(initialState, loadProducts.pending('reqId'));
    expect(state.loading).toBe(true);
    expect(state.error).toBeNull();
  });

  it('should set items on fulfilled', () => {
    const mockProducts = [{id: '1', name: 'Product 1'}];
    const state = productsReducer(
      initialState,
      loadProducts.fulfilled(mockProducts as any, 'reqId'),
    );
    expect(state.loading).toBe(false);
    expect(state.items).toEqual(mockProducts);
  });

  it('should set error on rejected', () => {
    const state = productsReducer(
      initialState,
      loadProducts.rejected(new Error('Network error'), 'reqId'),
    );
    expect(state.loading).toBe(false);
    expect(state.error).toBe('Network error');
  });

  it('should clear error on new pending', () => {
    const stateWithError = {...initialState, error: 'Previous error'};
    const state = productsReducer(stateWithError, loadProducts.pending('reqId'));
    expect(state.error).toBeNull();
  });
});
