import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { User } from './User';
import { Submission } from './Submission';
import { Issue } from './Issue';

@Entity('journals')
export class Journal {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', name: 'user_id', nullable: true })
  userId: number;

  @Column({ type: 'int', name: 'editor_id', nullable: true })
  editorId: number;

  @Column({ type: 'varchar', length: 255, unique: true })
  name: string;

  @Column({ type: 'longtext', nullable: true })
  file_url: string;
  
  @Column({ type: 'varchar', length: 255, nullable: true })
  file_name: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  accronym: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  slug: string;

  @Column({ type: 'longtext', nullable: true})
  note: string;

  @Column({ type: 'longtext', nullable: true})
  notePlain: string;

  @Column({ type: 'int', default: true})
  status: boolean;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt: Date;

  // Relationships
  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'editor_id' })
  editor: User;

  @OneToMany(() => Submission, (submission) => submission.journal)
  submissions: Submission[];

  @OneToMany(() => Issue, (issue) => issue.journal)
  issues: Issue[];

}