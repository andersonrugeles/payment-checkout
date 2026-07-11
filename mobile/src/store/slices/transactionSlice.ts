import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import {Transaction} from '../../types';
import {
  createTransaction,
  refreshTransactionStatus,
  CreateTransactionRequest,
} from '../../services/api';
import {
  saveTransactionSecurely,
  clearSecureTransaction,
} from '../../utils/secureStorage';

interface TransactionState {
  current: Transaction | null;
  loading: boolean;
  error: string | null;
}

const initialState: TransactionState = {
  current: null,
  loading: false,
  error: null,
};

export const processPayment = createAsyncThunk(
  'transaction/processPayment',
  async (request: CreateTransactionRequest, {rejectWithValue}) => {
    try {
      const transaction = await createTransaction(request);
      // Store transaction data securely (encrypted)
      await saveTransactionSecurely(transaction);
      return transaction;
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        error.message ||
        'Payment processing failed';
      return rejectWithValue(message);
    }
  },
);

export const refreshStatus = createAsyncThunk(
  'transaction/refreshStatus',
  async (transactionId: string, {rejectWithValue}) => {
    try {
      const transaction = await refreshTransactionStatus(transactionId);
      return transaction;
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        error.message ||
        'Failed to refresh status';
      return rejectWithValue(message);
    }
  },
);

const transactionSlice = createSlice({
  name: 'transaction',
  initialState,
  reducers: {
    resetTransaction: state => {
      state.current = null;
      state.loading = false;
      state.error = null;
      clearSecureTransaction();
    },
  },
  extraReducers: builder => {
    builder
      .addCase(processPayment.pending, state => {
        state.loading = true;
        state.error = null;
        state.current = null;
      })
      .addCase(processPayment.fulfilled, (state, action) => {
        state.loading = false;
        state.current = action.payload;
      })
      .addCase(processPayment.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || 'Payment failed';
      })
      .addCase(refreshStatus.fulfilled, (state, action) => {
        state.current = action.payload;
      });
  },
});

export const {resetTransaction} = transactionSlice.actions;
export default transactionSlice.reducer;
