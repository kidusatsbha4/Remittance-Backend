# Logging Usage Examples for Banking Platform

## Transaction Service Example

```typescript
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction } from './entities/transaction.entity';
import { AuditService, AuditResource } from '../common/logging/audit.service';
import { TransactionLogService } from '../common/logging/transaction.service';
import { SecurityService } from '../common/logging/security.service';
import { PerformanceLogService } from '../common/logging/performance.service';
import { ErrorLogService } from '../common/logging/error.service';
import { RequestContextService } from '../common/logging/request-context.service';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Transaction)
    private repo: Repository<Transaction>,
    private audit: AuditService,
    private txLog: TransactionLogService,
    private security: SecurityService,
    private perfLog: PerformanceLogService,
    private errorLog: ErrorLogService,
    private requestContext: RequestContextService,
  ) {}

  // CREATE TRANSACTION
  async create(data: any, user: any) {
    const txStart = Date.now();

    try {
      // Set context
      this.requestContext.setUserId(user.sub);

      // Create transaction
      const transaction = this.repo.create({
        ...data,
        sender_id: user.sub,
        transaction_ref: 'TX-' + Date.now(),
        status: 'PENDING',
      });

      // Log audit trail
      this.audit.logCreate(
        AuditResource.TRANSACTION,
        transaction.id,
        { userId: user.sub },
        {
          amount: data.amount,
          currency: data.currency,
          recipientId: data.recipient_id,
        },
      );

      const savedTx = await this.repo.save(transaction);

      // Set transaction ID in context for correlation
      this.requestContext.setTransactionId(savedTx.transaction_ref);

      // Log transaction lifecycle
      this.txLog.logInitiated(
        savedTx.id,
        savedTx.transaction_ref,
        'PAYMENT',
        data.amount,
        data.currency,
        { id: user.sub },
        { id: data.recipient_id },
        { source: data.source, description: data.description },
      );

      // Log performance
      const duration = Date.now() - txStart;
      this.perfLog.logRequest(
        '/api/transactions',
        'POST',
        201,
        duration,
        JSON.stringify(data).length,
        JSON.stringify(savedTx).length,
        user.sub,
      );

      return savedTx;
    } catch (error) {
      // Log error
      const errorId = this.errorLog.logException(
        error,
        '/api/transactions',
        'POST',
        500,
        user.sub,
        { body: data },
      );

      throw error;
    }
  }

  // GET ALL WITH PAGINATION
  async findAll(query: any, user: any) {
    const { page = 1, pageSize = 10, status } = query;

    try {
      const qb = this.repo.createQueryBuilder('tx');

      if (status) {
        qb.andWhere('tx.status = :status', { status });
      }

      qb.orderBy('tx.created_at', 'DESC');
      qb.skip((page - 1) * pageSize).take(pageSize);

      const [data, total] = await qb.getManyAndCount();

      return {
        data,
        total,
        page,
        pageSize,
      };
    } catch (error) {
      const errorId = this.errorLog.logDatabaseError(
        '/api/transactions',
        'GET',
        'SELECT * FROM transactions',
        error,
        user.sub,
      );

      throw error;
    }
  }

  // GET ONE
  async findOne(id: number) {
    try {
      const tx = await this.repo.findOne({ where: { id } });

      if (!tx) {
        throw new NotFoundException('Transaction not found');
      }

      // Audit trail for viewing sensitive transaction
      this.audit.log({
        action: 'VIEW' as any,
        resource: AuditResource.TRANSACTION,
        resourceId: id,
        actor: { userId: this.requestContext.getContext()?.userId || 0 },
        status: 'SUCCESS',
      });

      return tx;
    } catch (error) {
      const errorId = this.errorLog.logNotFoundError(
        `/api/transactions/${id}`,
        'GET',
        'Transaction',
      );

      throw error;
    }
  }

  // UPDATE
  async update(id: number, data: any, user: any) {
    try {
      const tx = await this.findOne(id);
      const oldData = { ...tx };

      const updated = this.repo.merge(tx, data);
      const result = await this.repo.save(updated);

      // Log audit trail with changes
      this.audit.logUpdate(
        AuditResource.TRANSACTION,
        id,
        { userId: user.sub },
        oldData,
        data,
        { updateReason: 'Manual correction' },
      );

      // Log transaction status change if applicable
      if (oldData.status !== data.status) {
        this.txLog.log({
          event: 'STATUS_CHANGED' as any,
          transactionId: id,
          transactionRef: result.transaction_ref,
          transactionType: 'PAYMENT',
          amount: result.amount,
          currency: result.currency,
          status: 'SUCCESS' as const,
          metadata: { oldStatus: oldData.status, newStatus: data.status },
        });
      }

      return result;
    } catch (error) {
      const errorId = this.errorLog.logException(
        error,
        `/api/transactions/${id}`,
        'PATCH',
        500,
        user.sub,
      );

      throw error;
    }
  }

  // DELETE
  async remove(id: number, user: any) {
    try {
      const tx = await this.findOne(id);

      // Log deletion audit trail
      this.audit.logDelete(
        AuditResource.TRANSACTION,
        id,
        { userId: user.sub },
        { ...tx },
        { deleteReason: 'System cleanup' },
      );

      await this.repo.delete(id);
    } catch (error) {
      const errorId = this.errorLog.logException(
        error,
        `/api/transactions/${id}`,
        'DELETE',
        500,
        user.sub,
      );

      throw error;
    }
  }

  // MARK SUCCESS
  async markSuccess(id: number, external_ref: string, user: any) {
    try {
      const tx = await this.findOne(id);

      tx.status = 'SUCCESS';
      tx.external_ref = external_ref;
      tx.completed_at = new Date();

      const result = await this.repo.save(tx);

      // Log transaction completion
      this.txLog.logCompleted(
        id,
        tx.transaction_ref,
        external_ref,
        tx.amount,
        { approvedBy: user.sub },
      );

      // Log audit trail
      this.audit.logApproval(
        AuditResource.TRANSACTION,
        id,
        { userId: user.sub },
        'Transaction completed successfully',
      );

      return result;
    } catch (error) {
      const errorId = this.errorLog.logException(
        error,
        `/api/transactions/${id}/mark-success`,
        'PATCH',
        500,
        user.sub,
      );

      throw error;
    }
  }

  // MARK FAILED
  async markFailed(id: number, reason: string, user: any) {
    try {
      const tx = await this.findOne(id);

      tx.status = 'FAILED';
      tx.failure_reason = reason;

      const result = await this.repo.save(tx);

      // Log transaction failure
      this.txLog.logFailed(
        id,
        tx.transaction_ref,
        reason,
        'TXN_FAILED',
        { failedBy: user.sub },
      );

      // Log audit trail
      this.audit.logRejection(
        AuditResource.TRANSACTION,
        id,
        { userId: user.sub },
        reason,
      );

      return result;
    } catch (error) {
      const errorId = this.errorLog.logException(
        error,
        `/api/transactions/${id}/mark-failed`,
        'PATCH',
        500,
        user.sub,
      );

      throw error;
    }
  }

  // REVERSE TRANSACTION
  async reverse(id: number, reason: string, user: any) {
    try {
      const tx = await this.findOne(id);

      if (tx.status !== 'SUCCESS') {
        throw new Error('Only successful transactions can be reversed');
      }

      const oldStatus = tx.status;
      tx.status = 'REVERSED';
      tx.reversal_reason = reason;
      tx.reversed_at = new Date();

      const result = await this.repo.save(tx);

      // Log transaction reversal
      this.txLog.logReversed(
        id,
        tx.transaction_ref,
        tx.external_ref || '',
        reason,
        { reversedBy: user.sub },
      );

      // Log audit trail
      this.audit.logReversal(
        AuditResource.TRANSACTION,
        id,
        { userId: user.sub, email: user.email },
        reason,
        { originalStatus: oldStatus },
      );

      return result;
    } catch (error) {
      const errorId = this.errorLog.logException(
        error,
        `/api/transactions/${id}/reverse`,
        'POST',
        500,
        user.sub,
      );

      throw error;
    }
  }

  // REFUND TRANSACTION
  async refund(id: number, refundAmount: number, reason: string, user: any) {
    try {
      const tx = await this.findOne(id);

      if (refundAmount > tx.amount) {
        throw new Error('Refund amount cannot exceed transaction amount');
      }

      // Update transaction
      tx.status = 'REFUNDED';
      tx.refund_amount = refundAmount;
      tx.refund_reason = reason;
      tx.refunded_at = new Date();

      const result = await this.repo.save(tx);

      // Log transaction refund
      this.txLog.logRefunded(
        id,
        tx.transaction_ref,
        tx.external_ref || '',
        refundAmount,
        reason,
        { refundedBy: user.sub },
      );

      // Log audit trail
      this.audit.logReversal(
        AuditResource.PAYMENT,
        id,
        { userId: user.sub, email: user.email },
        `Refund of ${refundAmount} ${tx.currency}`,
        { refundReason: reason },
      );

      return result;
    } catch (error) {
      const errorId = this.errorLog.logException(
        error,
        `/api/transactions/${id}/refund`,
        'POST',
        500,
        user.sub,
      );

      throw error;
    }
  }

  // USER TRANSACTIONS
  async myTransactions(user: any) {
    try {
      this.requestContext.setUserId(user.sub);

      const transactions = await this.repo.find({
        where: { sender_id: user.sub },
        order: { created_at: 'DESC' },
      });

      return transactions;
    } catch (error) {
      const errorId = this.errorLog.logException(
        error,
        '/api/transactions/my',
        'GET',
        500,
        user.sub,
      );

      throw error;
    }
  }
}
```

