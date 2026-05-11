import { Injectable } from '@nestjs/common';
import * as cybersourceRestApi from 'cybersource-rest-client';
import { ConfigService } from '@nestjs/config';
// ✅ UPDATED
import { InternalTransferService } from '../internal-transfer/internal-transfer.service';
import { TransactionsService } from '../transactions/transactions.service';
import { InternalTransferDto } from '../internal-transfer/dto/internal-transfer.dto';
import { ManualService } from '../manuals/manual.service';
import { CreateManualDto } from '../manuals/dto/create-manual.dto';


const transfer ="manual"

const fromAccount = '0083920830101';
const fromAccountHolder = 'MELAT TESFAYE BIREMJI';

const toAccount = '0079416530101';
const toAccountHolder = 'KIDIST FISSHA DAMTEA';

const currency = 'ETB';
const toCurrency = 'ETB';

const amount = '1';
const remark = 'tr';
  const eCurrency = "USD";
  const bonus ="50";

@Injectable()
export class PaymentsService {
  private configObj;
 private configObjP;


  constructor(private configService: ConfigService,
               private internalTransferService: InternalTransferService,
               private transactionsService: TransactionsService,
               private manualService: ManualService,

  ) {
    this.configObj = {
      authenticationType: 'HTTP_SIGNATURE',
      merchantID: this.configService.get('MERCHANT_ID'),
      merchantKeyId: this.configService.get('REST_KEY_ID'),
      merchantsecretKey: this.configService.get('REST_SHARED_SECRET'),
      runEnvironment: 'apitest.cybersource.com',
      logConfiguration: {
        enableLog: false,
        logFilename: 'cybs',
        logDirectory: 'log',
        loggingLevel: 'debug',
        enableMasking: true
    },
    };
    this.configObjP = {
      authenticationType: 'HTTP_SIGNATURE',
      merchantID: this.configService.get('MERCHANT_ID'),
      merchantKeyId: this.configService.get('REST_KEY_ID'),
      merchantsecretKey: this.configService.get('REST_SHARED_SECRET'),
      runEnvironment: 'apitest.cybersource.com',
      logConfiguration: {
        enableLog: false
    },
    };
  }

  // 🔹 Generate Capture Context
  async generateCaptureContext() {
    console.log("tesfay")
    return new Promise((resolve, reject) => {
      const apiClient = new cybersourceRestApi.ApiClient();
      const instance = new cybersourceRestApi.MicroformIntegrationApi(
        this.configObj,
        apiClient,
      );

      const request = new cybersourceRestApi.GenerateCaptureContextRequest();

      request.clientVersion = 'v2';
      request.allowedPaymentTypes = ['CARD'];
      request.allowedCardNetworks = ['VISA', 'MASTERCARD', 'AMEX'];
      request.targetOrigins = ['http://localhost:3000'];

      instance.generateCaptureContext(request, (error, data) => {
        if (error) {
          console.log("error",error)
          reject(error.response ? error.response.text : error.message);

        } else {
          resolve(data);
        }
      });
    });
  }

  // 🔹 Process Payment
  // async processPayment(body: any) {
  //   return new Promise((resolve, reject) => {
  //   //   const { transientToken, amount, currency } = body;
  //    const { 
  //     transientToken, 
  //     amount, 
  //     currency,
  //     // New: BillTo fields from frontend
  //     firstName,
  //     lastName,
  //     address1,
  //     locality,
  //     administrativeArea,
  //     postalCode,
  //     country,
  //     email ,

  //     toAccount,
  //     exchange_rate,
  //     name,
  //     remark,

  //   } = body;

  //     const apiClient = new cybersourceRestApi.ApiClient();
  //     const paymentsInstance = new cybersourceRestApi.PaymentsApi(
  //       this.configObjP,
  //       apiClient,
  //     );

  //     const request = new cybersourceRestApi.CreatePaymentRequest();

  //     request.clientReferenceInformation = {
  //       code: 'ORDER_' + Date.now(),
  //     };

  //     request.tokenInformation = {
  //       transientTokenJwt: transientToken,
  //     };

  //      request.processingInformation = {
  //     capture: true, // Auto-capture enabled
  //     commerceIndicator: "internet",
  //     "authorizationOptions": {
  //           "aftIndicator": "true",
            
  //       }
  //   };

  //     request.orderInformation = {
  //       amountDetails: {
  //         totalAmount: amount || '5000.00',
  //         currency: currency || 'USD',
  //       },
  //       // billTo: {
  //       //   firstName: 'John',
  //       //   lastName: 'Doe',
  //       //   address1: '1 Market St',
  //       //   locality: 'San Francisco',
  //       //   administrativeArea: 'CA',
  //       //   postalCode: '94105',
  //       //   country: 'US',
  //       //   email: 'test@cybs.com',
  //       // },
  //       billTo: {
  //       firstName: firstName || "Guest",
  //       lastName: lastName || "Customer",
  //       address1: address1 || "Main St",
  //       locality: locality || "Addis Ababa",
  //       administrativeArea: administrativeArea || "AA",
  //       postalCode: postalCode || "1000",
  //       country: country || "ET",
  //       email: email || "customer@example.com",
  //     },
  //     };

