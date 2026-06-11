import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { Reflector } from '@nestjs/core'; // ✅ ADD THIS
import cookieParser from 'cookie-parser';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import * as fs from 'fs';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {

  //  const httpsOptions = {
  //   key: fs.readFileSync('./ssl/privkey.pem'),
  //   cert: fs.readFileSync('./ssl/cert.pem'),
  // };

  const app = await NestFactory.create<NestExpressApplication>(AppModule
  //   , {
  //   httpsOptions,
  // }
);

//  app.set('trust proxy', 1);

// Register cookie parser middleware
  app.use(cookieParser());

 app.enableCors({
   origin: ['http://localhost:3000', 'http://10.195.49.18:3000'], // Vue app URL
  // origin: true,
  credentials: true,
});

// app.enableCors({
//   origin: [
//     process.env.FRONTEND_URL,
//     process.env.ADMIN_URL,
//   ],
//   credentials: true,
//   methods: [
//     'GET',
//     'POST',
//     'PUT',
//     'PATCH',
//     'DELETE',
//     'OPTIONS',
//   ],
//   allowedHeaders: [
//     'Authorization',
//     'Content-Type',
//     'Accept',
//   ],
// });
  // This enables the validation constraints in your DTOs
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, // Strips away properties that don't have decorators
    forbidNonWhitelisted: true, // Throws error if extra properties are sent
    transform: true, // Automatically transforms payloads to DTO instances
  }));
// Apply the interceptor to every route in the app
   const reflector = app.get(Reflector);
app.useGlobalInterceptors(new TransformInterceptor(reflector));
  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();

/*
app.setGlobalPrefix('api');

app.useBodyParser('json', {
  limit: '10mb',
});

*/

// import helmet from 'helmet';
// import cookieParser from 'cookie-parser';

// app.set('trust proxy', 1);

// app.use(cookieParser());

// app.use(
//   helmet({
//     crossOriginEmbedderPolicy: false,

//     contentSecurityPolicy: {
//       directives: {
//         defaultSrc: ["'self'"],

//         scriptSrc: [
//           "'self'",
//           "'unsafe-inline'",
//           "'unsafe-eval'",
//           'https://testflex.cybersource.com',
//         ],

//         frameSrc: [
//           'https://testflex.cybersource.com',
//         ],

//         connectSrc: [
//           "'self'",
//           'https://testflex.cybersource.com',
//         ],

//         imgSrc: [
//           "'self'",
//           'data:',
//           'https://testflex.cybersource.com',
//         ],

//         styleSrc: [
//           "'self'",
//           "'unsafe-inline'",
//           'https://fonts.googleapis.com',
//         ],

//         fontSrc: [
//           "'self'",
//           'https://fonts.gstatic.com',
//         ],
//       },
//     },
//   }),
// );

// For Production CyberSource

// I would further add:

// helmet({
//   hsts: {
//     maxAge: 31536000,
//     includeSubDomains: true,
//     preload: true,
//   },

//   referrerPolicy: {
//     policy: 'strict-origin-when-cross-origin',
//   },
// });