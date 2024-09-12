import {
    Column,
    Entity,
    JoinColumn,
    ManyToMany,
    ManyToOne,
    OneToMany,
    OneToOne,
    PrimaryGeneratedColumn,
  } from 'typeorm';
import { Role } from './Role';
import { User } from './User';


@Entity('user_roles')
export class UserRole {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User, (user) => user.userRoles)
    @JoinColumn({ name: 'user_id' })
    user: User;

    //   @ManyToOne(() => Role, (role) => role.userRoles)
    //   @JoinColumn({ name: 'role_id' })
    //   role: Role;
    @ManyToOne(() => Role, (role) => role.userRoles)
    @JoinColumn({ name: 'role_id' })
    role: Role;

    @Column({ default: false })
    is_default: boolean;  // New column to mark default role
}
