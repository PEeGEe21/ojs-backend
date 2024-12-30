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
import { IsEmail } from 'class-validator';

@Entity('submission_contributor')
@Index('index_submission_contributor', ['submissionId'])
export class SubmissionContributor {
    @PrimaryGeneratedColumn()
    id: number;
  
    @Column({ type: 'int', name: 'submission_id' })
    submissionId: number;

    @Column({ type: 'varchar', nullable: false})
    firstname: string;
  
    @Column({ type: 'varchar', nullable: false})
    lastname: string;
  
    @IsEmail()
    @Column({ type: 'varchar', nullable: false})
    email: string;

    @Column({ type: 'varchar', nullable: true})
    public_name: string;

    @Column({ type: 'varchar', nullable: true})
    homepage: string;

    @Column({ type: 'varchar', nullable: true})
    orcid: string;

    @Column({ type: 'varchar', nullable: true})
    affiliation: string;

    @Column({ type: 'int', nullable: false})
    role: number;

    @Column({
      default: '',
      nullable: true
    })
    country?: string;

    @Column({ type: 'longtext', nullable: true})
    bio: string;
  
    @Column({ type: 'longtext', nullable: true})
    bioPlain: string;
  
    @Column({ type: 'int', name: 'is_principal_contact', default: 0})
    is_principal_contact: number;

    @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
    createdAt: Date;
  
    @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
    updatedAt: Date;
  
    @ManyToOne(() => Submission, submission => submission.contributors)
    @JoinColumn({ name: 'submission_id' })
    submission: Submission;

}
  