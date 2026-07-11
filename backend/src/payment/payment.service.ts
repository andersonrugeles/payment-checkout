import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { createHash } from 'crypto';
import { firstValueFrom } from 'rxjs';
import { TokenizeCardDto } from './dto/tokenize-card.dto';
import { CreatePaymentDto } from './dto/create-payment.dto';

@Injectable()
export class PaymentService {
  private readonly baseUrl: string;
  private readonly publicKey: string;
  private readonly privateKey: string;
  private readonly integrityKey: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.baseUrl = this.configService.get<string>(
      'PAYMENT_API_URL',
      'https://api-sandbox.co.uat.wompi.dev/v1',
    );
    this.publicKey = this.configService.get<string>(
      'PAYMENT_PUBLIC_KEY',
      'pub_stagtest_g2u0HQd3ZMh05hsSgTS2lUV8t3s4mOt7',
    );
    this.privateKey = this.configService.get<string>(
      'PAYMENT_PRIVATE_KEY',
      'prv_stagtest_5i0ZGIGiFcDQifYsXxvsny7Y37tKqFWg',
    );
    this.integrityKey = this.configService.get<string>(
      'PAYMENT_INTEGRITY_KEY',
      'stagtest_integrity_nAIBuqayW70XpUqJS4qf4STYiISd89Fp',
    );
  }

  generateSignature(reference: string, amountInCents: number, currency: string): string {
    const data = `${reference}${amountInCents}${currency}${this.integrityKey}`;
    return createHash('sha256').update(data).digest('hex');
  }

  async tokenizeCard(dto: TokenizeCardDto): Promise<any> {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.baseUrl}/tokens/cards`, dto, {
          headers: {
            Authorization: `Bearer ${this.publicKey}`,
            'Content-Type': 'application/json',
          },
        }),
      );
      return response.data;
    } catch (error) {
      throw new HttpException(
        error.response?.data || 'Failed to tokenize card',
        error.response?.status || HttpStatus.BAD_REQUEST,
      );
    }
  }

  async createTransaction(dto: CreatePaymentDto): Promise<any> {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.baseUrl}/transactions`, dto, {
          headers: {
            Authorization: `Bearer ${this.privateKey}`,
            'Content-Type': 'application/json',
          },
        }),
      );
      return response.data;
    } catch (error) {
      throw new HttpException(
        error.response?.data || 'Failed to create transaction',
        error.response?.status || HttpStatus.BAD_REQUEST,
      );
    }
  }

  async getTransaction(transactionId: string): Promise<any> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/transactions/${transactionId}`, {
          headers: {
            Authorization: `Bearer ${this.privateKey}`,
          },
        }),
      );
      return response.data;
    } catch (error) {
      throw new HttpException(
        error.response?.data || 'Failed to get transaction',
        error.response?.status || HttpStatus.BAD_REQUEST,
      );
    }
  }

  async getAcceptanceToken(): Promise<string> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(
          `${this.baseUrl}/merchants/${this.publicKey}`,
        ),
      );
      return response.data?.data?.presigned_acceptance?.acceptance_token;
    } catch (error) {
      throw new HttpException(
        'Failed to get acceptance token',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
