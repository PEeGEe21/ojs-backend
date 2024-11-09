import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    ManyToOne,
    JoinColumn,
    CreateDateColumn,
    UpdateDateColumn,
    Index
  } from 'typeorm';
import { User } from './User';
import { Submission } from './Submission';

@Entity('submission_files')
@Index('index_submission_file', ['submissionId'])
export class SubmissionFile {
    @PrimaryGeneratedColumn()
    id: number;
  
    @Column({ type: 'int', name: 'submission_id' })
    submissionId: number;
  
    @Column({ type: 'int'})
    userId: number;
  
    @Column({ type: 'longtext', nullable: true })
    file_url: string;
  
  
    @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
    createdAt: Date;
  
    @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
    updatedAt: Date;
  
    // Relationships
    @ManyToOne(() => User)
    @JoinColumn({ name: 'user_id' })
    user: User;
  
    @ManyToOne(() => Submission, submission => submission.files)
    @JoinColumn({ name: 'submission_id' })
    submission: Submission;

}
  