// data-source.ts
import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { User } from './src/users/entities/user.entity'; // replace with your entity
import { UserRole } from './src/user-roles/entities/user-role.entity'; // replace with your entity
import { Permission } from './src/permissions/entities/permission.entity'; // replace with your entity
import { Role } from './src/roles/entities/role.entity'; // replace with your entity
import { RolePermission } from './src/role-permissions/entities/role-permission.entity'; // replace with your entity
import { Kyc } from './src/kyc/entities/kyc.entity'; // replace with your entity
import {MerchantKey } from './src/merchant-keys/entities/merchant-keys.entity'; // replace with your entity
import {Transaction } from './src/transactions/entities/transaction.entity'; // replace with your entity
import {Manual } from './src/manuals/entities/manual.entity'; // replace with your entity




export const AppDataSource = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: '123',
  database: 'remittance',
  entities: [User,UserRole,Permission,Role,RolePermission,Kyc,MerchantKey,Transaction,Manual],
  migrations: ['src/migrations/*.ts'],
  synchronize: false,
});