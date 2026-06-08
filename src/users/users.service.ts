import { Injectable, UnauthorizedException, NotFoundException,BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { QueryOptions } from '../common/interfaces/query-options.interface';
import { ChangePinDto } from './dto/change-pin.dto'; // ✅ NEW

import { ForgotPinDto } from './dto/forgot-pin.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { ResetPinDto } from './dto/reset-pin.dto';
import { ConfigService } from '@nestjs/config'; // UPDATED
import { Response } from 'express';

import * as nodemailer from 'nodemailer';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  // 1. CREATE
 async create(createUserDto: CreateUserDto) {
  const { email, phone_number, pin, ...userData } = createUserDto;

  // 🔍 Check existing users (single query)
  const existingUsers = await this.usersRepository.find({
    where: [
      { email },
      { phone_number },
    ],
  });

  const emailExists = existingUsers.some(user => user.email === email);
  const phoneExists = existingUsers.some(user => user.phone_number === phone_number);

  // ❌ Handle cases
  if (emailExists && phoneExists) {
    throw new BadRequestException('Email and phone number already exist');
  }

  if (emailExists) {
    throw new BadRequestException('Email already exists');
  }

  if (phoneExists) {
    throw new BadRequestException('Phone number already exists');
  }

  // 🔐 Hash PIN
  const hashedpin = await bcrypt.hash(pin, 10);

  // ✅ Create user
  const newUser = this.usersRepository.create({
    ...userData,
    email,
    phone_number,
    pin: hashedpin,
  });

  const savedUser = await this.usersRepository.save(newUser);

  return {
    status: 'success',
    data: savedUser,
  };
}

  async findAll(options: QueryOptions & any) {
  const { page, pageSize, search, sortBy, order, ...filters } = options;

  const query = this.usersRepository.createQueryBuilder('user')
    .leftJoinAndSelect('user.userRoles', 'userRoles')
    .leftJoinAndSelect('userRoles.role', 'role')
    .leftJoinAndSelect('role.rolePermissions', 'rolePermissions')
    .leftJoinAndSelect('rolePermissions.permission', 'permission')
    .leftJoinAndSelect('user.kyc', 'kyc'); // ✅ KYC added

  // 🔍 SEARCH
  if (search) {
    query.andWhere(
      '(user.first_name LIKE :search OR user.last_name LIKE :search OR user.email LIKE :search)',
      { search: `%${search}%` },
    );
  }

  // 🎯 FILTERING
  Object.keys(filters).forEach((key) => {
    if (filters[key]) {
      query.andWhere(`user.${key} = :${key}`, {
        [key]: filters[key],
      });
    }
  });

  // 🔽 SORT
  if (sortBy) {
    query.orderBy(`user.${sortBy}`, order || 'ASC');
  }

  // 📄 PAGINATION
  query.skip((page - 1) * pageSize).take(pageSize);

  const [data, total] = await query.getManyAndCount();

  // 🧠 CLEAN RESPONSE
  const result = data.map(user => ({
    id: user.id,
    first_name: user.first_name,
    last_name: user.last_name,
    email: user.email,
    phone_number: user.phone_number,

    roles: user.userRoles.map(ur => ({
      id: ur.role.id,
      name: ur.role.name,
    })),

    permissions: [
      ...new Set(
        user.userRoles.flatMap(ur =>
          ur.role.rolePermissions?.map(rp => rp.permission.name) || [],
        ),
      ),
    ],

    // 🧾 KYC INFO
    kyc: user.kyc
      ? {
          id: user.kyc.id,
          user_id: user.kyc.user_id,
          id_type: user.kyc.id_type,
          dob: user.kyc.dob,
          address: user.kyc.address,
          city: user.kyc.city,
          country: user.kyc.country,
          id_photo_path: user.kyc.id_photo_path,
          selfie_photo_path: user.kyc.selfie_photo_path,
          verified: user.kyc.verified,
          verified_at: user.kyc.verified_at,
          created_at: user.kyc.created_at,
        }
      : null,
  }));

  return {
    data: result,
    total,
    page,
    pageSize,
  };
}

  async findOne(id: number): Promise<any> {
  const user = await this.usersRepository.findOne({
    where: { id },
    relations: [
      'userRoles',
      'userRoles.role',
      'userRoles.role.rolePermissions',
      'userRoles.role.rolePermissions.permission',
      'kyc',
    ],
  });

  if (!user) {
    throw new NotFoundException(`User with ID ${id} not found`);
  }

  return {
    id: user.id,
    first_name: user.first_name,
    last_name: user.last_name,
    email: user.email,
    phone_number: user.phone_number,

    roles: user.userRoles.map(ur => ({
      id: ur.role.id,
      name: ur.role.name,
    })),

    permissions: [
      ...new Set(
        user.userRoles.flatMap(ur =>
          ur.role.rolePermissions?.map(rp => rp.permission.name) || [],
        ),
      ),
    ],

    kyc: user.kyc || null,
  };
}

  // 4. UPDATE
  async update(id: number, updateData: Partial<CreateUserDto>) {
    const user = await this.usersRepository.preload({
      id: id,
      ...updateData,
    });
    
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    
    const updatedUser = await this.usersRepository.save(user);
    return {
      status: 'success',
      data: updatedUser,
    };
  }

  // 5. REMOVE
  async remove(id: number) {
    const result = await this.usersRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return {
      status: 'success',
      message: 'User deleted successfully',
    };
  }

//  async login(loginDto: LoginDto) {
//   const user = await this.usersRepository.findOne({
//     where: { email: loginDto.email },
//     relations: [
//       'userRoles',
//       'userRoles.role',
//       'userRoles.role.rolePermissions',
//       'userRoles.role.rolePermissions.permission',
//     ],
//   });

//   if (!user || !(await bcrypt.compare(loginDto.pin, user.pin))) {
//     throw new UnauthorizedException('Invalid credentials');
//   }

//   const payload = { sub: user.id, email: user.email };

//   return {
//     access_token: await this.jwtService.signAsync(payload),

//     user: {
//       id: user.id,
//       email: user.email,
//       first_name: user.first_name,
//       last_name: user.last_name,
//       phone_number:user.phone_number,

//       roles: user.userRoles.map(ur => ({
//         id: ur.role.id,
//         name: ur.role.name,
//         permissions: ur.role.rolePermissions.map(
//           rp => rp.permission.name
//         ),
//       })),
//     },
//   };
// }
async login(loginDto: LoginDto, res: Response) {
  const user = await this.usersRepository.findOne({
    where: { email: loginDto.email },
    relations: [
      'userRoles',
      'userRoles.role',
      'userRoles.role.rolePermissions',
      'userRoles.role.rolePermissions.permission',
      'kyc', // ✅ KYC included
    ],
  });

  if (!user || !(await bcrypt.compare(loginDto.pin, user.pin))) {
    throw new UnauthorizedException('Invalid credentials');
  }

  const payload = { sub: Number(user.id), email: user.email };
const token = await this.jwtService.signAsync(payload);

   res.cookie('access_token', token, {
    httpOnly: true,
    secure: false, // localhost only
    sameSite: 'lax',
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });
  // Flatten permissions
  const permissions = [
    ...new Set(
      user.userRoles.flatMap(ur =>
        ur.role.rolePermissions.map(rp => rp.permission.name),
      ),
    ),
  ];
console.log("user",user)
  return {
    // access_token: await this.jwtService.signAsync(payload),

    user: {
      id: user.id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      phone_number: user.phone_number,

      roles: user.userRoles.map(ur => ({
        id: ur.role.id,
        name: ur.role.name,
      })),

      permissions,

      kyc: user.kyc
        ? {
            id: user.kyc.id,
            user_id: user.kyc.user_id,
            id_type: user.kyc.id_type,
            dob: user.kyc.dob,
            address: user.kyc.address,
            city: user.kyc.city,
            country: user.kyc.country,
            id_photo_path: user.kyc.id_photo_path,
            selfie_photo_path: user.kyc.selfie_photo_path,
            verified: user.kyc.verified,
            verified_at: user.kyc.verified_at,
            created_at: user.kyc.created_at,
          }
        : null,
    },
  };
}
// async login(loginDto: LoginDto) {
//   const user = await this.usersRepository.findOne({
//     where: { email: loginDto.email },
//     relations: [
//       'userRoles',
//       'userRoles.role',
//       'userRoles.role.rolePermissions',
//       'userRoles.role.rolePermissions.permission',
//       'kyc', // ✅ KYC included
//     ],
//   });

//   if (!user || !(await bcrypt.compare(loginDto.pin, user.pin))) {
//     throw new UnauthorizedException('Invalid credentials');
//   }

//   const payload = { sub: Number(user.id), email: user.email };

//   // Flatten permissions
//   const permissions = [
//     ...new Set(
//       user.userRoles.flatMap(ur =>
//         ur.role.rolePermissions.map(rp => rp.permission.name),
//       ),
//     ),
//   ];

//   return {
//     access_token: await this.jwtService.signAsync(payload),

//     user: {
//       id: user.id,
//       email: user.email,
//       first_name: user.first_name,
//       last_name: user.last_name,
//       phone_number: user.phone_number,

//       roles: user.userRoles.map(ur => ({
//         id: ur.role.id,
//         name: ur.role.name,
//       })),

//       permissions,

//       kyc: user.kyc
//         ? {
//             id: user.kyc.id,
//             user_id: user.kyc.user_id,
//             id_type: user.kyc.id_type,
//             dob: user.kyc.dob,
//             address: user.kyc.address,
//             city: user.kyc.city,
//             country: user.kyc.country,
//             id_photo_path: user.kyc.id_photo_path,
//             selfie_photo_path: user.kyc.selfie_photo_path,
//             verified: user.kyc.verified,
//             verified_at: user.kyc.verified_at,
//             created_at: user.kyc.created_at,
//           }
//         : null,
//     },
//   };
// }
async changePin(userId: number, dto: ChangePinDto) {
  if (!userId || isNaN(userId)) {
    throw new BadRequestException('Invalid user session');
  }

  // ✅ Get REAL entity (with pin)
  const user = await this.usersRepository.findOne({
    where: { id: userId },
  });

  if (!user) {
    throw new NotFoundException('User not found');
  }

  if (!user.pin) {
    throw new BadRequestException('User PIN not set');
  }
console.log("user",user)
  const isMatch = await bcrypt.compare(dto.oldPin, user.pin);
  if (!isMatch) {
    throw new UnauthorizedException('Old PIN is incorrect');
  }

  const isSame = await bcrypt.compare(dto.newPin, user.pin);
  if (isSame) {
    throw new UnauthorizedException('New PIN must be different');
  }

  user.pin = await bcrypt.hash(dto.newPin, 10);

  await this.usersRepository.save(user);

  return { message: 'PIN changed successfully' };
}


private generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit
}

