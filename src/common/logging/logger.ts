import * as winston from 'winston';
import 'winston-daily-rotate-file';

const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
);

// All logs transport
const allLogsTransport = new winston.transports.DailyRotateFile({
  filename: 'logs/all-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  maxSize: '20m',
  maxFiles: '14d',
});

// Error logs transport
const errorLogsTransport = new winston.transports.DailyRotateFile({
  filename: 'logs/errors-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  level: 'error',
  maxSize: '20m',
  maxFiles: '30d',
});

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  defaultMeta: { service: 'remittance-service' },
  transports: [allLogsTransport, errorLogsTransport],
});
