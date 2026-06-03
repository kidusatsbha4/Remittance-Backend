import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { Reflector } from '@nestjs/core'; // ✅ ADD THIS
import cookieParser from 'cookie-parser';import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import * as fs from 'fs';

async function bootstrap() {

  //  const httpsOptions = {
  //   key: fs.readFileSync('./ssl/privkey.pem'),
  //   cert: fs.readFileSync('./ssl/cert.pem'),
  // };

  const app = await NestFactory.create(AppModule
  //   , {
  //   httpsOptions,
  // }
);

 

// Register cookie parser middleware
  app.use(cookieParser());

 app.enableCors({
  origin: 'http://localhost:3000', // Vue app URL
  credentials: true,
});
  
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
