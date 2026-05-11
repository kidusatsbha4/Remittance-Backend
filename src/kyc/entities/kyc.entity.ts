import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('users_kyc')
export class Kyc {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  user_id: number;

  @OneToOne(() => User, (user) => user.kyc,{
  onDelete: 'CASCADE',
})
@JoinColumn({ name: 'user_id' })
user: User;

  @Column()
  id_type: string;

  @Column({ type: 'date' })
  dob: Date;

  @Column()
  address: string;

  @Column()
  city: string;

  @Column()
  country: string;

  @Column({ nullable: true })
  id_photo_path: string;

  @Column({ nullable: true })
  selfie_photo_path: string;

  @Column({ default: false })
  verified: boolean;

  @Column({
  type: 'timestamp',
  nullable: true,
})
verified_at: Date | null;


  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;
}