import { IsString, IsNotEmpty, Length, Matches } from 'class-validator';

export class TokenizeCardDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{13,19}$/, { message: 'Card number must be 13-19 digits' })
  number: string;

  @IsString()
  @IsNotEmpty()
  @Length(3, 4)
  cvc: string;

  @IsString()
  @IsNotEmpty()
  @Length(2, 2)
  exp_month: string;

  @IsString()
  @IsNotEmpty()
  @Length(2, 2)
  exp_year: string;

  @IsString()
  @IsNotEmpty()
  card_holder: string;
}
