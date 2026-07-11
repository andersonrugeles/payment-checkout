import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { ProductsService } from '../products/products.service';
import { PaymentService } from '../payment/payment.service';
import { TransactionStatus } from './entities/transaction.entity';

describe('TransactionsService', () => {
  let service: TransactionsService;
  let productsService: ProductsService;
  let paymentService: PaymentService;

  const mockPaymentService = {
    tokenizeCard: jest.fn(),
    createTransaction: jest.fn(),
    getTransaction: jest.fn(),
    getAcceptanceToken: jest.fn(),
    generateSignature: jest.fn().mockReturnValue('mock_signature_hash'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionsService,
        ProductsService,
        { provide: PaymentService, useValue: mockPaymentService },
      ],
    }).compile();

    service = module.get<TransactionsService>(TransactionsService);
    productsService = module.get<ProductsService>(ProductsService);
    paymentService = module.get<PaymentService>(
      PaymentService,
    ) as unknown as PaymentService;
    jest.clearAllMocks();
  });

  const validDto = {
    customerEmail: 'test@test.com',
    items: [{ productId: '1', quantity: 1 }],
    cardData: {
      number: '4242424242424242',
      cvc: '123',
      exp_month: '12',
      exp_year: '29',
      card_holder: 'Test User',
    },
    installments: 1,
  };

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a transaction with APPROVED status on success', async () => {
      mockPaymentService.tokenizeCard.mockResolvedValue({
        data: { id: 'tok_123' },
      });
      mockPaymentService.getAcceptanceToken.mockResolvedValue('accept_tok');
      mockPaymentService.createTransaction.mockResolvedValue({
        data: { id: 'tx_ext_123', status: 'APPROVED' },
      });

      const result = await service.create(validDto);
      expect(result.status).toBe(TransactionStatus.APPROVED);
      expect(result.amountInCents).toBeGreaterThan(0);
      expect(result.customerEmail).toBe('test@test.com');
      expect(result.externalTransactionId).toBe('tx_ext_123');
    });

    it('should create a transaction with DECLINED status', async () => {
      mockPaymentService.tokenizeCard.mockResolvedValue({
        data: { id: 'tok_123' },
      });
      mockPaymentService.getAcceptanceToken.mockResolvedValue('accept_tok');
      mockPaymentService.createTransaction.mockResolvedValue({
        data: { id: 'tx_ext_456', status: 'DECLINED' },
      });

      const result = await service.create(validDto);
      expect(result.status).toBe(TransactionStatus.DECLINED);
    });

    it('should create a transaction with PENDING status', async () => {
      mockPaymentService.tokenizeCard.mockResolvedValue({
        data: { id: 'tok_123' },
      });
      mockPaymentService.getAcceptanceToken.mockResolvedValue('accept_tok');
      mockPaymentService.createTransaction.mockResolvedValue({
        data: { id: 'tx_ext_789', status: 'PENDING' },
      });

      const result = await service.create(validDto);
      expect(result.status).toBe(TransactionStatus.PENDING);
    });

    it('should set ERROR status for unknown payment status', async () => {
      mockPaymentService.tokenizeCard.mockResolvedValue({
        data: { id: 'tok_123' },
      });
      mockPaymentService.getAcceptanceToken.mockResolvedValue('accept_tok');
      mockPaymentService.createTransaction.mockResolvedValue({
        data: { id: 'tx_ext_000', status: 'UNKNOWN' },
      });

      const result = await service.create(validDto);
      expect(result.status).toBe(TransactionStatus.ERROR);
    });

    it('should throw if product does not exist', async () => {
      const dto = { ...validDto, items: [{ productId: '999', quantity: 1 }] };
      await expect(service.create(dto)).rejects.toThrow();
    });

    it('should throw if insufficient stock', async () => {
      const dto = { ...validDto, items: [{ productId: '1', quantity: 9999 }] };
      await expect(service.create(dto)).rejects.toThrow(BadRequestException);
    });

    it('should throw if tokenization fails', async () => {
      mockPaymentService.tokenizeCard.mockRejectedValue(
        new Error('Token error'),
      );

      await expect(service.create(validDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw if token id is missing', async () => {
      mockPaymentService.tokenizeCard.mockResolvedValue({ data: {} });

      await expect(service.create(validDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw if acceptance token fails', async () => {
      mockPaymentService.tokenizeCard.mockResolvedValue({
        data: { id: 'tok_123' },
      });
      mockPaymentService.getAcceptanceToken.mockRejectedValue(
        new Error('Acceptance error'),
      );

      await expect(service.create(validDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw if payment creation fails', async () => {
      mockPaymentService.tokenizeCard.mockResolvedValue({
        data: { id: 'tok_123' },
      });
      mockPaymentService.getAcceptanceToken.mockResolvedValue('accept_tok');
      mockPaymentService.createTransaction.mockRejectedValue(
        new Error('Payment error'),
      );

      await expect(service.create(validDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should decrease stock on APPROVED transaction', async () => {
      const product = productsService.findOne('1');
      const initialStock = product.stock;

      mockPaymentService.tokenizeCard.mockResolvedValue({
        data: { id: 'tok_123' },
      });
      mockPaymentService.getAcceptanceToken.mockResolvedValue('accept_tok');
      mockPaymentService.createTransaction.mockResolvedValue({
        data: { id: 'tx_ext_stock', status: 'APPROVED' },
      });

      await service.create(validDto);
      const updatedProduct = productsService.findOne('1');
      expect(updatedProduct.stock).toBe(initialStock - 1);
    });
  });

  describe('findAll', () => {
    it('should return empty array initially', () => {
      expect(service.findAll()).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should throw for non-existent transaction', () => {
      expect(() => service.findOne('non-existent')).toThrow(
        BadRequestException,
      );
    });
  });

  describe('refreshStatus', () => {
    it('should update status from PENDING to APPROVED', async () => {
      mockPaymentService.tokenizeCard.mockResolvedValue({
        data: { id: 'tok_123' },
      });
      mockPaymentService.getAcceptanceToken.mockResolvedValue('accept_tok');
      mockPaymentService.createTransaction.mockResolvedValue({
        data: { id: 'tx_ext_refresh', status: 'PENDING' },
      });

      const tx = await service.create(validDto);
      expect(tx.status).toBe(TransactionStatus.PENDING);

      mockPaymentService.getTransaction.mockResolvedValue({
        data: { status: 'APPROVED' },
      });

      const refreshed = await service.refreshStatus(tx.id);
      expect(refreshed.status).toBe(TransactionStatus.APPROVED);
    });

    it('should update status to DECLINED on refresh', async () => {
      mockPaymentService.tokenizeCard.mockResolvedValue({
        data: { id: 'tok_123' },
      });
      mockPaymentService.getAcceptanceToken.mockResolvedValue('accept_tok');
      mockPaymentService.createTransaction.mockResolvedValue({
        data: { id: 'tx_ext_decline', status: 'PENDING' },
      });

      const tx = await service.create(validDto);

      mockPaymentService.getTransaction.mockResolvedValue({
        data: { status: 'DECLINED' },
      });

      const refreshed = await service.refreshStatus(tx.id);
      expect(refreshed.status).toBe(TransactionStatus.DECLINED);
    });

    it('should keep current status if refresh fails', async () => {
      mockPaymentService.tokenizeCard.mockResolvedValue({
        data: { id: 'tok_123' },
      });
      mockPaymentService.getAcceptanceToken.mockResolvedValue('accept_tok');
      mockPaymentService.createTransaction.mockResolvedValue({
        data: { id: 'tx_ext_fail', status: 'PENDING' },
      });

      const tx = await service.create(validDto);

      mockPaymentService.getTransaction.mockRejectedValue(
        new Error('Network error'),
      );

      const refreshed = await service.refreshStatus(tx.id);
      expect(refreshed.status).toBe(TransactionStatus.PENDING);
    });

    it('should return transaction as-is if no external id', async () => {
      mockPaymentService.tokenizeCard.mockResolvedValue({
        data: { id: 'tok_123' },
      });
      mockPaymentService.getAcceptanceToken.mockResolvedValue('accept_tok');
      mockPaymentService.createTransaction.mockResolvedValue({
        data: { status: 'APPROVED' },
      });

      const tx = await service.create(validDto);
      // externalTransactionId is undefined since data.id is undefined
      const refreshed = await service.refreshStatus(tx.id);
      expect(refreshed).toBeDefined();
    });
  });
});
