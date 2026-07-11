import { Test, TestingModule } from '@nestjs/testing';
import { TransactionsController } from './transactions.controller';
import { TransactionsService } from './transactions.service';
import { TransactionStatus } from './entities/transaction.entity';

describe('TransactionsController', () => {
  let controller: TransactionsController;

  const mockTransaction = {
    id: 'tx-1',
    reference: 'ORDER-123',
    status: TransactionStatus.APPROVED,
    amountInCents: 25000000,
    currency: 'COP',
    customerEmail: 'test@test.com',
    paymentMethodType: 'CARD',
    items: [
      { productId: '1', productName: 'Test', quantity: 1, unitPrice: 25000000 },
    ],
    externalTransactionId: 'ext_123',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockTransactionsService = {
    create: jest.fn().mockResolvedValue(mockTransaction),
    findAll: jest.fn().mockReturnValue([mockTransaction]),
    findOne: jest.fn().mockReturnValue(mockTransaction),
    refreshStatus: jest.fn().mockResolvedValue(mockTransaction),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TransactionsController],
      providers: [
        { provide: TransactionsService, useValue: mockTransactionsService },
      ],
    }).compile();

    controller = module.get<TransactionsController>(TransactionsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a transaction', async () => {
      const dto = {
        customerEmail: 'test@test.com',
        items: [{ productId: '1', quantity: 1 }],
        cardData: {
          number: '4242424242424242',
          cvc: '123',
          exp_month: '12',
          exp_year: '29',
          card_holder: 'Test',
        },
        installments: 1,
      };

      const result = await controller.create(dto);
      expect(result).toEqual(mockTransaction);
      expect(mockTransactionsService.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('findAll', () => {
    it('should return all transactions', () => {
      const result = controller.findAll();
      expect(result).toEqual([mockTransaction]);
    });
  });

  describe('findOne', () => {
    it('should return a transaction by id', () => {
      const result = controller.findOne('tx-1');
      expect(result).toEqual(mockTransaction);
      expect(mockTransactionsService.findOne).toHaveBeenCalledWith('tx-1');
    });
  });

  describe('refreshStatus', () => {
    it('should refresh transaction status', async () => {
      const result = await controller.refreshStatus('tx-1');
      expect(result).toEqual(mockTransaction);
      expect(mockTransactionsService.refreshStatus).toHaveBeenCalledWith('tx-1');
    });
  });
});
