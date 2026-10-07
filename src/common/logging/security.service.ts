import { Injectable } from '@nestjs/common';
import { logger } from './logger';
import { RequestContextService } from './request-context.service';

export enum SecurityEvent {
  LOGIN_SUCCESS = 'LOGIN_SUCCESS',
  LOGIN_FAILURE = 'LOGIN_FAILURE',
  LOGOUT = 'LOGOUT',
  TOKEN_GENERATED = 'TOKEN_GENERATED',
  TOKEN_REFRESHED = 'TOKEN_REFRESHED',
  TOKEN_INVALID = 'TOKEN_INVALID',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  OTP_GENERATED = 'OTP_GENERATED',
  OTP_VERIFIED = 'OTP_VERIFIED',
  OTP_FAILED = 'OTP_FAILED',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  UNAUTHORIZED_ACCESS = 'UNAUTHORIZED_ACCESS',
  SUSPICIOUS_ACTIVITY = 'SUSPICIOUS_ACTIVITY',
  PASSWORD_CHANGED = 'PASSWORD_CHANGED',
  PASSWORD_RESET = 'PASSWORD_RESET',
  MFA_ENABLED = 'MFA_ENABLED',
  MFA_DISABLED = 'MFA_DISABLED',
  API_KEY_GENERATED = 'API_KEY_GENERATED',
  API_KEY_REVOKED = 'API_KEY_REVOKED',
}

export interface SecurityLog {
  event: SecurityEvent;
  userId?: number;
  email?: string;
  ipAddress: string;
  userAgent?: string;
  status: 'SUCCESS' | 'FAILURE';
  reason?: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  metadata?: Record<string, any>;
}

@Injectable()
export class SecurityService {
  constructor(private requestContext: RequestContextService) {}

  log(securityLog: SecurityLog): void {
    const context = this.requestContext.getMetadata();

    logger.warn('SECURITY_EVENT', {
      ...securityLog,
      ...context,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
    });
  }

  logLoginSuccess(
    userId: number,
    email: string,
    ipAddress: string,
    userAgent?: string,
  ): void {
    this.log({
      event: SecurityEvent.LOGIN_SUCCESS,
      userId,
      email,
      ipAddress,
      userAgent,
      status: 'SUCCESS',
      riskLevel: 'LOW',
    });
  }

  logLoginFailure(
    email: string,
    ipAddress: string,
    reason: string,
    userAgent?: string,
  ): void {
    this.log({
      event: SecurityEvent.LOGIN_FAILURE,
      email,
      ipAddress,
      userAgent,
      status: 'FAILURE',
      reason,
      riskLevel: 'MEDIUM',
    });
  }

  logLogout(userId: number, ipAddress: string): void {
    this.log({
      event: SecurityEvent.LOGOUT,
      userId,
      ipAddress,
      status: 'SUCCESS',
      riskLevel: 'LOW',
    });
  }

  logTokenGenerated(userId: number, ipAddress: string): void {
    this.log({
      event: SecurityEvent.TOKEN_GENERATED,
      userId,
      ipAddress,
      status: 'SUCCESS',
      riskLevel: 'LOW',
    });
  }

  logTokenRefreshed(userId: number, ipAddress: string): void {
    this.log({
      event: SecurityEvent.TOKEN_REFRESHED,
      userId,
      ipAddress,
      status: 'SUCCESS',
      riskLevel: 'LOW',
    });
  }

  logTokenInvalid(userId: number | undefined, ipAddress: string): void {
    this.log({
      event: SecurityEvent.TOKEN_INVALID,
      userId,
      ipAddress,
      status: 'FAILURE',
      riskLevel: 'MEDIUM',
    });
  }

  logTokenExpired(userId: number, ipAddress: string): void {
    this.log({
      event: SecurityEvent.TOKEN_EXPIRED,
      userId,
      ipAddress,
      status: 'FAILURE',
      riskLevel: 'LOW',
    });
  }

  logOtpGenerated(userId: number, ipAddress: string, method: string): void {
    this.log({
      event: SecurityEvent.OTP_GENERATED,
      userId,
      ipAddress,
      status: 'SUCCESS',
      riskLevel: 'LOW',
      metadata: { method },
    });
  }

  logOtpVerified(userId: number, ipAddress: string, method: string): void {
    this.log({
      event: SecurityEvent.OTP_VERIFIED,
      userId,
      ipAddress,
      status: 'SUCCESS',
      riskLevel: 'LOW',
      metadata: { method },
    });
  }

  logOtpFailed(userId: number | undefined, ipAddress: string, reason: string): void {
    this.log({
      event: SecurityEvent.OTP_FAILED,
      userId,
      ipAddress,
      status: 'FAILURE',
      reason,
      riskLevel: 'MEDIUM',
    });
  }

  logPermissionDenied(
    userId: number,
    resource: string,
    action: string,
    ipAddress: string,
  ): void {
    this.log({
      event: SecurityEvent.PERMISSION_DENIED,
      userId,
      ipAddress,
      status: 'FAILURE',
      reason: `Access denied to ${resource}:${action}`,
      riskLevel: 'MEDIUM',
      metadata: { resource, action },
    });
  }

  logUnauthorizedAccess(
    ipAddress: string,
    resource: string,
    reason?: string,
  ): void {
    this.log({
      event: SecurityEvent.UNAUTHORIZED_ACCESS,
      ipAddress,
      status: 'FAILURE',
      reason: reason || `Attempted unauthorized access to ${resource}`,
      riskLevel: 'HIGH',
      metadata: { resource },
    });
  }

  logSuspiciousActivity(
    userId: number | undefined,
    ipAddress: string,
    activityType: string,
    reason: string,
  ): void {
    this.log({
      event: SecurityEvent.SUSPICIOUS_ACTIVITY,
      userId,
      ipAddress,
      status: 'FAILURE',
      reason,
      riskLevel: 'HIGH',
      metadata: { activityType },
    });
  }

  logPasswordChanged(userId: number, ipAddress: string): void {
    this.log({
      event: SecurityEvent.PASSWORD_CHANGED,
      userId,
      ipAddress,
      status: 'SUCCESS',
      riskLevel: 'MEDIUM',
    });
  }

  logPasswordReset(email: string, ipAddress: string): void {
    this.log({
      event: SecurityEvent.PASSWORD_RESET,
      email,
      ipAddress,
      status: 'SUCCESS',
      riskLevel: 'MEDIUM',
    });
  }

  logMfaEnabled(userId: number, ipAddress: string): void {
    this.log({
      event: SecurityEvent.MFA_ENABLED,
      userId,
      ipAddress,
      status: 'SUCCESS',
      riskLevel: 'LOW',
    });
  }

  logMfaDisabled(userId: number, ipAddress: string): void {
    this.log({
      event: SecurityEvent.MFA_DISABLED,
      userId,
      ipAddress,
      status: 'SUCCESS',
      riskLevel: 'MEDIUM',
    });
  }

  logApiKeyGenerated(userId: number, ipAddress: string): void {
    this.log({
      event: SecurityEvent.API_KEY_GENERATED,
      userId,
      ipAddress,
      status: 'SUCCESS',
      riskLevel: 'LOW',
    });
  }

  logApiKeyRevoked(userId: number, ipAddress: string): void {
    this.log({
      event: SecurityEvent.API_KEY_REVOKED,
      userId,
      ipAddress,
      status: 'SUCCESS',
      riskLevel: 'LOW',
    });
  }
}
