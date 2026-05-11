import { IsNumber, IsArray, IsOptional } from 'class-validator';

export class UpdateRolePermissionDto {
  @IsNumber()
  role_id: number;

  @IsOptional()
  @IsArray()
  add_permission_ids?: number[];

  @IsOptional()
  @IsArray()
  remove_permission_ids?: number[];
}