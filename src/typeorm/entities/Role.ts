import { Column, Entity, PrimaryGeneratedColumn, ManyToMany, ManyToOne } from 'typeorm';
import { User } from './User';
import { UserRole } from './UserRole';

@Entity({ name: 'roles' })
export class Role {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ unique: true })
  name: string;

  @Column({nullable: true })
  description: string;

  @ManyToOne(() => UserRole, (userRole) => userRole.role)
  userRoles: UserRole[];
}
