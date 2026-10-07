import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { RolesModule } from './roles/roles.module';
import { PermissionsModule } from './permissions/permissions.module';
import { RolePermissionsModule } from './role-permissions/role-permissions.module';
import { UserRolesModule } from './user-roles/user-roles.module';
import { KycModule } from './kyc/kyc.module';
import { MerchantKeysModule } from './merchant-keys/merchant-keys.module';
import { TransactionsModule } from './transactions/transactions.module';
import { InternalTransferModule } from './internal-transfer/internal-transfer.module';
import { PaymentsModule } from './payments/payments.module';
import { ManualModule } from './manuals/manual.module';
import { BonusModule } from './bonus/bonus.module';
import { TransferTypeModule } from './transfer-type/transfer-type.module';
import { CashPickupModule } from './cash-pickup/cash-pickup.module';
import { LoggingModule } from './common/logging/logging.module';
import { RequestContextMiddleware } from './common/logging/request-context.middleware';

import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_NAME'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: false,
        migrations: [__dirname + '/migrations/*{.ts,.js}'],
      }),
      inject: [ConfigService],
    }),
    LoggingModule,
    UsersModule,
    RolesModule,
    PermissionsModule,
    RolePermissionsModule,
    UserRolesModule,
    KycModule,
    MerchantKeysModule,
    TransactionsModule,
    InternalTransferModule,
    PaymentsModule,
    ManualModule,
    BonusModule,
    TransferTypeModule,
    CashPickupModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestContextMiddleware).forRoutes('*');
  }
}

// import { Module } from '@nestjs/common';
// import { APP_GUARD } from '@nestjs/core';
// import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';

// import { TypeOrmModule } from '@nestjs/typeorm';
// import { ConfigModule, ConfigService } from '@nestjs/config';

// import { UsersModule } from './users/users.module';
// import { RolesModule } from './roles/roles.module';
// import { PermissionsModule } from './permissions/permissions.module';
// import { RolePermissionsModule } from './role-permissions/role-permissions.module';
// import { UserRolesModule } from './user-roles/user-roles.module';
// import { KycModule } from './kyc/kyc.module';
// import { MerchantKeysModule } from './merchant-keys/merchant-keys.module';
// import { TransactionsModule } from './transactions/transactions.module';
// import { InternalTransferModule } from './internal-transfer/internal-transfer.module';
// import { PaymentsModule } from './payments/payments.module';
// import { ManualModule } from './manuals/manual.module';
// import { BonusModule } from './bonus/bonus.module';
// import { TransferTypeModule } from './transfer-type/transfer-type.module';

// import { AppController } from './app.controller';
// import { AppService } from './app.service';

// @Module({
//   imports: [
//     ConfigModule.forRoot({
//       isGlobal: true,
//     }),

//     ThrottlerModule.forRoot([
//       {
//         ttl: 60_000,
//         limit: 100,
//       },
//     ]),

//     TypeOrmModule.forRootAsync({
//       imports: [ConfigModule],
//       inject: [ConfigService],
//       useFactory: (configService: ConfigService) => ({
//         type: 'postgres',
//         host: configService.get('DB_HOST'),
//         port: configService.get<number>('DB_PORT'),
//         username: configService.get('DB_USERNAME'),
//         password: configService.get('DB_PASSWORD'),
//         database: configService.get('DB_NAME'),
//         entities: [__dirname + '/**/*.entity{.ts,.js}'],
//         synchronize: false,
//         migrations: [__dirname + '/migrations/*{.ts,.js}'],
//       }),
//     }),

//     UsersModule,
//     RolesModule,
//     PermissionsModule,
//     RolePermissionsModule,
//     UserRolesModule,
//     KycModule,
//     MerchantKeysModule,
//     TransactionsModule,
//     InternalTransferModule,
//     PaymentsModule,
//     ManualModule,
//     BonusModule,
//     TransferTypeModule,
//   ],

//   controllers: [AppController],

//   providers: [
//     AppService,

//     {
//       provide: APP_GUARD,
//       useClass: ThrottlerGuard,
//     },
//   ],
// })
// export class AppModule {}