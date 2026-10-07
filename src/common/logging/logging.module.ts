import { Module, Global } from '@nestjs/common';
import { RequestContextService } from './request-context.service';
import { AuditService } from './audit.service';
import { SecurityService } from './security.service';
import { TransactionLogService } from './transaction.service';
import { IntegrationLogService } from './integration.service';
import { PerformanceLogService } from './performance.service';
import { ErrorLogService } from './error.service';

@Global()
@Module({
  providers: [
    RequestContextService,
    AuditService,
    SecurityService,
    TransactionLogService,
    IntegrationLogService,
    PerformanceLogService,
    ErrorLogService,
  ],
  exports: [
    RequestContextService,
    AuditService,
    SecurityService,
    TransactionLogService,
    IntegrationLogService,
    PerformanceLogService,
    ErrorLogService,
  ],
})
export class LoggingModule {}
