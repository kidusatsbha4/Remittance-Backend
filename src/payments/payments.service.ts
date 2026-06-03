import { Injectable, } from '@nestjs/common';
import * as cybersourceRestApi from 'cybersource-rest-client';
import { ConfigService } from '@nestjs/config';
// ✅ UPDATED
import { InternalTransferService } from '../internal-transfer/internal-transfer.service';
import { TransactionsService } from '../transactions/transactions.service';
import { InternalTransferDto } from '../internal-transfer/dto/internal-transfer.dto';
import { ManualService } from '../manuals/manual.service';
import { CreateManualDto } from '../manuals/dto/create-manual.dto';
import { TransferType, TransferTypeEnum } from '../transfer-type/entities/transfer-type.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import axios from 'axios';
import * as crypto from 'crypto';

// const transfer ="manual"

const fromAccount = '0083920830101';
const fromAccountHolder = 'MELAT TESFAYE BIREMJI';

const toAccount = '0079416530101';
const toAccountHolder = 'KIDIST FISSHA DAMTEA';

const currency = 'ETB';
const toCurrency = 'ETB';
const cCurrency = 'USD';

// const amount = '1';
const remark = 'man';
const eCurrency = "USD";
const bonus = "50";

@Injectable()
export class PaymentsService {
  private configObj;
  private configObjP;

