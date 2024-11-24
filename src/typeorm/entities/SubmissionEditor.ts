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

@Entity('submission_editors')
@Index('index_submission_editor', ['submissionId', 'editorId'])
export class SubmissionEditor {
    @PrimaryGeneratedColumn()
    id: number;
  
    @Column({ type: 'int', name: 'submission_id' })
    submissionId: number;
  
    @Column({ type: 'int'})
    editorId: number;

    @Column({ type: 'longtext', nullable: true})
    note: string;
  
    @Column({ type: 'longtext', nullable: true})
    notePlain: string;
  
    @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
    createdAt: Date;
  
    @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
    updatedAt: Date;
  
    // Relationships
    @ManyToOne(() => User)
    @JoinColumn({ name: 'editor_id' })
    editor: User;
  
    @ManyToOne(() => Submission, submission => submission.files)
    @JoinColumn({ name: 'submission_id' })
    submission: Submission;

}
  