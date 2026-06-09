// src/users/users.controller.ts
import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, HttpStatus,UseInterceptors,
   ClassSerializerInterceptor,UseGuards,Query,Request,UnauthorizedException,ParseIntPipe  } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { AuthGuard } from '../auth/auth.guard'; // Adjust path as needed
import { ChangePinDto } from './dto/change-pin.dto'; // ✅ NEW

import { ForgotPinDto } from './dto/forgot-pin.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { ResetPinDto } from './dto/reset-pin.dto';
import type { Response } from 'express';
import { Res } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';

@UseInterceptors(ClassSerializerInterceptor) // Enables the @Exclude() decorator
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  // @Post('login')
  // @HttpCode(HttpStatus.OK)
  // login(@Body() loginDto: LoginDto) {
  //   return this.usersService.login(loginDto);
  // }

//    @Throttle({
//   default: {
//     ttl: 15 * 60 * 1000, // 15 minutes
//     limit: 5,            // 5 attempts per 15 min
//   },
// })
@Post('login')
@HttpCode(HttpStatus.OK)
login(
  @Body() loginDto: LoginDto,
  @Res({ passthrough: true }) res: Response,
) {
  return this.usersService.login(loginDto, res);
}
  // PROTECTED: Only logged-in users can see the list
  @UseGuards(AuthGuard)
  @Get()
  findAll(
  @Query('page') page: number = 1,
  @Query('page_size') pageSize: number = 10,
  @Query('search') search?: string,
  @Query('sort_by') sortBy: string = 'id',
  @Query('order') order: 'ASC' | 'DESC' = 'ASC',
) {
  return this.usersService.findAll({
    page,
    pageSize,
    search,
    sortBy,
    order,
  });
}

  // PROTECTED: Only logged-in users can see details
  @UseGuards(AuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }
@UseGuards(AuthGuard)
@Patch('change-pin')
changePin(@Request() req, @Body() dto: ChangePinDto) {
  console.log('REQ USER:', req.user);

  const userId = req.user?.sub;

  console.log('USER ID:', userId);

  return this.usersService.changePin(userId, dto);
}

  // PROTECTED: Only logged-in users can update
  @UseGuards(AuthGuard)
  @Patch(':id')
update(
  @Param('id', ParseIntPipe) id: number,
  @Body() updateData: Partial<CreateUserDto>,
) {
  return this.usersService.update(id, updateData);
}
  
  @UseGuards(AuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }

//  @Throttle({
//   default: {
//     ttl: 60 * 60 * 1000, // 1 hour
//     limit: 3,            // 3 attempts per hour
//   },
// })
@Post('forgot-pin')
forgotPin(@Body() dto: ForgotPinDto) {
  return this.usersService.forgotPin(dto);
}

// @Throttle({
//   default: {
//     ttl: 60_000, // 1 minute
//     limit: 3,    // 3 OTP requests per minute
//   },
// })
@Post('verify-otp')
verifyOtp(@Body() dto: VerifyOtpDto) {
  return this.usersService.verifyOtp(dto);
}

@Post('reset-pin')
resetPin(@Body() dto: ResetPinDto) {
  return this.usersService.resetPin(dto);
}
}