  //     paymentsInstance.createPayment(request, (error, data) => {
  //       if (error) {
  //         const err = error.response
  //           ? JSON.parse(error.response.text)
  //           : error;
  //         reject(err);
  //       } else {
  //         resolve(data);
  //       }
  //     });
  //   });
  // }

  // ✅ UPDATED FULL FLOW
async processPayment(body: any, user: any) {
  return new Promise((resolve, reject) => {
    const {
      transientToken,
      firstName,
      lastName,
      address1,
      locality,
      administrativeArea,
      postalCode,
      country,
      email,
// toAccountHolder,
//        toAccount,
//       amount,
//        currency,
//        remark,
      exchange_rate,
    } = body;

    const apiClient = new cybersourceRestApi.ApiClient();
    const paymentsInstance = new cybersourceRestApi.PaymentsApi(
      this.configObjP,
      apiClient,
    );

    const request = new cybersourceRestApi.CreatePaymentRequest();

    request.clientReferenceInformation = {
      code: 'ORDER_' + Date.now(),
    };

    request.tokenInformation = {
      transientTokenJwt: transientToken,
    };

    request.processingInformation = {
      capture: true,
      commerceIndicator: 'internet',
      authorizationOptions: {
        aftIndicator: 'true',
      },
    };

    request.orderInformation = {
      amountDetails: {
        totalAmount: amount || '5000.00',
        currency: currency || 'USD',
      },
      billTo: {
        firstName: firstName || 'Guest',
        lastName: lastName || 'Customer',
        address1: address1 || 'Main St',
        locality: locality || 'Addis Ababa',
        administrativeArea: administrativeArea || 'AA',
        postalCode: postalCode || '1000',
        country: country || 'ET',
        email: email || 'customer@example.com',
      },
    };

    // 🔥 CALL CYBERSOURCE
    paymentsInstance.createPayment(request, async (error, data) => {
      if (error) {
        const err = error.response
          ? JSON.parse(error.response.text)
          : error;

        return reject({
          status: 'failed',
          message: err?.message || 'Payment failed',
        });
      }

      try {
        // 🔥 CHECK PAYMENT STATUS
        if (data.status !== 'AUTHORIZED') {
          return reject({
            status: 'failed',
            message: 'Card not authorized',
            cybersource: data,
          });
        }

        if (transfer==='manual'){
 const manual=await this.manualService.create(
          {
            toAccount,
            toAccountHolder,
            amount,
            currency: 'ETB',
            toCurrency,
            eCurrency,
            remark,
            bonus,
            exchange_rate: exchange_rate || null,
            channel: 'card',
            external_ref: data.id, // ✅ from CyberSource
            
          },
          user,
        );
resolve(manual);
        }
         console.log("data",data)
        // =========================================
        // 🔥 PREPARE INTERNAL TRANSFER DTO
        // =========================================
       const transferDto: InternalTransferDto = {
  fromAccount,
  fromAccountHolder,
  toAccount,
  toAccountHolder,
  currency,
  toCurrency,
  amount,
  remark,
  
};

console.log("transferDto",transferDto)
        // 🔥 CALL INTERNAL TRANSFER
        const transferResponse =
          await this.internalTransferService.transfer(transferDto);

        // =========================================
        // 🔥 CHECK TRANSFER RESPONSE
        // =========================================
        console.log("transferResponse",transferResponse)
        console.log("transferResponse.data.status",transferResponse.status)
        if (!transferResponse.status) {

          const manual=await this.manualService.create(
          {
            toAccount,
            toAccountHolder,
            amount,
            currency: 'ETB',
            toCurrency,
            eCurrency,
            remark,
            bonus,
            exchange_rate: exchange_rate || null,
            channel: 'card',
            external_ref: data.id, // ✅ from CyberSource
            
          },
          user,
        );
resolve(manual);

  return reject({
    status: 'failed',
    message: transferResponse?.data?.statusDesc || 'Transfer failed from CBS',
  });
}
// resolve(transferResponse);

        const txData = transferResponse.data;

        // =========================================
        // 🔥 SAVE TRANSACTION
        // =========================================
        const transaction=await this.transactionsService.create(
          {
            beneficiary_acc: toAccount,
            amount,
            currency: 'ETB',
            exchange_rate: exchange_rate || null,
            status: 'PAID', // ✅ UPDATED
            channel: 'card',
            external_ref: data.id, // ✅ from CyberSource
            failure_reason: null,
            completed_at: new Date(),
          },
          user,
        );

//         return resolve({
  
//     transferResponse,
//     transaction,
  
// });
resolve(transferResponse);

        // =========================================
        // 🔥 FINAL RESPONSE TO FRONTEND
        // =========================================
console.log("response",transaction)
      } catch (err: any) {
        return reject({
          status: 'failed',
          message: err.message || 'Processing failed',
        });
      }
    });
  });
}
}