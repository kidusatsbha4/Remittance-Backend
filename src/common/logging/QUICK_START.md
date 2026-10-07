# Logging Quick Start Guide

## Installation Complete ✅

All logging services are installed and integrated globally.

## Most Common Use Cases

### 1. Log User Login

```typescript
import { SecurityService } from '../common/logging/security.service';

constructor(private security: SecurityService) {}

// After successful login
this.security.logLoginSuccess(
  userId,
  userEmail,
  request.ip,
  request.headers['user-agent']
);
```

### 2. Log Transaction Creation

```typescript
import { TransactionLogService } from '../common/logging/transaction.service';
import { AuditService, AuditResource } from '../common/logging/audit.service';

constructor(
  private txLog: TransactionLogService,
  private audit: AuditService,
) {}

// When creating payment
this.txLog.logInitiated(
  txId,
  txRef,
  'PAYMENT',
  amount,
  currency,
  { id: senderId },
  { id: recipientId },
);

// Audit trail
this.audit.logCreate(
  AuditResource.PAYMENT,
  txId,
  { userId: user.sub },
  { amount, currency },
);
```

### 3. Log Transaction Completion

```typescript
// When payment succeeds
this.txLog.logCompleted(txId, txRef, externalRef, amount);

// When payment fails
this.txLog.logFailed(txId, txRef, 'Declined', 'CARD_DECLINED');
```

### 4. Log Approval/Rejection

```typescript
// When approving
this.audit.logApproval(
  AuditResource.TRANSACTION,
  txId,
  { userId: approverId },
  'High-value transaction approved',
);

// When rejecting
this.audit.logRejection(
  AuditResource.TRANSACTION,
  txId,
  { userId: approverId },
  'Insufficient documentation',
);
```

### 5. Log Permissions Denied

```typescript
this.security.logPermissionDenied(
  userId,
  'TRANSACTION',
  'REVERSE',
  request.ip,
);
```

### 6. Log External API Calls

```typescript
import { IntegrationLogService } from '../common/logging/integration.service';

constructor(private intLog: IntegrationLogService) {}

const start = Date.now();
const response = await axios.post('https://api.cybersource.com/...');
const duration = Date.now() - start;

this.intLog.logResponseReceived(
  'CyberSource',
  '/payments',
  'POST',
  requestId,
  response.status,
  duration,
  response.data,
);
```

### 7. Log Errors (Automatic + Manual)

```typescript
// Errors are logged automatically by GlobalExceptionFilter
// But you can also log manually with error ID

try {
  // Some operation
} catch (error) {
  const errorId = this.errorLog.logException(
    error,
    '/api/transactions',
    'POST',
    500,
    userId,
  );
  
  // Return error ID to client
  throw new InternalServerErrorException({
    message: 'Transaction failed',
    errorId, // Client can use this for support tickets
  });
}
```

## Accessing Context Anywhere

```typescript
import { RequestContextService } from '../common/logging/request-context.service';

constructor(private requestContext: RequestContextService) {}

// Get current request ID
const requestId = this.requestContext.getRequestId();

// Get correlation ID
const correlationId = this.requestContext.getCorrelationId();

// Set transaction ID (tracks complex operations)
this.requestContext.setTransactionId('TXN-123456');

// Get all context
const context = this.requestContext.getMetadata();
// { requestId, correlationId, userId, transactionId, ... }
```

## Service Injection Cheat Sheet

```typescript
// In any service constructor:
constructor(
  // Business audit logging
  private audit: AuditService,
  
  // Authentication/authorization events
  private security: SecurityService,
  
  // Payment/remittance lifecycle
  private txLog: TransactionLogService,
  
  // CyberSource, Visa Direct, etc.
  private intLog: IntegrationLogService,
  
  // Request duration, slow queries
  private perfLog: PerformanceLogService,
  
  // Exceptions with error IDs
  private errorLog: ErrorLogService,
  
  // Request tracking and context
  private requestContext: RequestContextService,
) {}
```

