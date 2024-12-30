import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { CreateSubmissionDto } from '../dto/create-submission.dto';
import { UpdateSubmissionDto } from '../dto/update-submission.dto';
import { UsersService } from 'src/users/services/users.service';
import { SanitizerService } from 'src/core/utils/SanitizerService';
import { User } from 'src/typeorm/entities/User';
import { Submission } from 'src/typeorm/entities/Submission';
import { In, Not, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { SubmissionFile } from 'src/typeorm/entities/SubmissionFIle';
import { CreateSubmissionFirstStepDto } from '../dto/create-submission-first-step.dto';
import { CreateSubmissionFinalSaveDto } from '../dto/create-submission-final-save.dto';
import { Journal } from 'src/typeorm/entities/Journal';
import { SubmissionEditor } from 'src/typeorm/entities/SubmissionEditor';
import { Issue } from 'src/typeorm/entities/Issue';
import { Section } from 'src/typeorm/entities/Section';
import { PdfProcessorService } from 'src/core/utils/PdfProcessorService';
import { CreateSubmissionContributorDto } from '../dto/create-submission-contributor.dto';
import { SubmissionContributor } from 'src/typeorm/entities/SubmissionContributor';

@Injectable()
export class SubmissionsService {
  constructor(

    private usersService: UsersService ,
    private readonly sanitizerService: SanitizerService,
    private readonly pdfProcessorService: PdfProcessorService,


    @InjectRepository(User) private usersRepository: Repository<User>,
    @InjectRepository(Submission) private submissionsRepository: Repository<Submission>,
    @InjectRepository(SubmissionFile) private submissionFilesRepository: Repository<SubmissionFile>,
    @InjectRepository(Journal) private journalsRepository: Repository<Journal>,
    @InjectRepository(SubmissionEditor) private submissionsEditorRepository: Repository<SubmissionEditor>,
    @InjectRepository(SubmissionContributor) private submissionContributorsRepository: Repository<SubmissionContributor>,
    @InjectRepository(Issue) private issuesRepository: Repository<Issue>,
    @InjectRepository(Section) private sectionsRepository: Repository<Section>,

) {}

  // create(createSubmissionDto: CreateSubmissionDto) {
  //   return 'This action adds a new submission';
  // }

  async createFirstStep(submissionData: CreateSubmissionFirstStepDto): Promise<any> {
    // console.log(questionData)
    // return;
    const user = await this.usersService.getUserAccountById(submissionData.userId)
    if (!user) {
        throw new NotFoundException('User not found');
    }

    const journal = await this.journalsRepository.findOne({where: {id: submissionData.journalId}})
    if (!journal) {
        throw new NotFoundException('Journal not found');
    }

    // console.log(optionType, difficultyType)
    const sanitizedEditorsNote = this.sanitizerService.sanitizeInput(submissionData.editorsNote);

    // console.log(sanitizedQuestion, questionData.question, 'questionData.question');
    // return;

    try{
        const newSubmission = this.submissionsRepository.create({
            userId: user.id,
            user: user,
            journal: journal,
            journalId: submissionData.journalId,
            editorsNote:  submissionData.editorsNote,
            editorsNotePlain: sanitizedEditorsNote,
            is_previously_published: submissionData.is_previously_published,
            url_reference: submissionData.url_reference,
            formatted_correctly: submissionData.formatted_correctly,
            author_guidelines: submissionData.author_guidelines,
            accept_data_collection: submissionData.accept_data_collection,
            status: 0,
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        // console.log(newSubmission, 'newQuestion')
        const savedNewSubmission = await this.submissionsRepository.save(newSubmission);
        // if (questionData.answers){
        //     await this.createAnswers(questionData, saveNewQuestion);
        // }
        
        // console.log(`submissionData has been created`);
        let data = {
            success: 'success',
            submission: savedNewSubmission,
        };
        return data;

    } catch (err) {
        let data = {
            error: err.message,
        };
        return data;
    }
  };

  async create(submissionData: CreateSubmissionDto): Promise<any> {
    // console.log(questionData)
    // return;
    try{

      const user = await this.usersService.getUserAccountById(submissionData.userId)

      if (!user) {
          throw new NotFoundException('User not found');
      }

      const submission = await this.submissionsRepository.findOne({where:{ id: submissionData.id }});
      if (!submission) {
        throw new NotFoundException('Submission not found');
      }

      // console.log(optionType, difficultyType)
      const sanitizedAbstract = this.sanitizerService.sanitizeInput(submissionData.abstract);
      // console.log(sanitizedQuestion, questionData.question, 'questionData.question');
      // return;

      const updatedFields = {
        prefix: submissionData.prefix,
        title: submissionData.title,
        subTitle: submissionData.subTitle??'' ,
        abstract: submissionData.abstract,
        abstractPlain: sanitizedAbstract,
        keywords: submissionData.keywords,
      }

      const update = await this.submissionsRepository.update({ id: submissionData.id }, updatedFields);
      if(update.affected < 1){
        return {
            error:'error',
            message: 'An error has occurred'
        }
      }

      const newQuestion = await this.submissionsRepository.findOne({where:{ id: submissionData.id }});

      // console.log(newQuestion, 'newQuestion')
      
      let data = {
          success: 'success',
          submission: submission,
      };
      return data;

    } catch (err) {
        let data = {
            error: err.message,
        };
        return data;
    }
  };

  async finalSave(submissionData: CreateSubmissionFinalSaveDto): Promise<any> {
    // console.log(questionData)
    // return;
    try{

      const user = await this.usersService.getUserAccountById(submissionData.userId)

      if (!user) {
          throw new NotFoundException('User not found');
      }

      const submission = await this.submissionsRepository.findOne({where:{ id: submissionData.id }});
      if (!submission) {
        throw new NotFoundException('User not found');
      }

      const updatedFields = {
        completed: 1,
      }

      const update = await this.submissionsRepository.update({ id: submissionData.id }, updatedFields);
      if(update.affected < 1){
        return {
            error:'error',
            message: 'An error has occurred'
        }
      }

      const newSubmission = await this.submissionsRepository.findOne({where:{ id: submissionData.id }});

      // console.log(newSubmission, 'newSubmission')
      
      let data = {
          success: 'success',
          submission: newSubmission,
      };
      return data;

    } catch (err) {
        let data = {
            error: err.message,
        };
        return data;
    }
  };

  async findAll() {
      const submissions = await this.submissionsRepository.find({ 
        where:
          { completed: 1, status: 1, publication_status: 1 },
          order: {
              createdAt: 'DESC', // Sort by creation date in descending order
          },
        relations:['user', 'files']
      });
  
      const res = {
          success: 'success',
          message: 'successful',
          data: submissions,
      };

      return res;
  }

  async findAllAdmin() {
      const submissions = await this.submissionsRepository.find({ 
          order: {
              createdAt: 'DESC', // Sort by creation date in descending order
          },
        relations:['user', 'files']
      });
  
      const res = {
          success: 'success',
          message: 'successful',
          data: submissions,
      };

      return res;
  }

  async findOne(id: number) {
    try {
      let submission = await this.submissionsRepository.findOne({
          where: { id },
          relations: ['user', 'files', 'editors', 'editors.editor', 'issue', 'section', 'contributors'],
      });

      if (!submission)
          throw new HttpException('Question not found', HttpStatus.BAD_REQUEST);
      
      // Get all users attached to this submission
      const attachedUsers = await this.submissionsEditorRepository.find({
          where: { submissionId: submission.id },
          relations: ['editor'],
      });

      // Extract IDs of attached users
      const attachedUserIds = attachedUsers.map((user) => user.editor.id);

      // Get all users not attached to this submission
      const unattachedUsers = await this.usersRepository.find({
          where: { id: Not(In(attachedUserIds)) },
      });

      const submissionFile = await this.submissionFilesRepository.findOne({
        where: { submissionId: submission.id, is_main: true  },
      });

      // console.log(submissionFile,'ifen')

      const newSubmission = {...submission, file: submissionFile};
      
      // const unattachedUsers = await this.usersRepository.createQueryBuilder('user')
      //   .innerJoin('user.userRoles', 'userRole')
      //   .innerJoin('userRole.role', 'role')
      //   .where('role.id = :editorRoleId', { editorRoleId: 4 }) // Editor role ID
      //   .andWhere('user.id NOT IN (:...attachedUserIds)', { 
      //     attachedUserIds: attachedUserIds.length > 0 ? attachedUserIds : [0] 
      //   })
      //   .getMany();


      // const sections
      let data = {
          submission: newSubmission,
          users:unattachedUsers,
          success: 'success',
      };
      return data;

    } catch (err) {
      // console.log(err)
    }
  }

  async findSubmissionFiles(id: number) {
    try {
      const submission = await this.submissionsRepository.findOne({
          where: { id },
      });
      if (!submission)
          throw new HttpException('Question not found', HttpStatus.BAD_REQUEST);
  
      const submissionFiles = await this.submissionFilesRepository.find({
        where: { submission: submission },
      });

      // console.log(submissionFiles)
      let data = {
          submissionFiles,
          success: 'success',
      };
      return data;

    } catch (err) {}
  }

  async assignIssue(attachData: any): Promise<any> {
    try{

      const submission = await this.submissionsRepository.findOne({where:{ id: attachData.submissionId }});
      if (!submission) {
        throw new NotFoundException('Submission not found');
      }

      const issue = await this.issuesRepository.findOne({where:{ id: attachData.issueId }});
      if (!issue) {
        throw new NotFoundException('Issue not found');
      }
      
      const updatedFields = {
        issue: issue,
        issueId: issue.id,
      }

      const update = await this.submissionsRepository.update({ id: attachData.submissionId }, updatedFields);

      if(update.affected < 1){
        return {
            error:'error',
            message: 'An error occurred'
        }
      }

      let data = {
        success: 'success',
      };
      return data;


    } catch (err) {
        let data = {
            error: err.message,
        };
        return data;
    }
  };

  async attachEditor(attachData: any): Promise<any> {
    try{

      const user = await this.usersService.getUserAccountById(attachData.editorId)

      if (!user) {
          throw new NotFoundException('User not found');
      }

      const submission = await this.submissionsRepository.findOne({where:{ id: attachData.submissionId }});
      if (!submission) {
        throw new NotFoundException('Submission not found');
      }

      const sanitizedNote = this.sanitizerService.sanitizeInput(attachData.note);

      const saveFields = {
        editorId: user.id,
        editor: user,
        submissionId: submission.id,
        submission: submission,
        note: attachData.note,
        notePlain: sanitizedNote,
      }

      const checkAttaachment = await this.submissionsEditorRepository.findOne({where: {submissionId: submission.id, editor: user}});

      if(!checkAttaachment){
        const savedAttach = this.submissionsEditorRepository.create(saveFields);

        const newAttachMent = await this.submissionsEditorRepository.save(savedAttach);
        
      }

      let data = {
        success: 'success',
      };
      return data;


    } catch (err) {
        let data = {
            error: err.message,
        };
        return data;
    }
  };

  async removeEditor(editorId: any, submissionId: any ): Promise<any> {
    try{

      const user = await this.usersService.getUserAccountById(editorId)

      if (!user) {
          throw new NotFoundException('User not found');
      }

      // console.log(editorId, user)
      const submission = await this.submissionsRepository.findOne({where:{ id: submissionId }});
      if (!submission) {
        throw new NotFoundException('Submission not found');
      }

      const savedAttach = await this.submissionsEditorRepository.findOne({where: {  submissionId: submission.id, editor: user}});

      // console.log(savedAttach)
      // return
      if(savedAttach){
        await this.submissionsEditorRepository.delete(savedAttach.id);
      
        let data = {
            success: 'success',
        };
        return data;
      }

    } catch (err) {
        let data = {
            error: err.message,
        };
        return data;
    }
  };

  async update(id: number, updateSubmissionDto: UpdateSubmissionDto) {
    try{

      const user = await this.usersService.getUserAccountById(updateSubmissionDto.userId)

      if (!user) {
          throw new NotFoundException('User not found');
      }

      const submission = await this.submissionsRepository.findOne({where:{ id }});
      if (!submission) {
        throw new NotFoundException('Submission not found');
      }

      // console.log(optionType, difficultyType)
      const sanitizedAbstract = this.sanitizerService.sanitizeInput(updateSubmissionDto.abstract);
      // console.log(sanitizedQuestion, questionData.question, 'questionData.question');
      // return;

      const updatedFields = {
        prefix: updateSubmissionDto.prefix,
        title: updateSubmissionDto.title,
        subTitle: updateSubmissionDto.subTitle ,
        abstract: updateSubmissionDto.abstract,
        abstractPlain: sanitizedAbstract,
        keywords: updateSubmissionDto.keywords,
      }

      const update = await this.submissionsRepository.update({ id }, updatedFields);

      if(update.affected < 1){
          return {
              error:'error',
              message: 'An error has occurred'
          }
      }

      const updatedSubmission = await this.submissionsRepository.findOne({where:{ id }});
      
      let data = {
          success: 'success',
          message: 'success',
          submission: updatedSubmission,
      };
      return data;

    } catch (err) {
        let data = {
            error: err.message,
        };
        return data;
    }
  }

  async updateKeywords(id: number, updateSubmissionKeywords: any) {
    try{

      const submission = await this.submissionsRepository.findOne({where:{ id }});
      if (!submission) {
        throw new NotFoundException('Submission not found');
      }

      const updatedFields = {
        keywords: updateSubmissionKeywords.keywords,
      }

      const update = await this.submissionsRepository.update({ id }, updatedFields);

        if(update.affected < 1){
          return {
              error:'error',
              message: 'An error has occurred'
          }
      }

      const updatedSubmission = await this.submissionsRepository.findOne({where:{ id }});
      
      let data = {
          success: 'success',
          message: 'Updated Keywords Successfully',
          submission: updatedSubmission,
      };
      return data;

    } catch (err) {
        let data = {
            error: err.message,
        };
        return data;
    }
  }

  async remove(id: number) {
    try {
        const submission = await this.submissionsRepository.findOne({
            where: { id },
        });
    
        if (!submission) {
            return { error: 'error', message: 'Submission not found' };
        }

        const submissionFiles = await this.submissionFilesRepository.find({
          where: { submissionId: submission.id },
        });

        for (const file of submissionFiles) {
          await this.submissionFilesRepository.delete(file.id);
        };

        await this.submissionsRepository.delete(id);
        return { success: 'success', message: 'Submission deleted successfully' };

    } catch (err) {
            console.error('Error deleting Submission:', err);
            throw new HttpException(
                'Error deleting Submission',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
    }
  }

  async removeSubmissionFile(id: number, fileId: number) {
    try {
        const submission = await this.submissionsRepository.findOne({
            where: { id },
        });
    
        if (!submission) {
            return { error: 'error', message: 'Submission not found' };
        }

        const submissionFile = await this.submissionFilesRepository.findOne({
            where: { id: fileId, submissionId: submission.id },
        });

        await this.submissionFilesRepository.delete(submissionFile.id);

        return { success: 'success', message: 'Submission File deleted successfully' };

    } catch (err) {
            console.error('Error deleting Submission File:', err);
            throw new HttpException(
                'Error deleting Submission File',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
    }
  }

  async updateSubmissionSection(id: number, updateSubmissionDto: any) {
    try{

      const submission = await this.submissionsRepository.findOne({where:{ id }});
      if (!submission) {
        throw new NotFoundException('Submission not found');
      }

      const section = await this.sectionsRepository.findOne({where:{ id: updateSubmissionDto.sectionId }});
      if (!section) {
        throw new NotFoundException('Section not found');
      }

      const updatedFields = {
        section: section,
        pages: updateSubmissionDto.pages,
        url_path: updateSubmissionDto.urlPath,
        datePublished: new Date(updateSubmissionDto.datePublished)
      }

      // console.log(updatedFields, 'upda')
      // return;
      const update = await this.submissionsRepository.update({ id }, updatedFields);

      // console.log(update)
      if(update.affected < 1){
        return {
            error:'error',
            message: 'An error has occurred'
        }
      }
      
      let data = {
          success: 'success',
          message: 'Updated Successfully!',
      };
      return data;

    } catch (err) {
        let data = {
            error: err.message,
        };
        return data;
    }
  }

  async updateSubmissionTitle(id: number, updateSubmissionDto: any) {
    try{

      const submission = await this.submissionsRepository.findOne({where:{ id }});
      if (!submission) {
        throw new NotFoundException('Submission not found');
      }

      const sanitizedAbstract = this.sanitizerService.sanitizeInput(updateSubmissionDto.abstract);

      const updatedFields = {
        prefix: updateSubmissionDto.prefix,
        title: updateSubmissionDto.title,
        subTitle: updateSubmissionDto.subTitle ,
        abstract: updateSubmissionDto.abstract,
        abstractPlain: sanitizedAbstract,
      }

      // console.log(updatedFields, 'upda')
      // return;
      const update = await this.submissionsRepository.update({ id }, updatedFields);

      // console.log(update)
      if(update.affected < 1){
        return {
            error:'error',
            message: 'An error has occurred'
        }
      }
      
      let data = {
          success: 'success',
          message: 'Updated Successfully!',
      };
      return data;

    } catch (err) {
        let data = {
            error: err.message,
        };
        return data;
    }
  }

  async addSubmissionContributor(id: number, addSubmissionContributor: CreateSubmissionContributorDto) {
    try{

      const submission = await this.submissionsRepository.findOne({where:{ id }});
      if (!submission) {
        throw new NotFoundException('Submission not found');
      }

      const sanitizedBio = this.sanitizerService.sanitizeInput(addSubmissionContributor.bio);

      const newSubmissionContributor = this.submissionContributorsRepository.create({
        submissionId: submission.id,
        submission: submission,
        firstname: addSubmissionContributor.firstname,
        lastname: addSubmissionContributor.lastname,
        email: addSubmissionContributor.email,
        role: addSubmissionContributor.role,
        orcid: addSubmissionContributor.orcid,
        homepage: addSubmissionContributor.homepage,
        public_name: addSubmissionContributor.public_name,
        affiliation: addSubmissionContributor.affiliation,
        country: addSubmissionContributor?.country??'',
        bio: addSubmissionContributor.bio,
        bioPlain: sanitizedBio,
        is_principal_contact: addSubmissionContributor.is_principal_contact,
      });

      const savedSubmissionContributor = await this.submissionContributorsRepository.save(newSubmissionContributor);
      
      let data = {
          success: 'success',
          message: 'Saved Successfully!',
          contributor: savedSubmissionContributor,
      };
      return data;

    } catch (err) {
        let data = {
            error: err.message,
        };
        return data;
    }
  }
  
  async updateSubmissionContributor(id: number, addSubmissionContributor: CreateSubmissionContributorDto) {
    try{

      const contributor = await this.submissionContributorsRepository.findOne({where:{ id }});
      if (!contributor) {
        throw new NotFoundException('Contributor not found');
      }

      const sanitizedBio = this.sanitizerService.sanitizeInput(addSubmissionContributor.bio);

      const updatedFields = {
        // submissionId: submission.id,
        // submission: submission,
        firstname: addSubmissionContributor.firstname,
        lastname: addSubmissionContributor.lastname,
        email: addSubmissionContributor.email,
        role: addSubmissionContributor.role,
        orcid: addSubmissionContributor.orcid,
        homepage: addSubmissionContributor.homepage,
        public_name: addSubmissionContributor.public_name,
        affiliation: addSubmissionContributor.affiliation,
        country: addSubmissionContributor.country,
        bio: addSubmissionContributor.bio,
        bioPlain: sanitizedBio,
        is_principal_contact: addSubmissionContributor.is_principal_contact,
      }

      const update = await this.submissionContributorsRepository.update({ id }, updatedFields);

      // console.log(update)
      if(update.affected < 1){
        return {
            error:'error',
            message: 'An error has occurred'
        }
      }
      
      let data = {
          success: 'success',
          message: 'Updated Successfully!',
      };
      return data;

    } catch (err) {
        let data = {
            error: err.message,
        };
        return data;
    }
  }

  async removeSubmissionContributor(id: number) {
    try {
        const contributor = await this.submissionContributorsRepository.findOne({
            where: { id },
        });
    
        if (!contributor) {
            return { error: 'error', message: 'Contributor not found' };
        }

        await this.submissionContributorsRepository.delete(contributor.id);

        return { success: 'success', message: 'Contributor deleted successfully' };

    } catch (err) {
        console.error('Error deleting Contributor:', err);
        throw new HttpException(
            'Error deleting Contributor',
            HttpStatus.INTERNAL_SERVER_ERROR,
        );
    }
  }

  async saveSubmissionUpload(id: number, submissionFilesData: any): Promise<any> {
    // console.log(questionData)
    // return;
    const user = await this.usersService.getUserAccountById(submissionFilesData.userId)
    if (!user) {
        throw new NotFoundException('User not found');
    }


    const submission = await this.submissionsRepository.findOne({
        where: { id },
    });
    if (!submission)
        throw new HttpException('Question not found', HttpStatus.BAD_REQUEST);


    try{
        const newsubmissionFile = this.submissionFilesRepository.create({
            userId: user.id,
            user: user,
            submission: submission,
            submissionId: submission.id,
            title: submissionFilesData.title,
            file_url: submissionFilesData.file_url,
            file_type: submissionFilesData.file_type,
            file_size: submissionFilesData.file_size,
            creator: submissionFilesData.creator,
            description: submissionFilesData.description,
            source: submissionFilesData.source,
            language: submissionFilesData.language,
            publisher: submissionFilesData.publisher,
            subject: submissionFilesData.subject,
            date: submissionFilesData.date,
            upload_type: submissionFilesData.upload_type,
            
        });

        // console.log(newsubmissionFile, 'newsubmissionFile')
        const savedNewSubmissionFile = await this.submissionFilesRepository.save(newsubmissionFile);
        
        // console.log(`submissionData has been created`);
        let data = {
            message: 'Created Successfully',
            success: 'success',
            submission: savedNewSubmissionFile,
        };
        return data;

    } catch (err) {
        let data = {
            error: err.message,
        };
        return data;
    }
  };

  async acceptSubmission(id: number) {
    try{

      const submission = await this.submissionsRepository.findOne({where:{ id }});
      if (!submission) {
        throw new NotFoundException('Submission not found');
      }

      const updatedFields = {
        status: 1,
      }

      const update = await this.submissionsRepository.update({ id }, updatedFields);

      // console.log(update)
      if(update.affected < 1){
        return {
            error:'error',
            message: 'An error has occurred'
        }
      }
      
      let data = {
          success: 'success',
          message: 'Accepted Successfully!',
      };
      return data;

    } catch (err) {
        let data = {
            error: err.message,
        };
        return data;
    }
  }

  async rejectSubmission(id: number) {
    try{

      const submission = await this.submissionsRepository.findOne({where:{ id }});
      if (!submission) {
        throw new NotFoundException('Submission not found');
      }

      const updatedFields = {
        status: 2,
      }

      const update = await this.submissionsRepository.update({ id }, updatedFields);

      // console.log(update)
      if(update.affected < 1){
        return {
            error:'error',
            message: 'An error has occurred'
        }
      }
      
      let data = {
          success: 'success',
          message: 'Rejected Successfully!',
      };
      return data;

    } catch (err) {
        let data = {
            error: err.message,
        };
        return data;
    }
  }

  async publishSubmission(id: number) {
    try{

      const submission = await this.submissionsRepository.findOne({where:{ id }});
      if (!submission) {
        throw new NotFoundException('Submission not found');
      }

      const updatedFields = {
        publication_status: 1,
      }

      const update = await this.submissionsRepository.update({ id }, updatedFields);

      // console.log(update)
      if(update.affected < 1){
        return {
            error:'error',
            message: 'An error has occurred'
        }
      }
      
      let data = {
          success: 'success',
          message: 'Published Successfully!',
      };
      return data;

    } catch (err) {
        let data = {
            error: err.message,
        };
        return data;
    }
  }

  async unPublishSubmission(id: number) {
    try{

      const submission = await this.submissionsRepository.findOne({where:{ id }});
      if (!submission) {
        throw new NotFoundException('Submission not found');
      }

      const updatedFields = {
        publication_status: 0,
      }

      const update = await this.submissionsRepository.update({ id }, updatedFields);

      // console.log(update)
      if(update.affected < 1){
        return {
            error:'error',
            message: 'An error has occurred'
        }
      }
      
      let data = {
          success: 'success',
          message: 'Rejected Successfully!',
      };
      return data;

    } catch (err) {
        let data = {
            error: err.message,
        };
        return data;
    }
  }

  async summarizeFile(fileId: number): Promise<any> {
    try {
      const file = await this.submissionFilesRepository.findOne({ where:{ id: fileId } });
      if (!file) {
        return {
          error:'error',
          message: 'An error has occurred'
        }
      }

      
      const fileBuffer = await this.pdfProcessorService.fetchFile(file.file_url);
      
      const pdfText = await this.pdfProcessorService.parsePdfContent(fileBuffer);
      
      const summary = await this.pdfProcessorService.summarizeText(pdfText);
      // console.log(pdfText, file, fileBuffer, 'filee')
      // return;
      let data = {
          success: 'success',
          message: 'Success',
          summary: summary,
      };
      return data;
    } catch (err) {
      let data = {
          error: err.message,
      };
      return data;
    }
  }

  async toggleSubmissionFilesMain(submissionId: number, fileId: number): Promise<any>{
    try {
      const submission = await this.submissionsRepository.findOne({
          where: { id: submissionId },
      });
      if (!submission)
          throw new HttpException('Submission not found', HttpStatus.BAD_REQUEST);
  
      const submissionFile = await this.submissionFilesRepository.findOne({
        where: { id: fileId },
      });

      const newIsMain = !submissionFile.is_main;
    
      // Update all files in this submission
      await this.submissionFilesRepository.update(
        { 
          submission: { id: submissionId },
          id: Not(fileId) // Update all files except the selected one
        },
        { is_main: !newIsMain } // Set opposite value for other files
      );

      // Update the selected file
      await this.submissionFilesRepository.update(
        { id: fileId },
        { is_main: newIsMain }
      );


      // let is_main = !submissionFile.is_main;
      // await this.submissionFilesRepository.update({ id: submissionFile.id }, {is_main: is_main});


      // const submissionFiles = await this.submissionFilesRepository.find({
      //   where: { submission: submission },
      // });

      let data = {
          success: 'success',
      };
      return data;

    } catch (err) {}
  }

}
