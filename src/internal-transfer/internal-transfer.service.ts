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
    'https://internalgateway-uat.wegagenbanksc.com.et/fcubsaccservice_api/1.0.0/query_cust_acc_rest';

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
  // async getAccountInfo(dto: AccountInfoDto) {
  //   try {
  //     const response = await axios.post(
  //       this.accountInfoUrl,
  //       { account_number: dto.account_number },
  //       {
  //         timeout: 10000,
  //         headers: { 'Content-Type': 'application/json' },
  //       },
  //     );

  //     return response.data;
  //   } catch (error: any) {
  //     throw new HttpException(
  //       error.response?.data || 'Failed to fetch account info',
  //       HttpStatus.BAD_REQUEST,
  //     );
  //   }
  // }

  
// async getAccountInfo(dto: AccountInfoDto) {
//  const response = await axios({
//   method: 'post',
//   url: this.accountInfoUrl,
//   data: {
//     QueryCustAcc_REQ: {
//       CUST_AC_NO: dto.account_number,
//     },
//   },
//   headers: {
//     'Content-Type': 'application/json',
//   },

//   // bypass TS
//   ...( { httpsAgent: httpsAgent } as any ),
// });

//   return response.data;
// }
 async getAccountInfo(dto: AccountInfoDto) {
    console.log('🔍 AUTH GUARD TEMPORARILY DISABLED FOR TESTING');
    console.log('Calling service.getAccountInfo()...');
    
    try {
      const response = await axios({
        method: 'post',
        url: this.accountInfoUrl,
        data: {
          QueryCustAcc_REQ: {
            CUST_AC_NO: dto.account_number,
          },
        },
        headers: {
          'Content-Type': 'application/json',
        },
        // bypass TS
        ...( { httpsAgent: httpsAgent } as any ),
      });

      console.log('Service call completed successfully');
      const rawData = response.data;
      
      // Extract mobile-friendly account info
      const mobileResponse = this.formatAccountInfoForMobile(rawData);
      
      console.log('Controller returning account info:', JSON.stringify(mobileResponse, null, 2));
      return mobileResponse;
      
    } catch (error: any) {
      console.error('Account info fetch failed:', error);
      throw new HttpException(
        error.response?.data || 'Failed to fetch account information',
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
// =========================================
  // HELPER: FORMAT ACCOUNT INFO FOR MOBILE
  // =========================================
  private formatAccountInfoForMobile(fcubsResponse: any) {
    try {
      console.log('🔄 Transforming FCUBS response for mobile...');
      
      const fcubsData = fcubsResponse?.QUERYCUSTACC_IOFS_RES;
      
      if (!fcubsData || fcubsData.FCUBS_HEADER?.MSGSTAT !== 'SUCCESS') {
        console.log('❌ FCUBS call failed or returned error');
        return {
          success: false,
          error: 'Account not found',
          message: 'Unable to retrieve account information',
        };
      }

      const custAccFull = fcubsData.FCUBS_BODY?.['Cust-Account-Full'];
      const amountDates = custAccFull?.['Amount-Dates'];
      
      if (!custAccFull) {
        console.log('❌ Missing Cust-Account-Full data');
        return {
          success: false,
          error: 'Invalid account data',
          message: 'Account information is incomplete',
        };
      }

      console.log('✅ Extracting account details...');
      
      // Extract and transform account information
      const accountInfo = {
        accountNumber: custAccFull.ACC || '',
        accountHolderName: custAccFull.CUSTNAME || custAccFull.ADESC || 'Unknown',
        customerNumber: custAccFull.CUSTNO || '',
        branchCode: custAccFull.BRN || '',
        currency: custAccFull.CCY || 'ETB',
        accountType: custAccFull.ACCLS || '',
        accountTypeDescription: custAccFull.ACCLSTYP || '',
        accountStatus: custAccFull.ACCSTAT || '',
        accountStatusDescription: this.getStatusDescription(custAccFull.ACCSTAT),
        alternateAccount: custAccFull.ALTACC || null,
        openDate: custAccFull.ACCOPENDT || null,
        frozen: custAccFull.FROZEN === 'Y',
        
        // Address information
        address: {
          line1: custAccFull.ADDRESS_1 || null,
          line2: custAccFull.ADDRESS_2 || null,
          line3: custAccFull.ADDRESS_3 || null,
          line4: custAccFull.ADDRESS_4 ? custAccFull.ADDRESS_4.toString() : null,
        },
        
        // Balance information
        balance: {
          current: this.parseAmount(amountDates?.ACY_CURR_BALANCE),
          available: this.parseAmount(amountDates?.ACY_AVL_BAL),
          currency: custAccFull.CCY || 'ETB',
          blocked: this.parseAmount(amountDates?.ACY_BLOCKED_AMOUNT),
          lastCreditDate: amountDates?.DATE_LAST_CR || null,
          lastDebitDate: amountDates?.DATE_LAST_DR || null,
          formatted: {
            current: this.formatAmount(this.parseAmount(amountDates?.ACY_CURR_BALANCE), custAccFull.CCY),
            available: this.formatAmount(this.parseAmount(amountDates?.ACY_AVL_BAL), custAccFull.CCY),
          },
        },
        
        // Account features
        features: {
          atmEnabled: custAccFull.ATM === 'Y',
          passbookEnabled: custAccFull.PASSBOOK === 'Y',
          chequebookEnabled: custAccFull.CHQBOOK === 'Y',
          directBankingEnabled: custAccFull.DIRECT_BANKING === 'Y',
        },
        
        // Account restrictions
        restrictions: {
          noDebit: custAccFull.ACSTATNODR === 'Y',
          noCredit: custAccFull.ACSTATNOCR === 'Y',
          noStopPayment: custAccFull.ACSTATSTPAY === 'Y',
        },
        
        // Transfer capabilities (mobile app needs this)
        canSendMoney: this.canAccountSendMoney(custAccFull),
        canReceiveMoney: this.canAccountReceiveMoney(custAccFull),
      };

      console.log('✅ Mobile format created successfully');
      console.log(`📱 Account: ${accountInfo.accountNumber} - ${accountInfo.accountHolderName}`);
      console.log(`💰 Available Balance: ${accountInfo.balance.formatted.available}`);
      
      return {
        success: true,
        account: accountInfo,
        message: 'Account information retrieved successfully',
      };

    } catch (error) {
      console.error('❌ Error transforming account data:', error);
      return {
        success: false,
        error: 'Data transformation failed',
        message: 'Unable to process account information',
      };
    }
  }

  // Helper methods for account transformation
  private getStatusDescription(status: string): string {
    const statusMap: { [key: string]: string } = {
      'NORM': 'Normal',
      'DORM': 'Dormant',
      'CLOS': 'Closed',
      'FREZ': 'Frozen',
    };
    return statusMap[status] || status || 'Unknown';
  }

  private parseAmount(value: any): number {
    if (value === null || value === undefined) return 0;
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
      const parsed = parseFloat(value);
      return isNaN(parsed) ? 0 : parsed;
    }
    return 0;
  }

  private formatAmount(amount: number, currency: string): string {
    try {
      return new Intl.NumberFormat('en-ET', {
        style: 'currency',
        currency: currency || 'ETB',
        minimumFractionDigits: 2,
      }).format(amount);
    } catch (error) {
      // Fallback if currency formatting fails
      return `${amount.toFixed(2)} ${currency || 'ETB'}`;
    }
  }

  private canAccountSendMoney(account: any): boolean {
    return account.ACCSTAT === 'NORM' && 
           account.FROZEN !== 'Y' && 
           account.ACSTATNODR !== 'Y';
  }

  private canAccountReceiveMoney(account: any): boolean {
    return account.ACCSTAT === 'NORM' && 
           account.FROZEN !== 'Y' && 
           account.ACSTATNOCR !== 'Y';
  }
  
}