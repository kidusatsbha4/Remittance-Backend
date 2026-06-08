import { Controller,Get, Post,Query, Res,Body, HttpCode, HttpStatus, Request, UseGuards } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { AuthGuard } from '../auth/auth.guard';
import type { Response } from 'express';
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('generate-capture-context')
  @HttpCode(HttpStatus.OK)
  async generateCaptureContext() {
    return this.paymentsService.generateCaptureContext();
  }

   // ==============================
  // ✅ UPDATED: Serve Microform HTML page
  // ==============================
  // @Post('microform')
  // async getMicroformPage(@Res() res: Response) {
  //   const captureContext =
  //     await this.paymentsService.generateCaptureContext();

  //   const html =
  //     await this.paymentsService.buildMicroformHtml(
  //       captureContext as string,
  //     );

  //   res.setHeader('Content-Type', 'text/html');
  //   return res.send(html);
  // }

  // ==============================
  // ✅ NEW: Receive transient token from HTML
  // ==============================
  @Post('process-tokens')
  async processP(@Body() body: any) {
    const { transientToken, amount, currency } = body;

    return this.paymentsService.processPayment(
      {
        transientToken,
        amount,
        currency,
        ...body,
      },
      body.user || null,
    );
  }
// @Get('card-form')
// getCardForm(@Res() res: Response) {
//   res.send(`
// <!DOCTYPE html>
// <html>
// <head>
// <meta charset="utf-8" />
// <title>Secure Card Entry</title>

// <style>
// body{
//   font-family: Arial, sans-serif;
//   max-width:600px;
//   margin:40px auto;
//   padding:20px;
// }

// .field{
//   margin-bottom:15px;
// }

// #number-container,
// #securityCode-container{
//   height:50px;
//   border:1px solid #ccc;
//   border-radius:4px;
//   padding:10px;
// }

// input{
//   width:100%;
//   padding:10px;
//   border:1px solid #ccc;
//   border-radius:4px;
// }

// button{
//   padding:12px 20px;
//   background:#003366;
//   color:white;
//   border:none;
//   border-radius:4px;
//   cursor:pointer;
// }

// button:hover{
//   background:#004b99;
// }

// #status{
//   margin-top:20px;
//   color:#333;
// }
// </style>
// </head>

// <body>

// <h2>Secure Card Entry</h2>

// <div class="field">
//   <label>Card Number</label>
//   <div id="number-container"></div>
// </div>

// <div class="field">
//   <label>Security Code</label>
//   <div id="securityCode-container"></div>
// </div>

// <div class="field">
//   <label>Expiration Month</label>
//   <input
//     id="month"
//     type="text"
//     placeholder="MM"
//     maxlength="2"
//   />
// </div>

// <div class="field">
//   <label>Expiration Year</label>
//   <input
//     id="year"
//     type="text"
//     placeholder="YYYY"
//     maxlength="4"
//   />
// </div>

// <button onclick="generateToken()">
// Generate Token
// </button>

// <div id="status"></div>

// <script>

// let microform;
// let captureContextJwt;

// (async function(){

//   try {

//     document.getElementById('status').innerHTML =
//       'Loading secure fields...';

//     const response = await fetch(
//       '/payments/generate-capture-context',
//       {
//         method: 'POST'
//       }
//     );

//     captureContextJwt = await response.text();

//     console.log('Capture Context JWT:', captureContextJwt);

//     const payload = JSON.parse(
//       atob(
//         captureContextJwt
//           .split('.')[1]
//           .replace(/-/g, '+')
//           .replace(/_/g, '/')
//       )
//     );

//     console.log('Decoded Payload:', payload);

//     const context = payload.ctx[0].data;

//     const script = document.createElement('script');

//     script.src = context.clientLibrary;
//     script.integrity =
//       context.clientLibraryIntegrity;

//     script.crossOrigin = 'anonymous';

//     script.onload = function() {

//       console.log('CyberSource library loaded');

//       const flex = new Flex(
//         captureContextJwt
//       );

//       // FIXED
//       microform = flex.microform('card');

//       microform
//         .createField('number', {
//           placeholder: '4111 1111 1111 1111'
//         })
//         .load('#number-container');

//       microform
//         .createField('securityCode', {
//           placeholder: '123'
//         })
//         .load('#securityCode-container');

//       document.getElementById('status').innerHTML =
//         'Secure fields loaded';
//     };

//     script.onerror = function(err) {
//       console.error(err);

//       document.getElementById('status').innerHTML =
//         'Failed to load CyberSource script';
//     };

//     document.head.appendChild(script);

//   } catch(error) {

//     console.error(error);

//     document.getElementById('status').innerHTML =
//       error.message;
//   }

// })();
// </script>

// <script>

// async function generateToken(){

//   try {

