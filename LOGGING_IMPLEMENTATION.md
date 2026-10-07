# Multi-Service Logging Implementation

## Overview

I've implemented a comprehensive, production-grade logging architecture for your remittance banking platform. This system separates logging concerns into specialized services, each handling a specific type of log event.

## What's Been Implemented

### 1. **Winston Logger Configuration**
- **File:** `src/common/logging/logger.ts`
- Daily rotating log files (logs rotated by date)
- Separate logs for all events and errors
- JSON format for structured logging
- Automatic log retention (14 days for all logs, 30 days for errors)

### 2. **Seven Specialized Logging Services**

#### Request Context Service
- **File:** `src/common/logging/request-context.service.ts`
- Manages `requestId` and `correlationId` for request tracking
- Generates unique IDs automatically
- Stores user, merchant, and transaction context
- Uses Node.js AsyncLocalStorage for request-scoped storage

#### Audit Service
- **File:** `src/common/logging/audit.service.ts`
- Logs business actions: CREATE, UPDATE, DELETE, APPROVE, REJECT, REVERSE
- Tracks who performed what action on which resource
- Captures before/after changes for updates
- Ideal for compliance and user action tracking

#### Security Service
- **File:** `src/common/logging/security.service.ts`
- Tracks authentication events (login success/failure)
- Logs JWT token operations
- Records OTP generation and verification
- Logs permission denials and suspicious activity
- Includes risk level classification (LOW, MEDIUM, HIGH, CRITICAL)

#### Transaction Service
- **File:** `src/common/logging/transaction.service.ts`
- Tracks payment lifecycle: INITIATED → VERIFIED → PROCESSING → COMPLETED/FAILED
- Logs transaction status changes
- Tracks refunds and reversals
- Records settlement events

#### Integration Service
- **File:** `src/common/logging/integration.service.ts`
- Logs external API calls (CyberSource, Visa Direct, Core Banking)
- Tracks request/response timing and status codes
- Logs retry attempts
- Handles webhook received and processed events

#### Performance Service
- **File:** `src/common/logging/performance.service.ts`
- Measures request duration and identifies slow requests
- Logs database query performance
- Tracks cache operations
- Monitors memory usage
- Configurable thresholds (1s for slow, 5s for critical)

#### Error Service
- **File:** `src/common/logging/error.service.ts`
- Generates unique error IDs for support reference
- Logs all exceptions with full context
- Categorizes errors (validation, database, auth, external service, etc.)
- Redacts sensitive data automatically

### 3. **Global Middleware & Interceptors**

#### Request Context Middleware
- **File:** `src/common/logging/request-context.middleware.ts`
- Automatically captures request context on every request
- Generates/captures correlation IDs
- Stores client IP and user agent

#### Logging Interceptor
- **File:** `src/common/logging/logging.interceptor.ts`
- Measures request duration
- Logs performance metrics
- Captures request/response sizes
- Automatically redacts sensitive data

#### Global Exception Filter
- **File:** `src/common/logging/global-exception.filter.ts`
- Catches all unhandled exceptions
- Logs errors with unique error IDs
- Returns standardized error responses

### 4. **Logging Module**
- **File:** `src/common/logging/logging.module.ts`
- Global module providing all logging services
- Automatically available in all modules

### 5. **Integration Points**

#### Updated `main.ts`
- Registered logging services
- Applied global interceptors and filters
- Middleware integration

#### Updated `app.module.ts`
- Imported LoggingModule
- Registered RequestContextMiddleware

## File Structure

```
src/common/logging/
├── logger.ts                      # Winston configuration
├── request-context.service.ts     # Request context management
├── request-context.middleware.ts  # Middleware for request context
├── audit.service.ts              # Business action logging
├── security.service.ts           # Auth/security logging
├── transaction.service.ts        # Transaction lifecycle logging
├── integration.service.ts        # External API logging
├── performance.service.ts        # Performance metrics
├── error.service.ts              # Exception logging
├── logging.interceptor.ts        # Global request interceptor
├── global-exception.filter.ts    # Global exception filter
├── logging.module.ts             # Module exports
├── LOGGING_GUIDE.md              # Comprehensive guide
└── USAGE_EXAMPLE.md              # Code examples
```

## Log Files Location

Logs are stored in the `logs/` directory:
- `logs/all-YYYY-MM-DD.log` - All logs (rotates daily, kept 14 days)
- `logs/errors-YYYY-MM-DD.log` - Error logs only (rotates daily, kept 30 days)

## How to Use

### 1. Inject Services Where Needed

```typescript
constructor(
  private audit: AuditService,
  private security: SecurityService,
  private txLog: TransactionLogService,
  private errorLog: ErrorLogService,
  private requestContext: RequestContextService,
) {}
```

