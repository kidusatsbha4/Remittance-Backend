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

@Entity('cash_pickup_receiver')
export class CashPickup {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 20 })
  phone_number: string;

  @Column({ type: 'varchar', length: 100 })
  first_name: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  middle_name: string;

  @Column({ type: 'varchar', length: 100 })
  last_name: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  external_reference_id: string;

  @Column({ type: 'varchar', length: 100 })
  country: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  state: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  city: string;

  @Column({ type: 'text', nullable: true })
  address: string;

  @Column({ type: 'varchar', length: 50 })
  relationship_to_sender: string;

  @Column({ type: 'char', length: 3 })
  currency: string;

  @Column({ type: 'decimal', precision: 18, scale: 2 })
  amount: number;

  @Column({ type: 'decimal', precision: 18, scale: 2 })
  expected_amount: number;

  @Column({ type: 'decimal', precision: 18, scale: 6 })
  exchange_rate: number;

  @Column({
    type: 'varchar',
    length: 20,
    default: 'PENDING',
  })
  receiver_status: string; // PENDING, VERIFIED, PAID, CANCELLED, EXPIRED

  @Column({ type: 'timestamp', nullable: true })
  verified_at: Date;

  // ✅ SENDER RELATION
  @ManyToOne(() => User, (user) => user.sentCashPickups)
  @JoinColumn({ name: 'sender_id' })
  sender: User;

  @Column()
  sender_id: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
