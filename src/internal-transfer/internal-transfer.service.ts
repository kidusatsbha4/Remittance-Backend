import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import axios from 'axios';
import { AccountInfoDto } from './dto/account-info.dto';
import { InternalTransferDto } from './dto/internal-transfer.dto';
import { IpsAccountVerificationDto } from './dto/ips-account-verification.dto';
import { IpsPushPaymentDto } from './dto/ips-push-payment.dto';
import * as https from 'https';

interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

// ✅ ADD AT TOP
export interface TransferResponse {
  status: string;
  data?: any;
  message?: string;
}
const httpsAgent = new https.Agent({
  rejectUnauthorized: false,
});

@Injectable()
export class InternalTransferService {

  private accountInfoUrl =
    'http://10.57.40.118:8080/InternalAccountInfo/rest/internal';

  private transferUrl =
    'http://10.57.40.118:8080/InternalFundTransfer/rest/internalFundTransfer';

  // 🔴 IPS URLs
  private tokenUrl =
    'https://wso2apim.wegagentraining.com:9443/oauth2/token';

  private accountVerificationUrl =
    'https://wso2apim.wegagentraining.com:8243/api/ips/1.0.0/accountVerification';

  private pushPaymentUrl =
    'https://wso2apim.wegagentraining.com:8243/api/ips/1.0.0/pushPayment';

  // 🔴 credentials
  private clientId = 'mHuruOPOka2kb23tXk_OYtL1KNUa';
  private clientSecret = 'A0z8vl9OW6vwsgVdiE80iAnJFeYa';

  // 🔴 NEW: Rate API URL
private rateUrl =
  'https://wso2apim.wegagentraining.com:8243/api/common/1.0.0/rate';

// 🔴 API KEY
private rateApiKey =
  'eyJ4NXQiOiJPRGd6WXpVM09Ea3dZems1TWpKa00yWTVNelJpTm1Zek1qRTVObVF4WkdVd05UZGpOelppWkE9PSIsImtpZCI6IndzbzJjYXJib24iLCJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiJhZG1pbkBjYXJib24uc3VwZXIiLCJhcHBsaWNhdGlvbiI6eyJvd25lciI6ImFkbWluIiwidGllclF1b3RhVHlwZSI6bnVsbCwidGllciI6IlVubGltaXRlZCIsIm5hbWUiOiJNYXJrZXRfaHViIiwiaWQiOjgsInV1aWQiOiIwNjQ1YjA2ZS0xNjM4LTQ4MDAtYmQ3ZS1mYzUxZjIzYmQ0YzkifSwiaXNzIjoiaHR0cHM6XC9cL3dzbzJhcGltLndlZ2FnZW50cmFpbmluZy5jb206OTQ0M1wvb2F1dGgyXC90b2tlbiIsInRpZXJJbmZvIjp7IlVubGltaXRlZCI6eyJ0aWVyUXVvdGFUeXBlIjoicmVxdWVzdENvdW50IiwiZ3JhcGhRTE1heENvbXBsZXhpdHkiOjAsImdyYXBoUUxNYXhEZXB0aCI6MCwic3RvcE9uUXVvdGFSZWFjaCI6dHJ1ZSwic3Bpa2VBcnJlc3RMaW1pdCI6MCwic3Bpa2VBcnJlc3RVbml0IjpudWxsfX0sImtleXR5cGUiOiJQUk9EVUNUSU9OIiwicGVybWl0dGVkUmVmZXJlciI6IiIsInN1YnNjcmliZWRBUElzIjpbeyJzdWJzY3JpYmVyVGVuYW50RG9tYWluIjoiY2FyYm9uLnN1cGVyIiwibmFtZSI6IlZpZXdSYXRlIiwiY29udGV4dCI6IlwvYXBpXC9jb21tb25cLzEuMC4wIiwicHVibGlzaGVyIjoiYWRtaW4iLCJ2ZXJzaW9uIjoiMS4wLjAiLCJzdWJzY3JpcHRpb25UaWVyIjoiVW5saW1pdGVkIn1dLCJ0b2tlbl90eXBlIjoiYXBpS2V5IiwicGVybWl0dGVkSVAiOiIiLCJpYXQiOjE3NDAwNTc1MTMsImp0aSI6IjNhZjVlZDU5LTIwNWQtNDk2Mi1iNmJhLTY4MWU1MjYxZWNjMiJ9.P3glaNsbBQ87ZNmxl1I32E0V59oIk-VGLkESirVbfAef8-lcLMXAcRqk__vgdv1CHAPdz3k4PARyfR9ooYdn-fg1GLfPJ8LUWeh8y8vyDD6nyIsZ4IR2uZbOfX9G9NOLx59mJ66G-CRtGC-p4rHvN9utNz7wh6RTd182vmTXSRzE1mBhP2V82wYkm4wnsZxRIYrKdCB6hCiOS24zTV3BhFzOzVcur2gwMSv0ba2N2ac-rIYczn36DEstwhaynTh-mTUbMrPkH56O4Zsb4l3Pk-mLFnDkzFk7qlL66ltYSRwsc31CO_n_gcER2MCOYXHvPANgMaBK1ZFzGeam2DriFA==';

