# Multi-Service Logging Architecture

This document provides a comprehensive guide to the logging system implemented in the Remittance Backend.

## Overview

The logging system is separated into specialized services, each handling a specific type of log:

- **RequestContextService** - Manages request/correlation IDs and user context
- **AuditService** - Logs business actions (create, update, delete, approve, reject, reverse)
- **SecurityService** - Logs authentication, authorization, and suspicious activities
- **TransactionLogService** - Tracks payment and remittance lifecycle events
- **IntegrationLogService** - Logs external service calls (CyberSource, Visa Direct, Core Banking)
- **PerformanceLogService** - Tracks request duration and slow queries
- **ErrorLogService** - Records exceptions with unique error IDs

## Architecture

### File Structure

```
src/common/logging/
├── logger.service.ts              # Winston logger configuration
├── request-context.service.ts     # Request/correlation ID management
├── request-context.middleware.ts  # Middleware to capture request context
├── audit.service.ts               # Business action logging
├── security.service.ts            # Authentication/authorization logging
├── transaction.service.ts         # Transaction lifecycle logging
├── integration.service.ts         # External integration logging
├── performance.service.ts         # Performance metrics logging
├── error.service.ts               # Error exception logging
├── logging.interceptor.ts         # Global request/response interceptor
├── global-exception.filter.ts     # Global exception filter
├── logging.module.ts              # Module that exports all services
└── LOGGING_GUIDE.md              # This file
```

## Log Files

Logs are stored in the `logs/` directory:

- **logs/all-YYYY-MM-DD.log** - All application logs (rotates daily, kept for 14 days)
- **logs/errors-YYYY-MM-DD.log** - Error logs only (rotates daily, kept for 30 days)

## Usage Examples

### Request Context

Track request ID and correlation ID throughout the request lifecycle:

```typescript
import { RequestContextService } from './common/logging/request-context.service';

constructor(private requestContext: RequestContextService) {}

// Middleware automatically sets context
// Get context anywhere in the request:
const context = this.requestContext.getMetadata();
// { requestId, correlationId, userId, transactionId, ... }

// Set transaction ID during processing
this.requestContext.setTransactionId('TXN-123456');
```

### Audit Logging

Log business actions:

```typescript
import { AuditService, AuditAction, AuditResource } from './common/logging/audit.service';

constructor(private audit: AuditService) {}

// Log user creation
this.audit.logCreate(
  AuditResource.USER,
  userId,
  { userId: adminId, email: 'admin@example.com' },
  { email, firstName, lastName, role },
  { ipAddress: req.ip }
);

// Log transaction approval
this.audit.logApproval(
  AuditResource.TRANSACTION,
  transactionId,
  { userId: approverId, email: 'approver@example.com' },
  'Manual approval for high-value transaction',
);

// Log transaction reversal
this.audit.logReversal(
  AuditResource.PAYMENT,
  paymentId,
  { userId: userId },
  'Customer requested reversal',
  { reason: 'duplicate_transaction' },
);
```

### Security Logging

Log authentication and authorization events:

```typescript
import { SecurityService, SecurityEvent } from './common/logging/security.service';

constructor(private security: SecurityService) {}

// Log successful login
this.security.logLoginSuccess(userId, email, ipAddress, userAgent);

// Log failed login
this.security.logLoginFailure(email, ipAddress, 'Invalid credentials', userAgent);

// Log token generation
this.security.logTokenGenerated(userId, ipAddress);

// Log permission denied
this.security.logPermissionDenied(userId, 'TRANSACTION', 'REVERSE', ipAddress);

// Log suspicious activity
this.security.logSuspiciousActivity(
  userId,
  ipAddress,
  'brute_force_attempt',
  'Multiple failed login attempts',
);
```

### Transaction Logging

Track payment and remittance lifecycle:

```typescript
import { TransactionLogService, TransactionLifecycleEvent } from './common/logging/transaction.service';

constructor(private txLog: TransactionLogService) {}

// Log transaction initiated
this.txLog.logInitiated(
  txId,
  txRef,
  'PAYMENT',
  1000,
  'USD',
  { id: senderId, accountNumber: '****1234' },
  { id: recipientId, accountNumber: '****5678' },
);

// Log funds reserved
this.txLog.logFundsReserved(txId, txRef, 1000);

// Log submitted to gateway
this.txLog.logSubmittedToGateway(txId, txRef, 'CyberSource');

// Log completed
this.txLog.logCompleted(txId, txRef, externalRef, 1000);

// Log failed
this.txLog.logFailed(txId, txRef, 'Insufficient funds', 'INSUFFICIENT_BALANCE');

// Log refunded
this.txLog.logRefunded(txId, txRef, externalRef, 1000, 'Customer requested refund');
```

