import { Injectable } from '@nestjs/common';
import { logger } from './logger';
import { RequestContextService } from './request-context.service';

export enum AuditAction {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  APPROVE = 'APPROVE',
  REJECT = 'REJECT',
  REVERSE = 'REVERSE',
  EXPORT = 'EXPORT',
  IMPORT = 'IMPORT',
  VIEW = 'VIEW',
  DOWNLOAD = 'DOWNLOAD',
}

export enum AuditResource {
  USER = 'USER',
  MERCHANT = 'MERCHANT',
  KYC = 'KYC',
  TRANSACTION = 'TRANSACTION',
  PAYMENT = 'PAYMENT',
  INTERNAL_TRANSFER = 'INTERNAL_TRANSFER',
  BONUS = 'BONUS',
  CASH_PICKUP = 'CASH_PICKUP',
  MERCHANT_KEY = 'MERCHANT_KEY',
  SETTLEMENT = 'SETTLEMENT',
}

export interface AuditLog {
  action: AuditAction;
  resource: AuditResource;
  resourceId: string | number;
  actor: {
    userId: number;
    role?: string;
    email?: string;
  };
  changes?: Record<string, { before: any; after: any }>;
  metadata?: Record<string, any>;
  status: 'SUCCESS' | 'FAILURE';
  reason?: string;
}

@Injectable()
export class AuditService {
  constructor(private requestContext: RequestContextService) {}

  log(auditLog: AuditLog): void {
    const context = this.requestContext.getMetadata();

    logger.info('AUDIT_LOG', {
      ...auditLog,
      ...context,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
    });
  }

  logCreate(
    resource: AuditResource,
    resourceId: string | number,
    actor: { userId: number; role?: string; email?: string },
    data: Record<string, any>,
    metadata?: Record<string, any>,
  ): void {
    this.log({
      action: AuditAction.CREATE,
      resource,
      resourceId,
      actor,
      changes: this.formatChanges({}, data),
      metadata,
      status: 'SUCCESS',
    });
  }

  logUpdate(
    resource: AuditResource,
    resourceId: string | number,
    actor: { userId: number; role?: string; email?: string },
    oldData: Record<string, any>,
    newData: Record<string, any>,
    metadata?: Record<string, any>,
  ): void {
    this.log({
      action: AuditAction.UPDATE,
      resource,
      resourceId,
      actor,
      changes: this.formatChanges(oldData, newData),
      metadata,
      status: 'SUCCESS',
    });
  }

  logDelete(
    resource: AuditResource,
    resourceId: string | number,
    actor: { userId: number; role?: string; email?: string },
    data: Record<string, any>,
    metadata?: Record<string, any>,
  ): void {
    this.log({
      action: AuditAction.DELETE,
      resource,
      resourceId,
      actor,
      changes: this.formatChanges(data, {}),
      metadata,
      status: 'SUCCESS',
    });
  }

  logApproval(
    resource: AuditResource,
    resourceId: string | number,
    actor: { userId: number; role?: string; email?: string },
    reason?: string,
    metadata?: Record<string, any>,
  ): void {
    this.log({
      action: AuditAction.APPROVE,
      resource,
      resourceId,
      actor,
      reason,
      metadata,
      status: 'SUCCESS',
    });
  }

  logRejection(
    resource: AuditResource,
    resourceId: string | number,
    actor: { userId: number; role?: string; email?: string },
    reason: string,
    metadata?: Record<string, any>,
  ): void {
    this.log({
      action: AuditAction.REJECT,
      resource,
      resourceId,
      actor,
      reason,
      metadata,
      status: 'SUCCESS',
    });
  }

  logReversal(
    resource: AuditResource,
    resourceId: string | number,
    actor: { userId: number; role?: string; email?: string },
    reason: string,
    metadata?: Record<string, any>,
  ): void {
    this.log({
      action: AuditAction.REVERSE,
      resource,
      resourceId,
      actor,
      reason,
      metadata,
      status: 'SUCCESS',
    });
  }

  logFailure(
    action: AuditAction,
    resource: AuditResource,
    resourceId: string | number,
    actor: { userId: number; role?: string; email?: string },
    reason: string,
    metadata?: Record<string, any>,
  ): void {
    this.log({
      action,
      resource,
      resourceId,
      actor,
      reason,
      metadata,
      status: 'FAILURE',
    });
  }

  private formatChanges(
    oldData: Record<string, any>,
    newData: Record<string, any>,
  ): Record<string, { before: any; after: any }> {
    const changes: Record<string, { before: any; after: any }> = {};
    const allKeys = new Set([...Object.keys(oldData), ...Object.keys(newData)]);

    for (const key of allKeys) {
      if (oldData[key] !== newData[key]) {
        changes[key] = {
          before: oldData[key],
          after: newData[key],
        };
      }
    }

    return changes;
  }
}
