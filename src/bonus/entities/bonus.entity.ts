import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Bonus {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255 })
  description: string;

  @Column('decimal', { precision: 15, scale: 2 })
  amount: number;

  @Column({ default: true })
  status: boolean; // true = active, false = inactive
}