### Integration Logging

Log external service calls:

```typescript
import { IntegrationLogService, IntegrationEvent } from './common/logging/integration.service';

constructor(private intLog: IntegrationLogService) {}

// Log request sent
const startTime = Date.now();
this.intLog.logRequestSent(
  'CyberSource',
  '/transaction',
  'POST',
  requestId,
  { amount: 1000, currency: 'USD' },
);

// Log response received
const duration = Date.now() - startTime;
this.intLog.logResponseReceived(
  'CyberSource',
  '/transaction',
  'POST',
  requestId,
  200,
  duration,
  { status: 'APPROVED', transactionId: 'ABC123' },
);

// Log request failed
this.intLog.logRequestFailed(
  'CyberSource',
  '/transaction',
  'POST',
  requestId,
  'Network timeout',
  'ECONNREFUSED',
  duration,
  500,
);

// Log webhook received
this.intLog.logWebhookReceived(
  'CyberSource',
  '/webhooks/cybersource',
  webhookId,
  payload,
);

// Log webhook processed
this.intLog.logWebhookProcessed(
  'CyberSource',
  '/webhooks/cybersource',
  webhookId,
  processingTime,
  'SUCCESS',
  { transactionId: 'ABC123', status: 'APPROVED' },
);
```

### Performance Logging

Track request performance and slow queries:

```typescript
import { PerformanceLogService } from './common/logging/performance.service';

constructor(private perfLog: PerformanceLogService) {}

// Automatically logged by LoggingInterceptor
// Manual logging if needed:

// Log database query
const queryStart = Date.now();
const result = await this.repo.find();
const duration = Date.now() - queryStart;
this.perfLog.logDatabaseQuery(
  'SELECT * FROM users WHERE status = :status',
  duration,
  result.length,
  true,
);

// Log cache operation
this.perfLog.logCacheOperation('GET', 'user:123', 5, true, 1024);

// Log external API call
this.perfLog.logExternalApiCall(
  'CyberSource',
  'POST /transaction',
  1200,
  200,
  true,
);

// Log memory usage
const mem = process.memoryUsage();
this.perfLog.logMemoryUsage(mem.heapUsed, mem.heapTotal, mem.external, mem.rss);
```

### Error Logging

Log exceptions with unique error IDs:

```typescript
import { ErrorLogService } from './common/logging/error.service';

constructor(private errorLog: ErrorLogService) {}

// Log general exception
const errorId = this.errorLog.logException(
  error,
  '/api/transactions',
  'POST',
  500,
  userId,
  { headers: sanitizedHeaders, body: sanitizedBody, query: queryParams },
  { customField: 'customValue' },
);
// Returns errorId to include in error response

// Log validation error
const errorId = this.errorLog.logValidationError(
  '/api/transactions',
  'POST',
  validationErrors,
  userId,
);

// Log database error
const errorId = this.errorLog.logDatabaseError(
  '/api/transactions',
  'GET',
  'SELECT * FROM transactions WHERE id = :id',
  error,
  userId,
);

// Log external service error
const errorId = this.errorLog.logExternalServiceError(
  '/api/transactions',
  'POST',
  'CyberSource',
  'POST /transactions',
  500,
  response,
  userId,
);

// Log authentication error
const errorId = this.errorLog.logAuthenticationError(
  '/api/auth/login',
  'POST',
  'Invalid JWT token',
  userId,
);

// Log authorization error
const errorId = this.errorLog.logAuthorizationError(
  '/api/transactions/reverse',
  'POST',
  'User does not have TRANSACTION_REVERSE permission',
  userId,
);
```

## Global Middleware & Interceptors

### RequestContextMiddleware

Automatically runs for all requests and:
- Generates `requestId` if not provided
- Captures `correlationId` from header or generates one
- Stores client IP address and user agent
- Sets response headers with IDs

### LoggingInterceptor

Automatically runs for all requests and:
- Measures request duration
- Logs performance metrics
- Captures request/response sizes
- Redacts sensitive data (passwords, tokens, credit cards)
- Logs errors to ErrorLogService

### GlobalExceptionFilter

Automatically catches all exceptions and:
- Generates unique error ID
- Logs exception with context
- Returns standardized error response with error ID

