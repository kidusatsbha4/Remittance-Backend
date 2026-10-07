import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { Reflector } from '@nestjs/core';
import cookieParser from 'cookie-parser';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { LoggingInterceptor } from './common/logging/logging.interceptor';
import { GlobalExceptionFilter } from './common/logging/global-exception.filter';
import { ErrorLogService } from './common/logging/error.service';
import { PerformanceLogService } from './common/logging/performance.service';
import * as fs from 'fs';
import * as path from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const httpsOptions = {
    key: fs.readFileSync('./ssl/wegagenSSl2025.key'),
    cert: fs.readFileSync('./ssl/chaincertwegagenSSl2025.crt'),
  };

  const app = await NestFactory.create<NestExpressApplication>(AppModule,
     {
    httpsOptions,
  }
);

  app.set('trust proxy', 1);
// app.use(
//   helmet({
//     contentSecurityPolicy: {
//       directives: {
//         defaultSrc: ["'self'", "https://testflex.cybersource.com"],
//         scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://testflex.cybersource.com"],
//         styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://testflex.cybersource.com"],
//         fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"],
//         frameSrc: ["'self'", "https://testflex.cybersource.com"],
//         imgSrc: [
//           "'self'", 
//           "data:", 
//           "https://testflex.cybersource.com", 
//           "https://upload.wikimedia.org", 
//           "https://logos-world.net", 
//           "https://10.195.49.18"
//         ],
//         connectSrc: ["'self'", "https://testflex.cybersource.com", "https://10.195.49.18"],
//       },
//     },
//   })
// );

// if (isProd) {
//   app.use(helmet.hsts({
//     maxAge: 31536000,
//     includeSubDomains: true,
//     preload: true
//   }));

//   app.use(helmet.noSniff());
// app.use(helmet.frameguard({ action: 'sameorigin' }));
// }
  // Serve static files from uploads directory
  const uploadsPath = path.join(process.cwd(), 'uploads');
  if (!fs.existsSync(uploadsPath)) {
    fs.mkdirSync(uploadsPath, { recursive: true });
  }
  app.useStaticAssets(uploadsPath, {
    prefix: '/uploads',
  });

  // Register cookie parser middleware
  app.use(cookieParser());

  app.enableCors({
    origin: [
      'http://10.195.49.19:3000',
      'http://10.195.49.18:3000',
      'http://10.195.49.21:5173',
      'http://localhost:3000'
    ],
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Get logging services
  const reflector = app.get(Reflector);
  const performanceLog = app.get(PerformanceLogService);
  const errorLog = app.get(ErrorLogService);

  // Apply global interceptors
  app.useGlobalInterceptors(
    new TransformInterceptor(reflector),
    new LoggingInterceptor(performanceLog, errorLog),
  );

  // Apply global exception filter
  app.useGlobalFilters(new GlobalExceptionFilter(errorLog));

  await app.listen(process.env.PORT ?? 3001);
  console.log(
    `Application is running on: https://localhost:${process.env.PORT ?? 3001}`,
  );
}

bootstrap();
