import 'reflect-metadata';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import {
  CreateTransactionDto,
  TransactionItemDto,
  CardDataDto,
} from './create-transaction.dto';

describe('CreateTransactionDto', () => {
  it('should validate a correct DTO', async () => {
    const dto = plainToInstance(CreateTransactionDto, {
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
    });

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should fail with invalid email', async () => {
    const dto = plainToInstance(CreateTransactionDto, {
      customerEmail: 'not-an-email',
      items: [{ productId: '1', quantity: 1 }],
      cardData: {
        number: '4242424242424242',
        cvc: '123',
        exp_month: '12',
        exp_year: '29',
        card_holder: 'Test',
      },
      installments: 1,
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('should fail with empty items', async () => {
    const dto = plainToInstance(CreateTransactionDto, {
      customerEmail: 'test@test.com',
      items: [],
      cardData: {
        number: '4242424242424242',
        cvc: '123',
        exp_month: '12',
        exp_year: '29',
        card_holder: 'Test',
      },
      installments: 1,
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });
});

describe('TransactionItemDto', () => {
  it('should validate a correct item', async () => {
    const dto = plainToInstance(TransactionItemDto, {
      productId: '1',
      quantity: 2,
    });
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should fail with negative quantity', async () => {
    const dto = plainToInstance(TransactionItemDto, {
      productId: '1',
      quantity: -1,
    });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });
});

describe('CardDataDto', () => {
  it('should validate correct card data', async () => {
    const dto = plainToInstance(CardDataDto, {
      number: '4242424242424242',
      cvc: '123',
      exp_month: '12',
      exp_year: '29',
      card_holder: 'Test User',
    });
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should fail with empty card number', async () => {
    const dto = plainToInstance(CardDataDto, {
      number: '',
      cvc: '123',
      exp_month: '12',
      exp_year: '29',
      card_holder: 'Test',
    });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });
});
