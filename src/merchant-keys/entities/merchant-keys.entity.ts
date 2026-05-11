import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('merchant_keys')
export class MerchantKey {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  merchant_id: string;

  @Column()
  merchant_name: string;

  @Column({ unique: true })
  secret_key: string;

  @Column({ unique: true })
  access_key: string;

  @Column({ default: true })
  status: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}