import { Test, TestingModule } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { HttpException } from '@nestjs/common';
import { of, throwError } from 'rxjs';
import { PaymentService } from './payment.service';

describe('PaymentService', () => {
  let service: PaymentService;
  let httpService: HttpService;

  const mockHttpService = {
    post: jest.fn(),
    get: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn((key: string, defaultValue: string) => defaultValue),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentService,
        { provide: HttpService, useValue: mockHttpService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<PaymentService>(PaymentService);
    httpService = module.get<HttpService>(HttpService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('tokenizeCard', () => {
    const cardDto = {
      number: '4242424242424242',
      cvc: '123',
      exp_month: '12',
      exp_year: '29',
      card_holder: 'Test User',
    };

    it('should tokenize a card successfully', async () => {
      const mockResponse = { data: { data: { id: 'tok_test_123' } } };
      mockHttpService.post.mockReturnValue(of(mockResponse));

      const result = await service.tokenizeCard(cardDto);
      expect(result).toEqual(mockResponse.data);
      expect(mockHttpService.post).toHaveBeenCalledWith(
        expect.stringContaining('/tokens/cards'),
        cardDto,
        expect.objectContaining({ headers: expect.any(Object) }),
      );
    });

    it('should throw HttpException when tokenization fails', async () => {
      mockHttpService.post.mockReturnValue(
        throwError(() => ({
          response: { data: 'Invalid card', status: 400 },
        })),
      );

      await expect(service.tokenizeCard(cardDto)).rejects.toThrow(
        HttpException,
      );
    });
  });

  describe('createTransaction', () => {
    const paymentDto = {
      amount_in_cents: 5000000,
      currency: 'COP',
      customer_email: 'test@test.com',
      payment_method: { type: 'CARD', token: 'tok_123', installments: 1 },
      reference: 'ORDER-123',
    };

    it('should create a transaction successfully', async () => {
      const mockResponse = {
        data: { data: { id: 'tx_123', status: 'APPROVED' } },
      };
      mockHttpService.post.mockReturnValue(of(mockResponse));

      const result = await service.createTransaction(paymentDto);
      expect(result).toEqual(mockResponse.data);
    });

    it('should throw HttpException when transaction creation fails', async () => {
      mockHttpService.post.mockReturnValue(
        throwError(() => ({
          response: { data: 'Payment failed', status: 422 },
        })),
      );

      await expect(service.createTransaction(paymentDto)).rejects.toThrow(
        HttpException,
      );
    });
  });

  describe('getTransaction', () => {
    it('should get a transaction by id', async () => {
      const mockResponse = {
        data: { data: { id: 'tx_123', status: 'APPROVED' } },
      };
      mockHttpService.get.mockReturnValue(of(mockResponse));

      const result = await service.getTransaction('tx_123');
      expect(result).toEqual(mockResponse.data);
    });

    it('should throw HttpException when get fails', async () => {
      mockHttpService.get.mockReturnValue(
        throwError(() => ({
          response: { data: 'Not found', status: 404 },
        })),
      );

      await expect(service.getTransaction('invalid')).rejects.toThrow(
        HttpException,
      );
    });
  });

  describe('getAcceptanceToken', () => {
    it('should return acceptance token', async () => {
      const mockResponse = {
        data: {
          data: {
            presigned_acceptance: { acceptance_token: 'accept_tok_123' },
          },
        },
      };
      mockHttpService.get.mockReturnValue(of(mockResponse));

      const result = await service.getAcceptanceToken();
      expect(result).toBe('accept_tok_123');
    });

    it('should throw HttpException when acceptance token fails', async () => {
      mockHttpService.get.mockReturnValue(
        throwError(() => ({
          response: { data: 'Error', status: 500 },
        })),
      );

      await expect(service.getAcceptanceToken()).rejects.toThrow(HttpException);
    });
  });

  describe('generateSignature', () => {
    it('should generate a SHA256 signature', () => {
      const signature = service.generateSignature('ORDER-123', 5000000, 'COP');
      expect(signature).toBeDefined();
      expect(signature).toHaveLength(64); // SHA256 hex = 64 chars
    });

    it('should generate different signatures for different inputs', () => {
      const sig1 = service.generateSignature('ORDER-1', 5000000, 'COP');
      const sig2 = service.generateSignature('ORDER-2', 5000000, 'COP');
      expect(sig1).not.toBe(sig2);
    });

    it('should generate consistent signatures for same inputs', () => {
      const sig1 = service.generateSignature('ORDER-1', 5000000, 'COP');
      const sig2 = service.generateSignature('ORDER-1', 5000000, 'COP');
      expect(sig1).toBe(sig2);
    });
  });
});