  // =========================================
  // 1. ACCOUNT INFO
  // =========================================
  async getAccountInfo(dto: AccountInfoDto) {
    try {
      const response = await axios.post(
        this.accountInfoUrl,
        { account_number: dto.account_number },
        {
          timeout: 10000,
          headers: { 'Content-Type': 'application/json' },
        },
      );

      return response.data;
    } catch (error: any) {
      throw new HttpException(
        error.response?.data || 'Failed to fetch account info',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  // =========================================
  // 2. INTERNAL TRANSFER
  // =========================================
  // ✅ UPDATED
async transfer(dto: InternalTransferDto): Promise<TransferResponse> {
    try {
      console.log("dto",dto)
      const response = await axios.post<TransferResponse>(
        this.transferUrl,
        dto,
        {
          timeout: 15000,
          headers: { 'Content-Type': 'application/json' },
        },
      );
   console.log("response",response.data)
      return response.data;
    } catch (error: any) {
      throw new HttpException(
        error.response?.data || 'Transfer failed',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  // =========================================
  // 3. GET TOKEN (FIXED)
  // =========================================
  async getAccessToken(): Promise<string> {
    try {
      const config: any = {
        httpsAgent,
        auth: {
          username: this.clientId,
          password: this.clientSecret,
        },
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      };

      const response = await axios.post<TokenResponse>(
        this.tokenUrl,
        new URLSearchParams({
          grant_type: 'client_credentials',
        }),
        config,
      );

      console.log('================ TOKEN RESPONSE ================');
      console.log('STATUS:', response.status);
      console.log('DATA:', response.data);
      console.log('===============================================');

      return response.data.access_token;

    } catch (error: any) {
      console.log('TOKEN ERROR:', error.response?.data || error.message);

      throw new HttpException(
        error.response?.data?.error_description ||
        error.message ||
        'Failed to get access token',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // =========================================
  // 4. ACCOUNT VERIFICATION (FIXED)
  // =========================================
  async verifyAccount(dto: IpsAccountVerificationDto) {
    try {
      const token = await this.getAccessToken();

      console.log('DTO:', dto);

      const config: any = {
        httpsAgent,
        timeout: 15000,
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          Accept: '*',
        },
      };
console.log("dto.account",dto.account)
      const response = await axios.post(
        this.accountVerificationUrl,
        {
          account: dto.account,
          destinBank: dto.destinBank,
        },
        config,
      );

      console.log('VERIFY RESPONSE:', response.data);

      return response.data;

    } catch (error: any) {
      console.log('VERIFY ERROR:', error.response?.data || error.message);

      throw new HttpException(
        error.response?.data || error.message,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  // =========================================
  // 5. PUSH PAYMENT (FIXED)
  // =========================================
  async pushPayment(dto: IpsPushPaymentDto) {
    try {
      const token = await this.getAccessToken();

      const config: any = {
        httpsAgent,
        timeout: 20000,
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      };

      const response = await axios.post(
        this.pushPaymentUrl,
        dto,
        config,
      );

      console.log('PUSH RESPONSE:', response.data);

      return response.data;

    } catch (error: any) {
      console.log('PUSH ERROR:', error.response?.data || error.message);

      throw new HttpException(
        error.response?.data || error.message,
        HttpStatus.BAD_REQUEST,
      );
    }
  }
// =========================================
// 6. VIEW RATE (NEW)
// =========================================
async getRate() {
  try {
    const config: any = {
      httpsAgent,
      timeout: 10000,
      headers: {
        apikey: this.rateApiKey,
        Accept: 'application/json',
      },
    };

    const response = await axios.get(this.rateUrl, config);

    console.log('RATE RESPONSE:', response.data);

    return response.data;

  } catch (error: any) {
    console.log('RATE ERROR:', error.response?.data || error.message);

    throw new HttpException(
      error.response?.data || 'Failed to fetch rate',
      HttpStatus.BAD_REQUEST,
    );
  }
}
  
}