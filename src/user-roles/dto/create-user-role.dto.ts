import { IsNumber } from 'class-validator';

export class CreateUserRoleDto {
  @IsNumber()
  user_id: number;

  @IsNumber()
  role_id: number;
}