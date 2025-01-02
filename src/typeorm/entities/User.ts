import {
  Column,
  Entity,
  JoinColumn,
  ManyToMany,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Exclude, Expose } from 'class-transformer';
import { Profile } from './Profile';
import { UserRole } from './UserRole';

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({
    nullable: true
  })
  firstname?: string;

  @Column({
    nullable: true
  })
  lastname?: string;

  @Column({ unique: true, nullable: true })
  username: string;

  @Column({ unique: true})
  email: string;

  @Exclude()
  @Column()
  // { select: false }
  password: string;

  @Column({ type: 'longtext', nullable: true})
  avatar: string;

  @Column({ type: 'varchar', nullable: true})
  public_name: string;

  @Exclude()
  @Column()
  created_at: Date;

  @Column({ nullable: true })
  auth_strategy: string;

  @Column({ default: true })
  is_active: boolean;

  @OneToOne(() => Profile, (profile)=>profile.user)
  @JoinColumn({ name: 'profile_id'})
  profile: Profile;

  @OneToMany(() => UserRole, (userRole) => userRole.user)
  userRoles: UserRole[];

  @Expose()
  get fullName(): string {
    return `${this.firstname} ${this.lastname}`;
  }

  constructor(partial: Partial<User>) {
    Object.assign(this, partial);
  }
}
