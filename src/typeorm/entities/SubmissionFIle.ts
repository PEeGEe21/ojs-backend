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
  
    @Column({ type: 'varchar' })
    title: string;

    @Column({ type: 'longtext' })
    file_url: string;

    @Column({ type: 'longtext', nullable: true })
    description: string;

    @Column({ type: 'varchar', nullable: true })
    creator: string;

    @Column({ type: 'varchar', nullable: true })
    source: string;

    @Column({ type: 'varchar', nullable: true })
    language: string;

    @Column({ type: 'varchar', nullable: true })
    publisher: string;

    @Column({ type: 'varchar', nullable: true })
    subject: string;

    @Column({ type: 'date', nullable: true })
    date: Date;

    @Column({ type: 'int'})
    upload_type: number;

    @Column({ type: 'varchar'})
    file_type: string;

    @Column({ type: 'int'})
    file_size: number;
  
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
  