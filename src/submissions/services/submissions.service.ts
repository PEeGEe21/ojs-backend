import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { CreateSubmissionDto } from '../dto/create-submission.dto';
import { UpdateSubmissionDto } from '../dto/update-submission.dto';
import { UsersService } from 'src/users/services/users.service';
import { SanitizerService } from 'src/core/utils/SanitizerService';
import { User } from 'src/typeorm/entities/User';
import { Submission } from 'src/typeorm/entities/Submission';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { SubmissionFile } from 'src/typeorm/entities/SubmissionFIle';
import { CreateSubmissionFirstStepDto } from '../dto/create-submission-first-step.dto';
import { CreateSubmissionFinalSaveDto } from '../dto/create-submission-final-save.dto';
import { Journal } from 'src/typeorm/entities/Journal';

@Injectable()
export class SubmissionsService {
  constructor(

    private usersService: UsersService ,
    private readonly sanitizerService: SanitizerService,


    @InjectRepository(User) private usersRepository: Repository<User>,
    @InjectRepository(Submission) private submissionsRepository: Repository<Submission>,
    @InjectRepository(SubmissionFile) private submissionFilesRepository: Repository<SubmissionFile>,
    @InjectRepository(Journal) private journalsRepository: Repository<Journal>,

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

        console.log(newSubmission, 'newQuestion')
        const savedNewSubmission = await this.submissionsRepository.save(newSubmission);
        // if (questionData.answers){
        //     await this.createAnswers(questionData, saveNewQuestion);
        // }
        
        console.log(`submissionData has been created`);
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
        throw new NotFoundException('User not found');
      }

      // console.log(optionType, difficultyType)
      const sanitizedAbstract = this.sanitizerService.sanitizeInput(submissionData.abstract);
      // console.log(sanitizedQuestion, questionData.question, 'questionData.question');
      // return;

      const updatedFields = {
        prefix: submissionData.prefix,
        title: submissionData.title,
        subTitle: submissionData.subTitle ,
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

      console.log(newQuestion, 'newQuestion')
      
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

      console.log(newSubmission, 'newSubmission')
      
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
          { completed: 1, status: 1},
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
      const submission = await this.submissionsRepository.findOne({
          where: { id },
          relations: ['user', 'files'],
      });

      if (!submission)
          throw new HttpException('Question not found', HttpStatus.BAD_REQUEST);
  
      let data = {
          submission,
          success: 'success',
      };
      return data;

    } catch (err) {}
  }

  async update(id: number, updateSubmissionDto: UpdateSubmissionDto) {
    try{

      const user = await this.usersService.getUserAccountById(updateSubmissionDto.userId)

      if (!user) {
          throw new NotFoundException('User not found');
      }

      const submission = await this.submissionsRepository.findOne({where:{ id }});
      if (!submission) {
        throw new NotFoundException('User not found');
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

      console.log(update)
      if(update.affected < 1){
        return {
            error:'error',
            message: 'An error has occurred'
        }
    }

      const newQuestion = await this.submissionsRepository.findOne({where:{ id }});

      console.log(newQuestion, 'newQuestion')
      
      let data = {
          success: 'success',
          submission: newQuestion,
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
}