### 2. Log Audit Actions

```typescript
this.audit.logCreate(
  AuditResource.TRANSACTION,
  transactionId,
  { userId: user.sub, email: user.email },
  { amount: 1000, currency: 'USD' },
);
```

### 3. Log Security Events

```typescript
this.security.logLoginSuccess(userId, email, ipAddress, userAgent);
this.security.logPermissionDenied(userId, 'TRANSACTION', 'REVERSE', ipAddress);
```

### 4. Log Transaction Lifecycle

```typescript
this.txLog.logInitiated(txId, txRef, 'PAYMENT', 1000, 'USD', sender, recipient);
this.txLog.logCompleted(txId, txRef, externalRef, 1000);
this.txLog.logFailed(txId, txRef, 'Insufficient funds', 'INSUFFICIENT_BALANCE');
```

### 5. Log Integration Events

```typescript
this.intLog.logRequestSent('CyberSource', '/transaction', 'POST', requestId, payload);
this.intLog.logResponseReceived('CyberSource', '/transaction', 'POST', requestId, 200, duration, response);
```

### 6. Log Errors with Unique IDs

```typescript
try {
  // Some operation
} catch (error) {
  const errorId = this.errorLog.logException(error, path, method, 500, userId);
  // Return errorId to client for support reference
}
```

## Key Features

✅ **Automatic Request Tracking** - Every request gets a unique ID and correlation ID
✅ **Request-Scoped Context** - User, transaction, and request data available everywhere
✅ **Sensitive Data Redaction** - Passwords, tokens, credit cards automatically redacted
✅ **Production-Ready** - Structured JSON logs for analysis and monitoring
✅ **Error IDs for Support** - Each error gets a unique reference for customer support
✅ **Performance Monitoring** - Automatic slow request detection
✅ **Audit Trail** - Complete audit history for compliance
✅ **Security Events** - Authentication, authorization, and suspicious activity tracking
✅ **Transaction Lifecycle** - Payment journey tracking
✅ **Integration Monitoring** - External API call tracking

## Environment Variables

```env
# Set log level (default: info)
LOG_LEVEL=info

# Node environment
NODE_ENV=production
```

## Integration with Existing Code

The logging is automatically applied globally:

1. **Automatic Performance Logging** - LoggingInterceptor captures all request metrics
2. **Automatic Error Logging** - GlobalExceptionFilter logs all exceptions
3. **Automatic Context** - RequestContextMiddleware sets request context
4. **Manual Audit Logging** - Call AuditService for business events

No changes needed to existing endpoints - logging works automatically!

## Next Steps

1. **Update Services** - Inject logging services and add audit/security logs
2. **Add to Controllers** - Log important events (login, payment, approvals)
3. **Update Guards** - Add security logging to permission checks
4. **Monitor Logs** - Set up log aggregation/monitoring (ELK, Datadog, etc.)
5. **Set Alerts** - Alert on errors, suspicious activity, slow requests

## Documentation Files

- **LOGGING_GUIDE.md** - Complete reference with all services and methods
- **USAGE_EXAMPLE.md** - Transaction and Payment service examples
- **LOGGING_IMPLEMENTATION.md** - This file

## Support & Monitoring

### Querying Logs

```bash
# Find all errors
grep "ERROR_LOG" logs/errors-*.log

# Find slow requests
grep "SLOW_REQUEST" logs/all-*.log

# Track transaction by ref
grep "TX-123456" logs/all-*.log

# Parse JSON logs
cat logs/all-*.log | jq 'select(.level=="error")'
```

### Log Aggregation Ready

The JSON format makes it easy to integrate with:
- ELK Stack (Elasticsearch, Logstash, Kibana)
- Datadog
- Splunk
- CloudWatch
- Any JSON-capable log aggregation service

## Architecture Benefits

✅ **Separation of Concerns** - Each logging type has its own service
✅ **Scalability** - Easy to add new log types
✅ **Maintainability** - Clear, organized code structure
✅ **Compliance** - Audit trails for banking regulations
✅ **Debugging** - Correlation IDs trace requests across services
✅ **Performance** - Identify bottlenecks automatically
✅ **Security** - Track all auth/authorization events

## TypeScript Support

All services are fully typed with TypeScript:
- Enums for log types and events
- Interfaces for log structures
- Type-safe method signatures

## Build Status

✅ Project builds successfully with no TypeScript errors
✅ All logging services compiled to dist/
✅ Ready for deployment

---

For detailed usage examples, see `USAGE_EXAMPLE.md`
For complete API reference, see `LOGGING_GUIDE.md`
