import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SanitizerService } from 'src/core/utils/SanitizerService';
import { Journal } from 'src/typeorm/entities/Journal';
import { Submission } from 'src/typeorm/entities/Submission';
import { SubmissionFile } from 'src/typeorm/entities/SubmissionFIle';
import { User } from 'src/typeorm/entities/User';
import { UsersService } from 'src/users/services/users.service';
import { Repository } from 'typeorm';
import { CreateJournalDto } from '../dto/create-journal.dto';
import { UpdateJournalDto } from '../dto/update-journal.dto';

@Injectable()
export class JournalsService {
    constructor(

        private usersService: UsersService ,
        private readonly sanitizerService: SanitizerService,
    
    
        @InjectRepository(User) private usersRepository: Repository<User>,
        @InjectRepository(Submission) private submissionsRepository: Repository<Submission>,
        @InjectRepository(SubmissionFile) private submissionFilesRepository: Repository<SubmissionFile>,
        @InjectRepository(Journal) private journalsRepository: Repository<Journal>,
    
    ) {}

    
    async create(journalData: CreateJournalDto): Promise<any> {
        // console.log(questionData)
        // return;
        try{
    
            const user = await this.usersService.getUserAccountById(journalData.userId)
        
            if (!user) {
                throw new NotFoundException('User not found');
            }

            const editor = await this.usersService.getUserAccountById(journalData.editorId)
            if (!editor) {
                throw new NotFoundException('Editor not found');
            }

            // const userRoles = await this.usersService.getUserRoles(editor.id);
            // console.log(userRoles,' eeffef')


            // const defaultUserRole = userRoles.find(role => role.is_default) || null;
        
            //   const submission = await this.submissionsRepository.findOne({where:{ id: journalData.id }});
            //   if (!submission) {
            //     throw new NotFoundException('User not found');
            //   }
        
            // console.log(optionType, difficultyType)
            const sanitizedAbstract = this.sanitizerService.sanitizeInput(journalData.note);
            // console.log(sanitizedQuestion, questionData.question, 'questionData.question');
            // return;
        
            const entryFields = {
                name: journalData.name,
                userId: journalData.userId,
                editorId: journalData.editorId ,
                note: journalData.note,
                notePlain: sanitizedAbstract,
                slug: journalData.slug,
                user:user,
                editor:editor
            }

            const newJournal = this.submissionsRepository.create(entryFields);

    
    
            console.log(newJournal, 'newJournal')
            const savedNewJournal = await this.submissionsRepository.save(newJournal);

            console.log(`journalData has been created`);
            let data = {
                success: 'success',
                journal: savedNewJournal,
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
        const journals = await this.journalsRepository.find({ relations:['user', 'submissions', 'editor']});
    
        const res = {
            success: 'success',
            message: 'successful',
            data: journals,
        };
  
        return res;
    }
  
    async findOne(id: number) {
      try {
        // const journal = await this.journalsRepository.findOne({
        //     where: { id },
        //     relations: ['user', 'submissions', 'editor'],
        // });
        const journal = await this.journalsRepository
        .createQueryBuilder('journal')
        .leftJoinAndSelect('journal.submissions', 'submissions', 
            'submissions.completed = :completed AND submissions.status = :status')
        .leftJoinAndSelect('journal.user', 'user')
        .leftJoinAndSelect('journal.editor', 'editor')
        .leftJoinAndSelect('submissions.user', 'submissionUser')
        .leftJoinAndSelect('submissions.files', 'files')
        .where('journal.id = :id', { id })
        .orderBy('submissions.createdAt', 'DESC')
        .setParameters({
            completed: 1,
            status: 1
        })
        .getOne();
  
        if (!journal)
            throw new HttpException('Journal not found', HttpStatus.BAD_REQUEST);
    
        let data = {
            journal,
            success: 'success',
        };
        return data;
  
      } catch (err) {}
    }

    async update(id: number, updateJournalDto: UpdateJournalDto) {
        try{
    
          const user = await this.usersService.getUserAccountById(updateJournalDto.userId)
    
          if (!user) {
              throw new NotFoundException('User not found');
          }

          const editor = await this.usersService.getUserAccountById(updateJournalDto.editorId)
          if (!editor) {
              throw new NotFoundException('User not found');
          }
    
          const journal = await this.journalsRepository.findOne({where:{ id }});
          if (!journal) {
            throw new NotFoundException('User not found');
          }
    
          // console.log(optionType, difficultyType)
          const sanitizedAbstract = this.sanitizerService.sanitizeInput(updateJournalDto.note);
          // console.log(sanitizedQuestion, questionData.question, 'questionData.question');
          // return;
    
          const updatedFields = {
            name: updateJournalDto.name,
            userId: updateJournalDto.userId,
            editorId: updateJournalDto.editorId ,
            note: updateJournalDto.note,
            notePlain: sanitizedAbstract,
            slug: updateJournalDto.slug,
            user:user,
            editor:editor
        }
    
          const update = await this.journalsRepository.update({ id }, updatedFields);
    
          console.log(update)
          if(update.affected < 1){
            return {
                error:'error',
                message: 'An error has occurred'
            }
        }
    
          const newJournal = await this.journalsRepository.findOne({where:{ id }});
    
          console.log(newJournal, 'newJournal')
          
          let data = {
              success: 'success',
              submission: newJournal,
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
            const journal = await this.journalsRepository.findOne({
                where: { id },
            });
        
            if (!journal) {
                return { error: 'error', message: 'Journal not found' };
            }
    
            await this.journalsRepository.delete(id);
            return { success: 'success', message: 'Journal deleted successfully' };
    
        } catch (err) {
                console.error('Error deleting Journal:', err);
                throw new HttpException(
                    'Error deleting Journal',
                    HttpStatus.INTERNAL_SERVER_ERROR,
                );
        }
      }
    

}