  async getActiveTransferType(): Promise<TransferTypeEnum> {
    const type = await this.transferTypeRepo.findOne({
      where: { status: true },
    });

    if (!type) {
      throw new Error('No active transfer type found');
    }

    return type.transfer_type;
  }
  constructor(private configService: ConfigService,
    private internalTransferService: InternalTransferService,
    private transactionsService: TransactionsService,
    private manualService: ManualService,
    @InjectRepository(TransferType)
    private transferTypeRepo: Repository<TransferType>,

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
// ==============================
// ✅ NEW METHOD: Build Microform HTML
// ==============================

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
      request.targetOrigins = [  'http://localhost:3000','https://yippee-unmolded-porridge.ngrok-free.dev'];

      instance.generateCaptureContext(request, (error, data) => {
        if (error) {
          console.log("error", error)
          reject(error.response ? error.response.text : error.message);

        } else {
          console.log("data",data)
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

   // =============================================================
  // CLEAN NATIVE RISK SETUP (replaces manual Axios & Crypto)
  // =============================================================
  private async callRiskSetup(customerId: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const apiClient = new cybersourceRestApi.ApiClient();
      const riskInstance = new cybersourceRestApi.PayerAuthenticationApi(this.configObj, apiClient);

      const riskRequest = new cybersourceRestApi.PayerAuthSetupRequest();
      riskRequest.clientReferenceInformation = {
        code: 'TC2-' + Date.now(),
      };
      riskRequest.paymentInformation = {
        customer: {
          id: customerId,
        },
      };

      riskInstance.payerAuthSetup(riskRequest, (error, data) => {
        if (error) {
          const errDetails = error.response ? error.response.text : error.message;
          console.error('❌ Risk API Native SDK error:', errDetails);
          return reject(error);
        }
          console.log(JSON.stringify(data, null, 2));
        
        resolve(data);
      });
    });
  }
  // private async callRiskSetup(customerId: string) {
  //   const host = 'apitest.cybersource.com';
  //   const merchantId = this.configService.get('MERCHANT_ID');
  //   const keyId = this.configService.get('REST_KEY_ID');
  //   const secretKey = this.configService.get('REST_SHARED_SECRET');

  //   const resource = '/risk/v1/authentication-setups';
  //   const url = `https://${host}${resource}`;
  //   const method = 'post';
  //   const date = new Date().toUTCString();

  //   const payload = {
  //     clientReferenceInformation: {
  //       code: 'TC2-' + Date.now(),
  //     },
  //     paymentInformation: {
  //       customer: {
  //         id: customerId,
  //       },
  //     },
  //   };

  //   const body = JSON.stringify(payload);

  //   const digest = crypto
  //     .createHash('sha256')
  //     .update(body)
  //     .digest('base64');

  //   const digestHeader = `SHA-256=${digest}`;

  //   const signatureString =
  //     `host: ${host}\n` +
  //     `v-c-date: ${date}\n` +
  //     `request-target: ${method} ${resource}\n` +
  //     `digest: ${digestHeader}\n` +
  //     `v-c-merchant-id: ${merchantId}`;

  //   const signature = crypto
  //     .createHmac('sha256', Buffer.from(secretKey, 'base64'))
  //     .update(signatureString)
  //     .digest('base64');

  //   const signatureHeader =
  //     `keyid="${keyId}", algorithm="HmacSHA256", ` +
  //     `headers="host v-c-date request-target digest v-c-merchant-id", ` +
  //     `signature="${signature}"`;

  //   try {
  //     const res = await axios.post(url, body, {
  //       headers: {
  //         host,
  //         'v-c-date': date,
  //         digest: digestHeader,
  //         'v-c-merchant-id': merchantId,
  //         signature: signatureHeader,
  //         'content-type': 'application/json',
  //         accept: 'application/json',
  //       },
  //     });

  //     console.log('🔥 RISK RESPONSE:', res.data);
  //     return res.data;
  //   } catch (err: any) {
  //     console.log('❌ Risk API error:', err.response?.data || err.message);
  //     throw err;
  //   }
  // }
async checkEnrollment(body: any) {
  return new Promise(async (resolve, reject) => {
    try {
      const {
        referenceId,
      customer_id,
        amount,
        currency,

        billTo,
        browserInfo,

        isAft = false,
      } = body;
console.log("referenceId",referenceId)
console.log("referenceId",customer_id)
      const apiClient = new cybersourceRestApi.ApiClient();

      const payerAuthInstance =
        new cybersourceRestApi.PayerAuthenticationApi(
          this.configObj,
          apiClient,
        );

      const request =
        new cybersourceRestApi.CheckPayerAuthEnrollmentRequest();

      // ==============================
      // Client Reference
      // ==============================
      request.clientReferenceInformation = {
        code:'AUTH_' + Date.now(),
      };

      // ==============================
      // Card Information
      // ==============================
      request.paymentInformation = {
        customer: {
      id: customer_id,
      
    },
      };

      // ==============================
      // Order Information
      // ==============================
      request.orderInformation = {
        amountDetails: {
          totalAmount: String(amount),
          currency: currency || 'USD',
        },
        billTo: billTo,
      };

      // ==============================
      // Consumer Authentication
      // ==============================
      request.consumerAuthenticationInformation = {
        referenceId,
        returnUrl: this.configService.get('RETURN_URL'),

        challengeCode: '05',

        transactionMode: 'BROWSER',

        browserJavaEnabled:
          browserInfo?.javaEnabled || false,

        browserJavascriptEnabled: true,

        browserLanguage:
          browserInfo?.language || 'en-US',

        browserColorDepth: String(
          browserInfo?.colorDepth || 24,
        ),

        browserScreenHeight: String(
          browserInfo?.screenHeight || 900,
        ),

        browserScreenWidth: String(
          browserInfo?.screenWidth || 1440,
        ),

        browserTimeZone: String(
          browserInfo?.timeZone || 0,
        ),

        browserUserAgent:
          browserInfo?.userAgent || '',

        browserAcceptHeader:
          browserInfo?.acceptHeader || 'application/json',
      };

      // ==============================
      // Optional 3DS Requestor
      // ==============================
      const requestorId =
        this.configService.get('THREEDS_REQUESTOR_ID');

      const requestorName =
        this.configService.get('THREEDS_REQUESTOR_NAME');

      if (
        requestorId &&
        requestorId !== 'your_3ds_requestor_id'
      ) {
        request.consumerAuthenticationInformation.requestorId =
          requestorId;

        request.consumerAuthenticationInformation.requestorName =
          requestorName;
      }

      // ==============================
      // AFT
      // ==============================
      if (isAft) {
        request.processingInformation = {
          actionList: ['CONSUMER_AUTHENTICATION'],
          commerceIndicator: 'internet',
        };

        request.paymentInformation.card.aft = true;
      }

      console.log(
        '🔥 CHECK ENROLLMENT REQUEST:',
        JSON.stringify(request, null, 2),
      );

      payerAuthInstance.checkPayerAuthEnrollment(
        request,
        (error, data, response) => {
          if (error) {
            console.log(
              '❌ Enrollment Error:',
              error.response
                ? error.response.text
                : error,
            );

            return reject(
              error.response
                ? JSON.parse(error.response.text)
                : error,
            );
          }

          console.log(
            '✅ Enrollment Response:',
            JSON.stringify(data, null, 2),
          );

          resolve(data);
        },
      );
    } catch (err: any) {
      reject({
        status: 'failed',
        message:
          err.message || 'Check enrollment failed',
      });
    }
  });
}
async authenticationResults(body: any) {
  return new Promise((resolve, reject) => {
    const {
      customer_id,
      amount,
      currency = 'USD',
      authenticationTransactionId,
    } = body;

    console.log(
      'authenticationTransactionId:',
      authenticationTransactionId,
    );

    const apiClient = new cybersourceRestApi.ApiClient();

    const payerAuthInstance =
      new cybersourceRestApi.PayerAuthenticationApi(
        this.configObj,
        apiClient,
      );

    // Debug SDK methods
    console.log(
      'PayerAuth Methods:',
      Object.getOwnPropertyNames(
        Object.getPrototypeOf(payerAuthInstance),
      ),
    );

    // =================================
    // REQUEST OBJECT
    // =================================
    const request: any = {
      clientReferenceInformation: {
        code: 'AUTH_RESULT_' + Date.now(),
      },

      paymentInformation: {
        customer: {
          id: customer_id,
        },
      },

      orderInformation: {
        amountDetails: {
          totalAmount: String(amount),
          currency,
        },
      },

      consumerAuthenticationInformation: {
        authenticationTransactionId,
      },
    };

    console.log(
      'VALIDATE AUTH REQUEST:',
      JSON.stringify(request, null, 2),
    );

    // =================================
    // VALIDATE AUTHENTICATION RESULTS
    // =================================
    payerAuthInstance.validateAuthenticationResults(
      request,
      (error, data, response) => {
        if (error) {
          console.log(
            'VALIDATE AUTH ERROR:',
            error.response
              ? error.response.text
              : error,
          );

          return reject(
            error.response
              ? JSON.parse(error.response.text)
              : error,
          );
        }

        console.log(
          'VALIDATE AUTH RESPONSE:',
          JSON.stringify(data, null, 2),
        );

        resolve(data);
      },
    );
  });
}
  async processPayment(body: any, user: any) {
    return new Promise(async (resolve, reject) => {
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
        phoneNumber,
        // toAccountHolder,
        //        toAccount,
               amount,
        //        currency,
        //        remark,
        exchange_rate,
      } = body;

// const url = 'https://apitest.cybersource.com/pts/v2/payments';

//       const merchantId = this.configService.get('MERCHANT_ID');
//       const keyId = this.configService.get('REST_KEY_ID');
//       const secretKey = this.configService.get('REST_SHARED_SECRET');

//       const host = 'apitest.cybersource.com';
//       const resource = '/pts/v2/payments';
//       const date = new Date().toUTCString();

//       // -----------------------------
//       // 1. BUILD REQUEST BODY
//       // -----------------------------
//       const tokenPayload = {
//         processingInformation: {
//           capture: false,
//           actionList: ['TOKEN_CREATE'],
//           actionTokenTypes: [
//             'customer',
//             'paymentInstrument',
//             'instrumentIdentifier',
//           ],
//         },

//         tokenInformation: {
//           transientTokenJwt: transientToken,
//         },

//         clientReferenceInformation: {
//           code: 'TOKEN_' + Date.now(),
//         },

//         orderInformation: {
//           amountDetails: {
//             totalAmount: '0',
//             currency: 'USD',
//           },
//           billTo: {
//             firstName: firstName || 'John',
//             lastName: lastName || 'Doe',
//             address1: address1 || '1 Market St',
//             locality: locality || 'San Francisco',
//             administrativeArea: administrativeArea || 'CA',
//             postalCode: postalCode || '94105',
//             country: country || 'US',
//             email: email || 'test@cybs.com',
//             phoneNumber: phoneNumber || '4158880000',
//           },
//         },
//       };

//       // Ensure exact string verification
//       const rawBody = JSON.stringify(tokenPayload);

//       // -----------------------------
//       // 2. DIGEST
//       // -----------------------------
//       const digest = crypto
//         .createHash('sha256')
//         .update(rawBody, 'utf8')
//         .digest('base64');

//       const digestHeader = `SHA-256=${digest}`;

//       // -----------------------------
//       // 3. SIGNATURE STRING 
//       // -----------------------------
//       const signatureString =
//         `host: ${host}\n` +
//         `v-c-date: ${date}\n` +
//         `request-target: post ${resource}\n` +
//         `digest: ${digestHeader}\n` +
//         `v-c-merchant-id: ${merchantId}`;

//       // -----------------------------
//       // 4. SIGNATURE HEADER
//       // -----------------------------
//       const signature = crypto
//         .createHmac('sha256', Buffer.from(secretKey, 'base64'))
//         .update(signatureString, 'utf8')
//         .digest('base64');

//       const signatureHeader =
//         `keyid="${keyId}", ` +
//         `algorithm="HmacSHA256", ` +
//         `headers="host v-c-date request-target digest v-c-merchant-id", ` +
//         `signature="${signature}"`;

//       // -----------------------------
//       // 5. CALL CYBERSOURCE TOKEN GEN
//       // -----------------------------
//       let response;
//       try {
//         response = await axios({
//           method: 'post', // explicitly state lowercase for verification alignment
//           url: url,
//           data: rawBody,
//           headers: {
//             'host': host, // Keep lowercase key formatting for security signatures
//             'v-c-date': date,
//             'digest': digestHeader,
//             'v-c-merchant-id': merchantId,
//             'signature': signatureHeader,
//             'content-type': 'application/json',
//             'accept': 'application/json',
//           },
//         });
        
//         console.log('🔥 TOKEN RESPONSE:', response.data);
//       } catch (axiosErr: any) {
//         console.error('❌ Axios Token Generation failed:', axiosErr.response?.data || axiosErr.message);
//         return reject({
//           status: 'failed',
//           message: `Token generation step failed: ${axiosErr.message}`,
//           errorDetails: axiosErr.response?.data || null
//         });
//       }
// =============================================================
        // =============================================================
        // STEP 1: GENERATE TOKEN SAFELY USING CYBERSOURCE NATIVE SDK
        // =============================================================
        const tokenApiClient = new cybersourceRestApi.ApiClient();
        const paymentInstrumentInstance = new cybersourceRestApi.PaymentsApi(
          this.configObj,
          tokenApiClient,
        );

        const tokenRequest = new cybersourceRestApi.CreatePaymentRequest();
        tokenRequest.processingInformation = {
          capture: false,
           commerceIndicator: 'internet',
           actionList: ['TOKEN_CREATE'],
          actionTokenTypes: ['customer', 'paymentInstrument', 'instrumentIdentifier'],
        };
        tokenRequest.tokenInformation = {
          transientTokenJwt: transientToken,
        };
        tokenRequest.clientReferenceInformation = {
          code: 'TOKEN_' + Date.now(),
        };
        tokenRequest.orderInformation = {
          amountDetails: {
            totalAmount: '0.00',
            currency: 'USD',
          },
          billTo: {
            firstName: firstName || 'John',
            lastName: lastName || 'Doe',
            address1: address1 || '1 Market St',
            locality: locality || 'San Francisco',
            administrativeArea: administrativeArea || 'CA',
            postalCode: postalCode || '94105',
            country: country || 'US',
            email: email || 'test@cybs.com',
            phoneNumber: phoneNumber || '4158880000',
          },
        };

        let tokenData: any;
        let customerId: string;

try {
  tokenData = await new Promise((res, rej) => {
    paymentInstrumentInstance.createPayment(tokenRequest, (error, data) => {
      if (error) {
        return rej(
          error.response
            ? JSON.parse(error.response.text)
            : error,
        );
      }

      res(data);
    });
  });

  console.log(JSON.stringify(tokenData, null, 2));

   // ==============================
        // STEP 2: EXTRACT CUSTOMER ID
        // ==============================
        customerId = tokenData?.tokenInformation?.customer?.id;
   console.log("customerId",customerId)
        if (!customerId) {
          return reject({
            status: 'failed',
            message: 'Missing customer id from token response',
          });
        }

        // ==============================
        // STEP 3: RISK API CALL
        // ==============================

       const DDC = await this.callRiskSetup(customerId);
       console.log("DDC",JSON.stringify(DDC, null, 2))
      return resolve({
  customerId,
  DDC,
});

} catch (err: any) {
  console.log('TOKEN ERROR:', err);

  return reject({
    status: 'failed',
    message: err.message || 'Token generation failed',
    details: err,
  });
}
//       const apiClient = new cybersourceRestApi.ApiClient();
//       const paymentsInstance = new cybersourceRestApi.PaymentsApi(
//         this.configObjP,
//         apiClient,
//       );




//       const request = new cybersourceRestApi.CreatePaymentRequest();

//       request.clientReferenceInformation = {
//         code: 'ORDER_' + Date.now(),
//       };

//       request.tokenInformation = {
//         transientTokenJwt: transientToken,
//       };

//       request.processingInformation = {
//         capture: true,
//         commerceIndicator: 'internet',
//   //        actionList: ['IGNORE'],//pass decision
//   // actionTokenTypes: ['customer'],//pass decision

//         authorizationOptions: {
//           aftIndicator: 'true',
//         },
//       };

//       request.orderInformation = {
//         amountDetails: {
//           totalAmount: amount || '100.00',
//           currency: cCurrency || 'USD',
//         },
//         billTo: {
//           firstName: firstName || 'John',
//           lastName: firstName || 'Doe',
//           address1: address1 || '1 Market St',
//           locality: locality || 'San Francisco',
//           administrativeArea: administrativeArea || 'CA',
//           postalCode: postalCode || '94105',
//           country: country || 'US',
//           email: email || 'test@cyds.com',
//           phoneNumber:phoneNumber || '4158880000'
//         },
       
//       };
//  console.log("billTo",request.orderInformation.billTo)

//       // 🔥 CALL CYBERSOURCE
//       paymentsInstance.createPayment(request, async (error, data) => {
//         if (error) {
//           const err = error.response
//             ? JSON.parse(error.response.text)
//             : error;
// console.log("error",error)
//           return reject({
//             status: 'failed',
//             message: err?.message || 'Payment failed',
//           });
//         }
//         try {
//           // 🔥 CHECK PAYMENT STATUS
//           if (data.status !== 'AUTHORIZED') {
//             return reject({
//               status: 'failed',
//               message: 'Card not authorized',
//               cybersource: data,
//             });
//           }
//           const transferType = await this.getActiveTransferType();
//           if (transferType === TransferTypeEnum.MANUAL) {
//             const manual = await this.manualService.create(
//               {
//                 toAccount,
//                 toAccountHolder,
//                 amount,
//                 currency: 'ETB',
//                 toCurrency,
//                 eCurrency,
//                 remark,
//                 bonus,
//                 exchange_rate: exchange_rate || null,
//                 channel: 'card',
//                 external_ref: data.id, // ✅ from CyberSource

//               },
//               user,
//             );
//             resolve(manual);
//           }
// //console.log("data", data)
//           // =========================================
//           // 🔥 PREPARE INTERNAL TRANSFER DTO
//           // =========================================
//           const transferDto: InternalTransferDto = {
//             fromAccount,
//             fromAccountHolder,
//             toAccount,
//             toAccountHolder,
//             currency,
//             toCurrency,
//             amount,
//             remark,

//           };

//           //console.log("transferDto", transferDto)
//           // 🔥 CALL INTERNAL TRANSFER
//           const transferResponse =
//             await this.internalTransferService.transfer(transferDto);

//           // =========================================
//           // 🔥 CHECK TRANSFER RESPONSE
//           // =========================================
//          // console.log("transferResponse", transferResponse)
//           //console.log("transferResponse.data.status", transferResponse.status)
//           if (!transferResponse.status) {

//             const manual = await this.manualService.create(
//               {
//                 toAccount,
//                 toAccountHolder,
//                 amount,
//                 currency: 'ETB',
//                 toCurrency,
//                 eCurrency,
//                 remark,
//                 bonus,
//                 exchange_rate: exchange_rate || null,
//                 channel: 'card',
//                 external_ref: data.id, // ✅ from CyberSource

//               },
//               user,
//             );
//             resolve(manual);

//             return reject({
//               status: 'failed',
//               message: transferResponse?.data?.statusDesc || 'Transfer failed from CBS',
//             });
//           }
//           // resolve(transferResponse);

//           const txData = transferResponse.data;

//           // =========================================
//           // 🔥 SAVE TRANSACTION
//           // =========================================
//           const transaction = await this.transactionsService.create(
//             {
//               beneficiary_acc: toAccount,
//               amount,
//               currency: 'ETB',
//               exchange_rate: exchange_rate || null,
//               status: 'PAID', // ✅ UPDATED
//               channel: 'card',
//               external_ref: data.id, // ✅ from CyberSource
//               failure_reason: null,
//               completed_at: new Date(),
//             },
//             user,
//           );

//           //         return resolve({

//           //     transferResponse,
//           //     transaction,

//           // });
//           resolve(transferResponse);

//           // =========================================
//           // 🔥 FINAL RESPONSE TO FRONTEND
//           // =========================================
//           console.log("response", transaction)
//         } catch (err: any) {
//           return reject({
//             status: 'failed',
//             message: err.message || 'Processing failed',
//           });
//         }
//       });
    });
  }

  async pay(body: any, user: any) {
  return new Promise((resolve, reject) => {
    const {
      transientToken,
      payload,
      amount,
      customer_id,
      exchange_rate
    } = body;
console.log("customer_id............",customer_id)
    const apiClient = new cybersourceRestApi.ApiClient();

    const paymentsInstance =
      new cybersourceRestApi.PaymentsApi(
        this.configObjP,
        apiClient,
      );

    const request =
      new cybersourceRestApi.CreatePaymentRequest();

    // =================================================
    // CLIENT REFERENCE
    // =================================================
    request.clientReferenceInformation = {
      code: 'ORDER_' + Date.now(),
    };

    // =================================================
    // TOKEN
    // =================================================
    request.tokenInformation = {
      transientTokenJwt: transientToken,
    };

    // =================================================
    // BILLING
    // =================================================
    request.orderInformation = {
      amountDetails: {
        totalAmount: String(amount),
        currency: 'USD',
      },

      billTo: {
        firstName: 'John',
        lastName: 'Doe',
        address1: '1 Market St',
        locality: 'San Francisco',
        administrativeArea: 'CA',
        postalCode: '94105',
        country: 'US',
        email: 'test@cybs.com',
        phoneNumber: '4158880000',
      },
    };

    // =================================================
    // CUSTOMER
    // =================================================
    request.paymentInformation = {
      customer: {
        id: customer_id,
      },
    };

    // =================================================
    // PROCESS 3DS DATA
    // =================================================
    const authInfo =
      payload?.consumerAuthenticationInformation || {};

    // =================================================
    // DETECT CARD TYPE + SET 3DS DATA
    // =================================================
    let commerceIndicator = 'internet';

    request.consumerAuthenticationInformation = {
      authenticationTransactionId:
        authInfo.authenticationTransactionId,
    };

    // VISA FLOW
    if (authInfo.cavv) {
      request.consumerAuthenticationInformation = {
        cavv: authInfo.cavv,
        xid: authInfo.xid,
        eciRaw: authInfo.eciRaw,
        authenticationTransactionId:
          authInfo.authenticationTransactionId,
      };

      commerceIndicator = 'vbv';
    }

    // MASTERCARD FLOW
    else if (authInfo.ucafAuthenticationData) {
      request.consumerAuthenticationInformation = {
        ucafAuthenticationData:
          authInfo.ucafAuthenticationData,

        ucafCollectionIndicator:
          authInfo.ucafCollectionIndicator,

        eciRaw: authInfo.eciRaw,

        authenticationTransactionId:
          authInfo.authenticationTransactionId,
      };

      commerceIndicator = 'spa';
    }

    // =================================================
    // PROCESSING (DYNAMIC commerceIndicator)
    // =================================================
    request.processingInformation = {
      capture: true,
      commerceIndicator,
    };

    // =================================================
    // LOG REQUEST
    // =================================================
    console.log(
      '🔥 FINAL PAYMENT REQUEST:',
      JSON.stringify(request, null, 2),
    );

    // =================================================
    // CALL CYBERSOURCE
    // =================================================
    paymentsInstance.createPayment(
      request,
      async (error, data) => {
        if (error) {
          console.log(
            '❌ PAYMENT ERROR:',
            error.response
              ? error.response.text
              : error,
          );

          return reject(
            error.response
              ? JSON.parse(error.response.text)
              : error,
          );
        }
console.log("payment data",data)
        try {
          // 🔥 CHECK PAYMENT STATUS
          if (data.status !== 'AUTHORIZED') {
            return reject({
              status: 'failed',
              message: 'Card not authorized',
              cybersource: data,
            });
          }
          const transferType = await this.getActiveTransferType();
          if (transferType === TransferTypeEnum.MANUAL) {
            const manual = await this.manualService.create(
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
//console.log("data", data)
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

          //console.log("transferDto", transferDto)
          // 🔥 CALL INTERNAL TRANSFER
          const transferResponse =
            await this.internalTransferService.transfer(transferDto);

          // =========================================
          // 🔥 CHECK TRANSFER RESPONSE
          // =========================================
         // console.log("transferResponse", transferResponse)
          //console.log("transferResponse.data.status", transferResponse.status)
          if (!transferResponse.status) {

            const manual = await this.manualService.create(
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
          const transaction = await this.transactionsService.create(
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
          console.log("response", transaction)
        } catch (err: any) {
          return reject({
            status: 'failed',
            message: err.message || 'Processing failed',
          });
        }
      },
    );
  });
}
}