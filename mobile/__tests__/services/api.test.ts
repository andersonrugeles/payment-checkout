import axios from 'axios';
import {
  fetchProducts,
  fetchProduct,
  createTransaction,
  getTransaction,
  refreshTransactionStatus,
} from '../../src/services/api';

jest.mock('axios', () => {
  const mockAxios: any = {
    create: jest.fn((): any => mockAxios),
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    defaults: {headers: {common: {}}},
    interceptors: {
      request: {use: jest.fn()},
      response: {use: jest.fn()},
    },
  };
  return mockAxios;
});

const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('API Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('fetchProducts', () => {
    it('should fetch all products', async () => {
      const products = [{id: '1', name: 'Test'}];
      (mockedAxios.get as jest.Mock).mockResolvedValue({data: products});

      const result = await fetchProducts();
      expect(result).toEqual(products);
      expect(mockedAxios.get).toHaveBeenCalledWith('/products');
    });
  });

  describe('fetchProduct', () => {
    it('should fetch a single product', async () => {
      const product = {id: '1', name: 'Test'};
      (mockedAxios.get as jest.Mock).mockResolvedValue({data: product});

      const result = await fetchProduct('1');
      expect(result).toEqual(product);
      expect(mockedAxios.get).toHaveBeenCalledWith('/products/1');
    });
  });

  describe('createTransaction', () => {
    it('should create a transaction', async () => {
      const transaction = {id: 'tx-1', status: 'PENDING'};
      const request = {
        customerEmail: 'test@test.com',
        items: [{productId: '1', quantity: 1}],
        cardData: {
          number: '4242424242424242',
          cvc: '123',
          exp_month: '12',
          exp_year: '29',
          card_holder: 'Test',
        },
        installments: 1,
      };
      (mockedAxios.post as jest.Mock).mockResolvedValue({data: transaction});

      const result = await createTransaction(request);
      expect(result).toEqual(transaction);
      expect(mockedAxios.post).toHaveBeenCalledWith('/transactions', request);
    });
  });

  describe('getTransaction', () => {
    it('should get a transaction by id', async () => {
      const transaction = {id: 'tx-1', status: 'APPROVED'};
      (mockedAxios.get as jest.Mock).mockResolvedValue({data: transaction});

      const result = await getTransaction('tx-1');
      expect(result).toEqual(transaction);
      expect(mockedAxios.get).toHaveBeenCalledWith('/transactions/tx-1');
    });
  });

  describe('refreshTransactionStatus', () => {
    it('should refresh transaction status', async () => {
      const transaction = {id: 'tx-1', status: 'APPROVED'};
      (mockedAxios.patch as jest.Mock).mockResolvedValue({data: transaction});

      const result = await refreshTransactionStatus('tx-1');
      expect(result).toEqual(transaction);
      expect(mockedAxios.patch).toHaveBeenCalledWith(
        '/transactions/tx-1/refresh',
      );
    });
  });
});