## Sensitive Data Redaction

The system automatically redacts sensitive fields in logs:

### Headers Redacted:
- authorization
- cookie
- x-api-key

### Request Body Fields Redacted:
- password
- pin
- otp
- apiKey
- token
- secret
- creditCard
- cardNumber
- cvv
- ssn

## Correlation Tracking

Track requests through multiple services:

1. Client sends request with optional `X-Correlation-ID` header
2. Middleware creates or captures correlation ID
3. Response includes `X-Request-ID` and `X-Correlation-ID` headers
4. All logs include both IDs for tracing
5. Error responses include `errorId` for client reference

Example flow:
```
Client Request:
  X-Correlation-ID: ABC123

Server Response Headers:
  X-Request-ID: REQ-789
  X-Correlation-ID: ABC123

Error Response Body:
  {
    "errorId": "ERR-1234567890-XYZ789",
    "correlationId": "ABC123"
  }
```

## Log Levels

- **info** - General application flow and business events
- **warn** - Security events and slow requests
- **error** - Exceptions and system failures
- **debug** - Performance metrics and detailed operations

## Environment Variables

```env
# Log level (default: info)
LOG_LEVEL=info

# Node environment
NODE_ENV=production
```

## Monitoring and Analysis

Log files are JSON formatted for easy parsing and analysis:

```bash
# Search for errors
grep "ERROR_LOG" logs/errors-*.log

# Find slow requests
grep "SLOW_REQUEST" logs/all-*.log

# Track transaction lifecycle
grep "transactionRef: TX-123456" logs/all-*.log | jq .

# Audit user actions
grep "AUDIT_LOG" logs/all-*.log | grep "userId: 42"
```

## Best Practices

1. **Always include context** - Pass user ID, resource ID, and request details
2. **Use appropriate log types** - Don't log audit events in security logs
3. **Include metadata** - Add relevant information for debugging and analysis
4. **Redact sensitive data** - The system handles this, but be aware of PII
5. **Correlate requests** - Use request/correlation IDs for tracing
6. **Log lifecycle events** - Log all significant state changes
7. **Error IDs for support** - Return error IDs to clients for support reference

## Integration Examples

### In a Service

```typescript
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditService, AuditResource } from './common/logging/audit.service';
import { TransactionLogService } from './common/logging/transaction.service';
import { SecurityService } from './common/logging/security.service';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private paymentRepo: Repository<Payment>,
    private audit: AuditService,
    private txLog: TransactionLogService,
    private security: SecurityService,
  ) {}

  async createPayment(createPaymentDto: CreatePaymentDto, user: any) {
    // Log audit trail
    this.audit.logCreate(
      AuditResource.PAYMENT,
      null,
      { userId: user.id },
      createPaymentDto,
    );

    // Create payment
    const payment = this.paymentRepo.create({
      ...createPaymentDto,
      userId: user.id,
    });
    await this.paymentRepo.save(payment);

    // Log transaction lifecycle
    this.txLog.logInitiated(
      payment.id,
      payment.ref,
      'PAYMENT',
      payment.amount,
      payment.currency,
      { id: user.id },
      { id: payment.recipientId },
    );

    return payment;
  }
}
```

### In a Controller

```typescript
import { Controller, Post, Body, Req } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { RequestContextService } from './common/logging/request-context.service';
import { SecurityService } from './common/logging/security.service';

@Controller('payments')
export class PaymentsController {
  constructor(
    private paymentsService: PaymentsService,
    private requestContext: RequestContextService,
    private security: SecurityService,
  ) {}

  @Post()
  async create(@Body() createPaymentDto: CreatePaymentDto, @Req() req) {
    // Set user context
    this.requestContext.setUserId(req.user.id);

    // Log security event
    this.security.logLoginSuccess(req.user.id, req.user.email, req.ip);

    return this.paymentsService.createPayment(createPaymentDto, req.user);
  }
}
```

## Troubleshooting

### Logs not appearing
- Check LOG_LEVEL environment variable
- Verify logs/ directory has write permissions
- Check Winston configuration in logger.service.ts

### Missing correlation IDs
- Verify RequestContextMiddleware is registered in AppModule
- Check if forRoutes('*') is configured

### Sensitive data appearing in logs
- Review sanitizeBody and sanitizeHeaders in logging.interceptor.ts
- Add field names to sensitiveFields array

### High memory usage
- Check log retention settings (maxFiles)
- Analyze logrotate configuration
- Monitor performance logs frequency
