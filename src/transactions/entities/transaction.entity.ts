// src/transactions/entities/transaction.entity.ts

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

import { User } from '../../users/entities/user.entity';

@Entity('transactions')
export class Transaction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  transaction_ref: string;

  // ✅ FOREIGN KEY RELATION
  @ManyToOne(() => User, { eager: true }) // eager = auto fetch user
  @JoinColumn({ name: 'sender_id' })
  sender: User;

  // ✅ Optional: keep raw ID (recommended for performance)
  @Column()
  sender_id: number;

  @Column()
  beneficiary_acc: string;

  @Column('decimal', { precision: 18, scale: 2 })
  amount: number;

  @Column({ default: 'ETB' })
  currency: string;

  @Column('decimal', { precision: 18, scale: 6, nullable: true })
  exchange_rate: number;

  @Column({ default: 'PENDING' })
  status: string;

  @Column({ nullable: true })
  channel: string;

  @Column({ nullable: true })
  external_ref: string;

  @Column({ nullable: true, type: 'text' })
  failure_reason: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @Column({ nullable: true })
  completed_at: Date;
}