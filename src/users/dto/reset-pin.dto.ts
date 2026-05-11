import { IsEmail, IsString, Length } from 'class-validator';

export class ResetPinDto {
  @IsEmail()
  email: string;

  @IsString()
  @Length(4, 4, { message: 'PIN must be 4 digits' })
  newPin: string;
}