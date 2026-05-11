// src/users/entities/user.entity.ts
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { Exclude } from 'class-transformer';
import { OneToMany,OneToOne  } from 'typeorm';
import { UserRole } from '../../user-roles/entities/user-role.entity';
import { Kyc } from '../../kyc/entities/kyc.entity';
import { Manual } from '../../manuals/entities/manual.entity';


@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50 })
  first_name: string;

  @Column({ length: 50 })
  last_name: string;

  @Column({ unique: true })
  email: string;

  @Column({ unique: true })
  phone_number: string;

  @Exclude() // This prevents the PIN from being sent in JSON responses
  @Column({ type: 'text' })
  pin: string;

  @OneToMany(() => UserRole, (ur) => ur.user)
userRoles: UserRole[];

@OneToOne(() => Kyc, (kyc) => kyc.user,{
  cascade: true,
  onDelete: 'CASCADE',
})
kyc: Kyc;

@Column({ type: 'text', nullable: true })
otp: string | null;

@Column({ type: 'timestamp', nullable: true })
otp_expires: Date | null;

@Column({ default: false })
otp_verified: boolean;

@OneToMany(() => Manual, (manual) => manual.sender_id)
sentManuals: Manual[];
}

