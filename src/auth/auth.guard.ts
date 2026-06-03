import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config'; // UPDATED
import { Request } from 'express';

@Injectable()
export class AuthGuard implements CanActivate {
  // UPDATED: Injected ConfigService
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
  const request = context.switchToHttp().getRequest();
const token = request.cookies?.access_token;

  if (!token) {
    throw new UnauthorizedException('No token provided');
  }

  try {
    const payload = await this.jwtService.verifyAsync(token, {
      secret: this.configService.get<string>('JWT_SECRET'),
    });

    const sub = Number(payload?.sub);

    if (Number.isNaN(sub)) {
      throw new UnauthorizedException('Invalid token payload');
    }

    request.user = {
      sub,
      email: payload.email,
    };

    return true;
  } catch {
    throw new UnauthorizedException('Invalid or expired token');
  }
}
  // private extractTokenFromHeader(request: Request): string | undefined {
  //   const [type, token] = request.headers.authorization?.split(' ') ?? [];
  //   return type === 'Bearer' ? token : undefined;
  // }
}




// import {
//   CanActivate,
//   ExecutionContext,
//   Injectable,
//   UnauthorizedException,
// } from '@nestjs/common';
// import { JwtService } from '@nestjs/jwt';
// import { ConfigService } from '@nestjs/config'; // UPDATED
// import { Request } from 'express';

// @Injectable()
// export class AuthGuard implements CanActivate {
//   // UPDATED: Injected ConfigService
//   constructor(
//     private jwtService: JwtService,
//     private configService: ConfigService,
//   ) {}

//   async canActivate(context: ExecutionContext): Promise<boolean> {
//   const request = context.switchToHttp().getRequest();
//   const token = this.extractTokenFromHeader(request);

//   if (!token) {
//     throw new UnauthorizedException('No token provided');
//   }

//   try {
//     const payload = await this.jwtService.verifyAsync(token, {
//       secret: this.configService.get<string>('JWT_SECRET'),
//     });

//     const sub = Number(payload?.sub);

//     if (Number.isNaN(sub)) {
//       throw new UnauthorizedException('Invalid token payload');
//     }

//     request.user = {
//       sub,
//       email: payload.email,
//     };

//     return true;
//   } catch {
//     throw new UnauthorizedException('Invalid or expired token');
//   }
// }
//   private extractTokenFromHeader(request: Request): string | undefined {
//     const [type, token] = request.headers.authorization?.split(' ') ?? [];
//     return type === 'Bearer' ? token : undefined;
//   }
// }