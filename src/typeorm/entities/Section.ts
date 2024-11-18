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
import { Journal } from './Journal';

@Entity('sections')
export class Section {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', name: 'journal_id', nullable: true })
  journalId: number;

  @Column({ type: 'varchar', unique: true })
  title: string;

  @Column({ type: 'longtext', nullable: true})
  policy: string;

  @Column({ type: 'longtext', nullable: true})
  policyPlain: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  abbreviation: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  identification_text: string;

  @Column({ type: 'int', nullable: true })
  word_count: number;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt: Date;

  // Relationships
  @ManyToOne(() => Journal)
  @JoinColumn({ name: 'journal_id' })
  journal: Journal;

}