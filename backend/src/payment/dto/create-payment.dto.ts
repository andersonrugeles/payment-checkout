import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsEmail,
  ValidateNested,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';

export class PaymentMethodDto {
  @IsString()
  @IsNotEmpty()
  type: string;

  @IsString()
  @IsNotEmpty()
  token: string;

  @IsNumber()
  @IsPositive()
  installments: number;
}

export class CreatePaymentDto {
  @IsNumber()
  @IsPositive()
  amount_in_cents: number;

  @IsString()
  @IsNotEmpty()
  currency: string;

  @IsEmail()
  customer_email: string;

  @ValidateNested()
  @Type(() => PaymentMethodDto)
  payment_method: PaymentMethodDto;

  @IsString()
  @IsNotEmpty()
  reference: string;

  @IsString()
  @IsOptional()
  acceptance_token?: string;

  @IsString()
  @IsOptional()
  signature?: string;
}