## Enum Quick Reference

### Audit Actions
```typescript
AuditAction.CREATE      // Creating new resource
AuditAction.UPDATE      // Modifying existing resource
AuditAction.DELETE      // Deleting resource
AuditAction.APPROVE     // Approving (e.g., transaction)
AuditAction.REJECT      // Rejecting
AuditAction.REVERSE     // Reversing (e.g., payment)
```

### Audit Resources
```typescript
AuditResource.USER
AuditResource.MERCHANT
AuditResource.KYC
AuditResource.TRANSACTION
AuditResource.PAYMENT
AuditResource.INTERNAL_TRANSFER
AuditResource.SETTLEMENT
```

### Security Events
```typescript
SecurityEvent.LOGIN_SUCCESS
SecurityEvent.LOGIN_FAILURE
SecurityEvent.PERMISSION_DENIED
SecurityEvent.UNAUTHORIZED_ACCESS
SecurityEvent.SUSPICIOUS_ACTIVITY
SecurityEvent.PASSWORD_CHANGED
SecurityEvent.MFA_ENABLED
```

### Transaction Lifecycle Events
```typescript
TransactionLifecycleEvent.INITIATED
TransactionLifecycleEvent.VERIFIED
TransactionLifecycleEvent.PROCESSING
TransactionLifecycleEvent.COMPLETED
TransactionLifecycleEvent.FAILED
TransactionLifecycleEvent.REFUNDED
TransactionLifecycleEvent.REVERSED
```

## Response Headers (Automatic)

Every response includes:
```
X-Request-ID: REQ-789-XYZ...    // Unique request ID
X-Correlation-ID: ABC123...     // For tracking related requests
```

## Error Response Format

All errors include an error ID for support:

```json
{
  "statusCode": 500,
  "message": "Internal server error",
  "errorCode": "INTERNAL_ERROR",
  "errorId": "ERR-1693485949123-ABC789",  // Give this to support
  "timestamp": "2024-07-14T10:30:45.123Z",
  "path": "/api/transactions"
}
```

## Tips

✅ Always set user context early: `this.requestContext.setUserId(user.sub)`
✅ Set transaction ID for complex workflows: `this.requestContext.setTransactionId(txId)`
✅ Include metadata: `{ reason: 'manual_correction', approvedBy: userId }`
✅ Use descriptive messages: `'High-value transaction requires approval'`
✅ Return error IDs to clients for support reference

## Files to Update

Once comfortable with logging, update:

1. **Authentication Module** - Add security event logging
2. **Transactions Service** - Add transaction lifecycle logging
3. **Payments Service** - Add payment events
4. **Internal Transfer Service** - Add transfer logging
5. **KYC Service** - Add KYC approval/rejection
6. **Authorization Guards** - Add permission denied logging
7. **Integration Services** - Add external API logging

## Testing Logs

```bash
# Watch logs in real-time
tail -f logs/all-*.log

# Search for transactions
grep "TRANSACTION_LOG" logs/all-*.log | head -20

# Parse JSON
cat logs/all-*.log | jq '.message' | grep "FAILED"

# Find errors for a user
grep '"userId": 42' logs/all-*.log
```

## Production Checklist

- [ ] Update authentication to use SecurityService
- [ ] Update transaction services to use TransactionLogService
- [ ] Update payment services to use TransactionLogService
- [ ] Add logging to authorization guards
- [ ] Add logging to integration services
- [ ] Set up log aggregation (ELK, Datadog, etc.)
- [ ] Create monitoring alerts for errors
- [ ] Create monitoring alerts for slow requests
- [ ] Document error codes for support team
- [ ] Train team on using error IDs for support tickets

## More Information

- **Full Guide**: `src/common/logging/LOGGING_GUIDE.md`
- **Code Examples**: `src/common/logging/USAGE_EXAMPLE.md`
- **Implementation Details**: `LOGGING_IMPLEMENTATION.md`
