import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto } from 'src/auth/dtos/create-user.dto';
import { AuthService } from 'src/auth/services/auth.service';
import { JournalsService } from 'src/journals/services/journals.service';
import { Journal } from 'src/typeorm/entities/Journal';
import { Role } from 'src/typeorm/entities/Role';
import { Submission } from 'src/typeorm/entities/Submission';
import { SubmissionFile } from 'src/typeorm/entities/SubmissionFIle';
import { UsersService } from 'src/users/services/users.service';
import { Repository } from 'typeorm';

@Injectable()
export class SeederService {
  constructor(
    
    private usersService: UsersService,
    private authService: AuthService,
    private journalsService: JournalsService,

    @InjectRepository(Role) private readonly roleRepository: Repository<Role>,
    @InjectRepository(Submission) private readonly submissionRepository: Repository<Submission>,
    @InjectRepository(SubmissionFile) private readonly submissionFileRepository: Repository<SubmissionFile>,
    @InjectRepository(Journal) private readonly journalRepository: Repository<Journal>,
  ) {}

  async seedAdmin() {
    const users = [
      { 
        fname: process.env.SUPER_FIRSTNAME, 
        lname: process.env.SUPER_LASTNAME, 
        username: process.env.SUPER_USERNAME, 
        email: process.env.SUPER_EMAIL, 
        password: process.env.SUPER_PASSWORD, 
        cpassword: process.env.SUPER_PASSWORD,
        signup_as: Number(process.env.SUPER_SIGNUP)
      },      
    ];

    for (const user of users) {
      const savedData = await this.authService.signUp(user);
      if(savedData.success == 'success'){
        const data = {
            success: 'success',
            message: 'User created successfully',
        }
        return data
      }
    }

    console.log('Admin seeding completed');
  }

  async seedJournals() {
    const journals = [
      { id: 1, name: 'First Journal', userId: 5,  editorId: 5},
      { id: 2, name: 'Second Journal', userId: 5, editorId: 5},
    ];

    // Check if the roles already exist
    for (const journal of journals) {
      const existingJournal = await this.journalRepository.findOne({ where: { id: journal.id } });
      if (!existingJournal) {
        const newJournal = this.journalRepository.create(journal);
        await this.journalRepository.save(newJournal);
        console.log(`JOurnal ${journal.name} has been seeded`);
      }
      // return this.journalsService.create(roles);
    
    }

    console.log('Journals seeding completed');
  }

  async seedRoles() {
    const roles = [
      { id: 1, name: 'Admin' },
      { id: 2, name: 'Reader' },
      { id: 3, name: 'Author' },
      { id: 4, name: 'Editor' },
    ];

    // Check if the roles already exist
    for (const role of roles) {
      const existingRole = await this.roleRepository.findOne({ where: { id: role.id } });
      if (!existingRole) {
        const newRole = this.roleRepository.create(role);
        await this.roleRepository.save(newRole);
        console.log(`Role ${role.name} has been seeded`);
      }
    }

    console.log('Roles seeding completed');
  }

  async seedSubmissions() {
    const submissions = [
      {
        id: 1,
        userId: 1,
        prefix: 'prefix',
        title: 'title',
        subTitle: 'subTitle',
        abstract: 'abstract',
        abstractPlain: 'abstractPlain',
        editorsNote: 'editorsNote',
        editorsNotePlain: 'editorsNotePlain',
        keywords: 'title',
        is_previously_published: 1,
        url_reference: 1,
        formatted_correctly: 1,
        author_guidelines: 1,
        accept_data_collection: 1,
        journalId: 1,
      },
    ];

    for (const submission of submissions) {
      console.log(submission, 'ooon')
      const existingSubmission = await this.submissionRepository.findOne({ where: { id: submission.id } });

      const user = await this.usersService.getUserAccountById(submission.userId)
      

      if (!existingSubmission) {
        const newSubmission = this.submissionRepository.create({
          userId: Number(user.id),
          prefix: submission.prefix,
          title: submission.title,
          subTitle: submission.subTitle ,
          abstract: submission.abstract,
          abstractPlain: submission.abstractPlain,
          editorsNote:  submission.editorsNote,
          editorsNotePlain: submission.editorsNotePlain,
          keywords: submission.keywords,
          is_previously_published: submission.is_previously_published,
          url_reference: submission.url_reference,
          formatted_correctly: submission.formatted_correctly,
          author_guidelines: submission.author_guidelines,
          accept_data_collection: submission.accept_data_collection,
          journalId: submission.journalId,
          user: user,
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        // console.log(newQuestion, 'newQuestion')

        const newNewQuestion = await this.submissionRepository.save(newSubmission);

        console.log(`Submission ${submission.title} has been seeded`);
      }
    }

    console.log('Submissions seeding completed');
  }

}
