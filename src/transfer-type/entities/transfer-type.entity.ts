import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

export enum TransferTypeEnum {
  AUTOMATIC = 'AUTOMATIC',
  MANUAL = 'MANUAL',
}

@Entity()
export class TransferType {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'enum', enum: TransferTypeEnum })
  transfer_type: TransferTypeEnum;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ default: true })
  status: boolean; // true = active, false = inactive
}