async forgotPin(dto: ForgotPinDto) {
  const user = await this.usersRepository.findOne({
    where: { email: dto.email },
  });

  // ⚠️ Do NOT reveal user existence
  if (!user) {
    return { message: 'If account exists, OTP sent' };
  }

  const otp = this.generateOtp();

  // 🔐 Save OTP
  user.otp = await bcrypt.hash(otp, 10);
  user.otp_expires = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
  user.otp_verified = false;

  await this.usersRepository.save(user);

  // 📧 Email transporter
 const transporter = nodemailer.createTransport({
  host: 'mail.wegagenbanksc.com.et', // or smtp.wegagenbanksc.com.et
  port: 587,
  secure: false,
  auth: {
    user: this.configService.get<string>('EMAIL_USER'),
    pass: this.configService.get<string>('EMAIL_PASS'),
  },
});

  // 📩 Send email
  await transporter.sendMail({
    from: `"Your App" <${this.configService.get<string>('EMAIL_USER')}>`,
    to: user.email,
    subject: 'Reset PIN OTP',
    html: `
      <h3>Reset Your PIN</h3>
      <p>Your OTP code is:</p>
      <h2>${otp}</h2>
      <p>This code expires in 5 minutes.</p>
    `,
  });

  return { message: 'OTP sent successfully' };
}


