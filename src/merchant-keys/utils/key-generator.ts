import { randomUUID } from 'crypto';

export function generateSecretKey() {
  return randomUUID(); // like: 10drc1d6-a701-4854...
}

export function generateAccessKey() {
  return Buffer.from(randomUUID()).toString('base64'); // like encrypted token
}