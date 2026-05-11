import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('manuals')
export class Manual {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  toAccount: string;

  @Column()
  toAccountHolder: string;

  @Column()
  currency: string;

  @Column()
  toCurrency: string;

  @Column('decimal', { precision: 18, scale: 2 })
  amount: number;

  @Column('decimal', { precision: 18, scale: 2 })
  bonus: number;


  @Column({ nullable: true })
  remark: string;

  @Column({ nullable: true })
  eCurrency: string;

  @Column('decimal', { precision: 18, scale: 6, nullable: true })
  exchange_rate: number;

  @Column({ default: 'pending' })
  status: string;

  @Column({ nullable: true })
  channel: string;

  @Column({ nullable: true })
  external_ref: string;

  // ✅ SENDER RELATION
  @ManyToOne(() => User, (user) => user.sentManuals)
  @JoinColumn({ name: 'sender_id' }) // 👈 DB column name
  sender_id: User;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}