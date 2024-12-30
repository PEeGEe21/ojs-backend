import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { User } from './User';
import { SubmissionFile } from './SubmissionFIle';
import { Journal } from './Journal';
import { Issue } from './Issue';
import { SubmissionEditor } from './SubmissionEditor';
import { Section } from './Section';
import { SubmissionContributor } from './SubmissionContributor';

@Entity('submissions')
export class Submission {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', name: 'user_id', nullable: true })
  userId: number;

  @Column({ type: 'int', name: 'journal_id', nullable: true })
  journalId: number;

  @Column({ type: 'int', name: 'issue_id', nullable: true })
  issueId: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  prefix: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  title: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  subTitle: string;

  @Column({ type: 'longtext', nullable: true})
  abstract: string;

  @Column({ type: 'longtext', nullable: true})
  abstractPlain: string;

  @Column({ type: 'longtext', nullable: true})
  editorsNote: string;

  @Column({ type: 'longtext', nullable: true})
  editorsNotePlain: string;

  @Column({ type: 'longtext', nullable: true})
  keywords: string;

  @Column({ type: 'int', name: 'is_previously_published', default: 0})
  is_previously_published: number;

  @Column({ type: 'int', name: 'url_reference', default: 0})
  url_reference: number;

  @Column({ type: 'int', name: 'formatted_correctly', default: 0})
  formatted_correctly: number;

  @Column({ type: 'int', name: 'author_guidelines', default: 0})
  author_guidelines: number;

  @Column({ type: 'int', name: 'accept_data_collection', default: 0})
  accept_data_collection: number;

  @Column({ type: 'int', default: 0})
  completed: number;

  @Column({ type: 'int', default: 0})
  status: number;

  @Column({ type: 'int', default: 0})
  publication_status: number;

  @Column({ type: 'int', nullable: true })
  pages: number;

  @Column({ type: 'varchar', nullable: true })
  url_path: string;

  @Column({ type: 'date', name: 'date_published', nullable: true })
  datePublished: Date;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt: Date;

  // Relationships
  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToMany(() => SubmissionFile, (submission) => submission.submission)
  files: SubmissionFile[];

  @OneToMany(() => SubmissionEditor, (editor) => editor.submission)
  editors: SubmissionEditor[];

  @OneToMany(() => SubmissionContributor, (contributor) => contributor.submission)
  contributors: SubmissionContributor[];

  @ManyToOne(() => Journal, journal => journal.submissions)
  @JoinColumn({ name: 'journal_id' })
  journal: Journal;

  @ManyToOne(() => Issue, issue => issue.submissions)
  @JoinColumn({ name: 'issue_id' })
  issue: Issue;

  @ManyToOne(() => Section, section => section.submissions)
  @JoinColumn({ name: 'section_id' })
  section: Section;
}
