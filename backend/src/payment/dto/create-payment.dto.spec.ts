import 'reflect-metadata';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { CreatePaymentDto, PaymentMethodDto } from './create-payment.dto';

describe('CreatePaymentDto', () => {
  it('should validate a correct DTO', async () => {
    const dto = plainToInstance(CreatePaymentDto, {
      amount_in_cents: 5000000,
      currency: 'COP',
      customer_email: 'test@test.com',
      payment_method: { type: 'CARD', token: 'tok_123', installments: 1 },
      reference: 'ORDER-001',
    });
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should fail with negative amount', async () => {
    const dto = plainToInstance(CreatePaymentDto, {
      amount_in_cents: -100,
      currency: 'COP',
      customer_email: 'test@test.com',
      payment_method: { type: 'CARD', token: 'tok_123', installments: 1 },
      reference: 'ORDER-001',
    });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('should fail with invalid email', async () => {
    const dto = plainToInstance(CreatePaymentDto, {
      amount_in_cents: 5000000,
      currency: 'COP',
      customer_email: 'invalid',
      payment_method: { type: 'CARD', token: 'tok_123', installments: 1 },
      reference: 'ORDER-001',
    });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('should fail with empty reference', async () => {
    const dto = plainToInstance(CreatePaymentDto, {
      amount_in_cents: 5000000,
      currency: 'COP',
      customer_email: 'test@test.com',
      payment_method: { type: 'CARD', token: 'tok_123', installments: 1 },
      reference: '',
    });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });
});

describe('PaymentMethodDto', () => {
  it('should validate a correct payment method', async () => {
    const dto = plainToInstance(PaymentMethodDto, {
      type: 'CARD',
      token: 'tok_123',
      installments: 1,
    });
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should fail with empty type', async () => {
    const dto = plainToInstance(PaymentMethodDto, {
      type: '',
      token: 'tok_123',
      installments: 1,
    });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('should fail with negative installments', async () => {
    const dto = plainToInstance(PaymentMethodDto, {
      type: 'CARD',
      token: 'tok_123',
      installments: -1,
    });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });
});