//     if(!microform){
//       alert('Microform not loaded');
//       return;
//     }

//     const month =
//       document.getElementById('month').value;

//     const year =
//       document.getElementById('year').value;

//     document.getElementById('status').innerHTML =
//       'Generating token...';

//     microform.createToken(
//       {
//         expirationMonth: month,
//         expirationYear: year
//       },
//       async function(err, token){

//         if(err){

//           console.error(err);

//           alert(err.message);

//           document.getElementById('status').innerHTML =
//             err.message;

//           return;
//         }

//         console.log(
//           'Transient Token:',
//           token
//         );

//         document.getElementById('status').innerHTML =
//           'Token generated successfully';

//         const saveResponse = await fetch(
//           '/payments/store-token',
//           {
//             method:'POST',
//             headers:{
//               'Content-Type':'application/json'
//             },
//             body:JSON.stringify({
//               token
//             })
//           }
//         );

//         const result =
//           await saveResponse.json();

//         console.log(
//           'Store Token Response:',
//           result
//         );

//         alert(
//           'Token generated successfully'
//         );

//       }
//     );

//   } catch(error){

//     console.error(error);

//     document.getElementById('status').innerHTML =
//       error.message;
//   }
// }

// </script>

// </body>
// </html>
// `);
// }
 // =================================================
  // 1. CREATE SESSION
  // =================================================
  @Post('session')
  createSession(@Body() body: any) {
    return this.paymentsService.createSession(body);
  }

  // =================================================
  // 2. MICROFORM PAGE (Nginx/BROWSER ONLY)
  // =================================================
  @Get('card-form')
  getCardForm(@Query('sessionId') sessionId: string, @Res() res: Response) {
    const html = `
<!DOCTYPE html>
<html>
<head>
  <title>Secure Checkout</title>
</head>

<body>
  <h2>Card Payment</h2>

  <div id="number-container"></div>
  <div id="securityCode-container"></div>

  <input id="month" placeholder="MM"/>
  <input id="year" placeholder="YYYY"/>

  <button onclick="pay()">Pay</button>

<script>
let microform;

(async () => {
  const sessionId = "${sessionId}";

  const session = await fetch("/payments/session-data?sessionId=" + sessionId)
    .then(r => r.json());

  const script = document.createElement("script");
  script.src = JSON.parse(atob(session.captureContext.split('.')[1])).ctx[0].data.clientLibrary;

  script.onload = () => {
    const flex = new Flex(session.captureContext);
    microform = flex.microform('card');

    microform.createField('number').load('#number-container');
    microform.createField('securityCode').load('#securityCode-container');
  };

  document.head.appendChild(script);
})();

async function pay() {
  microform.createToken({
    expirationMonth: document.getElementById('month').value,
    expirationYear: document.getElementById('year').value,
  }, async (err, token) => {
    await fetch('/payments/process-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: "${sessionId}",
        transientToken: token
      })
    });

   window.location.href = "/payment-success?status=success&sessionId=" + "${sessionId}";
  });
}
</script>

</body>
</html>
    `;

    res.setHeader('Content-Type', 'text/html');
    return res.send(html);
  }

  // OPTIONAL: session fetch endpoint
  @Get('session-data')
  getSession(@Query('sessionId') sessionId: string) {
    return this.paymentsService.getSession(sessionId);
  }

  // =================================================
  // 3. PROCESS TOKEN
  // =================================================
  @Post('process-token')
  processToken(@Body() body: any) {
    return this.paymentsService.processToken(body);
  }
   @Post('check-enrollment')
  @HttpCode(HttpStatus.OK)
  async checkEnrollment(@Body() body: any) {
    return this.paymentsService.checkEnrollment(body);
  }
@Post('authentication-results')
@HttpCode(HttpStatus.OK)
async authenticationResults(@Body() body: any) {
  return this.paymentsService.authenticationResults(body);
}
  @Post('process-payment')
  @HttpCode(HttpStatus.OK)
  async processPayment(@Body() body: any, @Request() req) {
    return this.paymentsService.processPayment(body, req.user);
  }
@Post('3ds/return')
async challengeReturn(
  @Body() body: any,
  @Res() res: any,
) {
  console.log('3DS Return:', body);

  return res.send(`
    <!DOCTYPE html>
    <html>
    <body>
      <script>
        window.parent.postMessage(
          '3DS_CHALLENGE_COMPLETE',
          '*'
        );
      </script>
      Authentication Complete...
    </body>
    </html>
  `);
}
// @Throttle({
//   default: {
//     limit: 10,
//     ttl: 60 * 1000,
//   },
// })
  @Post('pay')
@HttpCode(HttpStatus.OK)
async pay(@Body() body: any, @Request() req) {
  return this.paymentsService.pay(body, req.user);
}
}