## Payment Controller Example

```typescript
import { Controller, Post, Body, Req, Get, Param, Patch, Delete } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { SecurityService } from '../common/logging/security.service';
import { RequestContextService } from '../common/logging/request-context.service';
import { CreatePaymentDto } from './dto/create-payment.dto';

@Controller('payments')
export class PaymentsController {
  constructor(
    private paymentsService: PaymentsService,
    private security: SecurityService,
    private requestContext: RequestContextService,
  ) {}

  @Post()
  async create(@Body() createPaymentDto: CreatePaymentDto, @Req() req) {
    // Set context
    this.requestContext.setUserId(req.user.sub);

    // Log security event - payment initiation
    this.security.logLoginSuccess(
      req.user.sub,
      req.user.email,
      req.ip,
      req.headers['user-agent'],
    );

    return this.paymentsService.createPayment(createPaymentDto, req.user);
  }

  @Get()
  async findAll(@Req() req) {
    this.requestContext.setUserId(req.user.sub);
    return this.paymentsService.findAll(req.query, req.user);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req) {
    this.requestContext.setUserId(req.user.sub);
    return this.paymentsService.findOne(+id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updatePaymentDto: any,
    @Req() req,
  ) {
    this.requestContext.setUserId(req.user.sub);
    return this.paymentsService.update(+id, updatePaymentDto, req.user);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req) {
    this.requestContext.setUserId(req.user.sub);
    return this.paymentsService.remove(+id, req.user);
  }

  @Post(':id/approve')
  async approve(
    @Param('id') id: string,
    @Body() body: { reason?: string },
    @Req() req,
  ) {
    this.requestContext.setUserId(req.user.sub);
    return this.paymentsService.approve(+id, body.reason, req.user);
  }

  @Post(':id/reject')
  async reject(
    @Param('id') id: string,
    @Body() body: { reason: string },
    @Req() req,
  ) {
    this.requestContext.setUserId(req.user.sub);
    return this.paymentsService.reject(+id, body.reason, req.user);
  }

  @Post(':id/reverse')
  async reverse(
    @Param('id') id: string,
    @Body() body: { reason: string },
    @Req() req,
  ) {
    this.requestContext.setUserId(req.user.sub);
    return this.paymentsService.reverse(+id, body.reason, req.user);
  }
}
```

## Authorization Guard with Logging

```typescript
import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { SecurityService } from '../common/logging/security.service';
import { RequestContextService } from '../common/logging/request-context.service';

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(
    private security: SecurityService,
    private requestContext: RequestContextService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const requiredPermission = context.getHandler().name;

    if (!user.permissions?.includes(requiredPermission)) {
      // Log unauthorized access attempt
      this.security.logPermissionDenied(
        user.sub,
        context.getClass().name,
        requiredPermission,
        request.ip,
      );

      throw new ForbiddenException(`Missing permission: ${requiredPermission}`);
    }

    return true;
  }
}
```

## Tips

1. **Always set user context** - Call `requestContext.setUserId()` early in request
2. **Log lifecycle events** - Log all state transitions (PENDING → PROCESSING → COMPLETED)
3. **Include metadata** - Add context about why actions were taken
4. **Use appropriate services** - Don't mix audit logs with security logs
5. **Correlate operations** - Set transactionId for tracking complex operations
6. **Handle errors gracefully** - Always log exceptions before throwing
7. **Return error IDs** - Include errorId in error responses for support
