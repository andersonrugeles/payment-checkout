import transactionReducer, {
  processPayment,
  refreshStatus,
  resetTransaction,
} from '../../src/store/slices/transactionSlice';
import {TransactionStatus} from '../../src/types';

const mockTransaction = {
  id: 'tx-1',
  reference: 'ORDER-123',
  status: TransactionStatus.APPROVED,
  amountInCents: 25000000,
  currency: 'COP',
  customerEmail: 'test@test.com',
  paymentMethodType: 'CARD',
  items: [{productId: '1', productName: 'Test', quantity: 1, unitPrice: 25000000}],
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

describe('transactionSlice', () => {
  const initialState = {current: null, loading: false, error: null};

  it('should have initial state', () => {
    const state = transactionReducer(undefined, {type: 'unknown'});
    expect(state.current).toBeNull();
    expect(state.loading).toBe(false);
    expect(state.error).toBeNull();
  });

  describe('processPayment', () => {
    it('should set loading on pending', () => {
      const state = transactionReducer(
        initialState,
        processPayment.pending('reqId', {} as any),
      );
      expect(state.loading).toBe(true);
      expect(state.error).toBeNull();
      expect(state.current).toBeNull();
    });

    it('should set current on fulfilled', () => {
      const state = transactionReducer(
        initialState,
        processPayment.fulfilled(mockTransaction as any, 'reqId', {} as any),
      );
      expect(state.loading).toBe(false);
      expect(state.current).toEqual(mockTransaction);
    });

    it('should set error on rejected', () => {
      const state = transactionReducer(
        initialState,
        processPayment.rejected(null, 'reqId', {} as any, 'Payment failed'),
      );
      expect(state.loading).toBe(false);
      expect(state.error).toBe('Payment failed');
    });

    it('should handle rejected without payload', () => {
      const state = transactionReducer(
        initialState,
        processPayment.rejected(null, 'reqId', {} as any),
      );
      expect(state.error).toBe('Payment failed');
    });
  });

  describe('refreshStatus', () => {
    it('should update current on fulfilled', () => {
      const pendingTx = {...mockTransaction, status: TransactionStatus.PENDING};
      const stateWithPending = {...initialState, current: pendingTx as any};
      const state = transactionReducer(
        stateWithPending,
        refreshStatus.fulfilled(mockTransaction as any, 'reqId', 'tx-1'),
      );
      expect(state.current?.status).toBe(TransactionStatus.APPROVED);
    });
  });

  describe('resetTransaction', () => {
    it('should reset state to initial', () => {
      const stateWithData = {
        current: mockTransaction as any,
        loading: false,
        error: 'some error',
      };
      const state = transactionReducer(stateWithData, resetTransaction());
      expect(state.current).toBeNull();
      expect(state.loading).toBe(false);
      expect(state.error).toBeNull();
    });
  });
});
