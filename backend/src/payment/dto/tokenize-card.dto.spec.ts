import 'reflect-metadata';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { TokenizeCardDto } from './tokenize-card.dto';

describe('TokenizeCardDto', () => {
  it('should validate a correct DTO', async () => {
    const dto = plainToInstance(TokenizeCardDto, {
      number: '4242424242424242',
      cvc: '123',
      exp_month: '12',
      exp_year: '29',
      card_holder: 'Test User',
    });
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should fail with invalid card number (letters)', async () => {
    const dto = plainToInstance(TokenizeCardDto, {
      number: 'abcdefghijklmnop',
      cvc: '123',
      exp_month: '12',
      exp_year: '29',
      card_holder: 'Test',
    });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('should fail with short cvc', async () => {
    const dto = plainToInstance(TokenizeCardDto, {
      number: '4242424242424242',
      cvc: '12',
      exp_month: '12',
      exp_year: '29',
      card_holder: 'Test',
    });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('should fail with empty card_holder', async () => {
    const dto = plainToInstance(TokenizeCardDto, {
      number: '4242424242424242',
      cvc: '123',
      exp_month: '12',
      exp_year: '29',
      card_holder: '',
    });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('should fail with exp_month more than 2 chars', async () => {
    const dto = plainToInstance(TokenizeCardDto, {
      number: '4242424242424242',
      cvc: '123',
      exp_month: '123',
      exp_year: '29',
      card_holder: 'Test',
    });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });
});