async verifyOtp(dto: VerifyOtpDto) {
  const user = await this.usersRepository.findOne({
    where: { email: dto.email },
  });

  if (!user || !user.otp) {
    throw new UnauthorizedException('Invalid request');
  }
  if (!user.otp_expires) {
  throw new BadRequestException('OTP not found');
}

  if (user.otp_expires < new Date()) {
    throw new BadRequestException('OTP expired');
  }

  const isMatch = await bcrypt.compare(dto.otp, user.otp);

  if (!isMatch) {
    throw new UnauthorizedException('Invalid OTP');
  }

  user.otp_verified = true;
  await this.usersRepository.save(user);

  return { message: 'OTP verified successfully' };
}

async resetPin(dto: ResetPinDto) {
  const user = await this.usersRepository.findOne({
    where: { email: dto.email },
  });

  if (!user) {
    throw new NotFoundException('User not found');
  }

  if (!user.otp_verified) {
    throw new UnauthorizedException('OTP not verified');
  }

  const isSame = await bcrypt.compare(dto.newPin, user.pin);
  if (isSame) {
    throw new BadRequestException('New PIN must be different');
  }

  user.pin = await bcrypt.hash(dto.newPin, 10);

  // 🧹 cleanup
  user.otp = null;
  user.otp_expires = null;
  user.otp_verified = false;

  await this.usersRepository.save(user);

  return { message: 'PIN reset successful' };
}
}



