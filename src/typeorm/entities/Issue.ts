import { 
  Entity, 
  Column, 
  PrimaryGeneratedColumn, 
  CreateDateColumn, 
  UpdateDateColumn, 
  ManyToOne, 
  OneToMany, 
  JoinColumn 
} from 'typeorm';
import { User } from './User';
import { Submission } from './Submission';
import { Journal } from './Journal';

@Entity('issues')
export class Issue {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', name: 'user_id', nullable: true })
  userId: number;

  @Column({ type: 'int', name: 'journal_id', nullable: true })
  journalId: number;

  @Column({ type: 'varchar', unique: true })
  title: string;

  @Column({ type: 'varchar', nullable: true })
  volume: string;

  @Column({ type: 'int', nullable: true })
  number: number;

  @Column({ type: 'int', nullable: true })
  year: number;

  @Column({ type: 'longtext', nullable: true})
  description: string;

  @Column({ type: 'longtext', nullable: true})
  descriptionPlain: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  cover_image_url: string;
  
  @Column({ type: 'varchar', length: 255, nullable: true })
  cover_image_name: string;

  @Column({ type: 'varchar', nullable: true })
  url_path: string;

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

  @ManyToOne(() => Journal)
  @JoinColumn({ name: 'journal_id' })
  journal: Journal;

  // @ManyToOne(() => User)
  // @JoinColumn({ name: 'editor_id' })
  // editor: User;

  @OneToMany(() => Submission, (submission) => submission.issue)
  submissions: Submission[];

}