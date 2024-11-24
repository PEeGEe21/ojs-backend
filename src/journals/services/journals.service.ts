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
import { error } from 'console';
import { CreateSectionDto } from '../dto/create-section.dto';
import { UpdateSectionDto } from '../dto/update-section.dto';
import { Section } from 'src/typeorm/entities/Section';
import { Issue } from 'src/typeorm/entities/Issue';

@Injectable()
export class JournalsService {
    constructor(

        private usersService: UsersService ,
        private readonly sanitizerService: SanitizerService,
    
    
        @InjectRepository(User) private usersRepository: Repository<User>,
        @InjectRepository(Submission) private submissionsRepository: Repository<Submission>,
        @InjectRepository(SubmissionFile) private submissionFilesRepository: Repository<SubmissionFile>,
        @InjectRepository(Journal) private journalsRepository: Repository<Journal>,
        @InjectRepository(Section) private sectionRepository: Repository<Section>,
        @InjectRepository(Issue) private issuesRepository: Repository<Issue>,
    
    ) {}

    
    async create(journalData: CreateJournalDto): Promise<any> {
        // console.log(questionData)
        // return;
        try{
    
            const journalsCount = await this.journalsRepository.count();
            // console.log(journals)
            if(journalsCount > 1){
                return {
                    error: 'error',
                    message: 'You cannot create more than one journal'
                }
            }

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
                file_name: journalData.file_name,
                accronym: journalData.accronym,
                user:user,
                editor:editor
            }

            const newJournal = this.journalsRepository.create(entryFields);

    
    
            console.log(newJournal, 'newJournal')
            const savedNewJournal = await this.journalsRepository.save(newJournal);

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

    async findActiveJournals() {
        const journals = await this.journalsRepository.find({ where: {status: true}, relations:['user', 'submissions', 'editor']});
    
        const res = {
            success: 'success',
            message: 'successful',
            data: journals,
        };
  
        return res;
    }

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
                throw new NotFoundException('Editor not found');
            }
        
            const journal = await this.journalsRepository.findOne({where:{ id }});
            if (!journal) {
                throw new NotFoundException('Journal not found');
            }
        
            // console.log(optionType, difficultyType)
            const sanitizedNote = this.sanitizerService.sanitizeInput(updateJournalDto.note);
            // console.log(sanitizedQuestion, questionData.question, 'questionData.question');
            // return;
        
            const updatedFields = {
                name: updateJournalDto.name,
                userId: updateJournalDto.userId,
                editorId: updateJournalDto.editorId ,
                note: updateJournalDto.note,
                notePlain: sanitizedNote,
                slug: updateJournalDto.slug,
                file_name: updateJournalDto.file_name,
                accronym: updateJournalDto.accronym,
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
                journal: newJournal,
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

    async updateJournalStatus(journal_id: number){
        try{
            const journal = await this.journalsRepository.findOneBy({ id: journal_id });
            if(!journal)
                return{
                    error: 'error',
                    message: 'Journal not found'
                }

            let status = !journal.status;
            await this.journalsRepository.update({ id: journal.id }, {status: status});

            const data = {
                success: 'success',
                message: 'Journal status updated successfully',
            }
            return data;


        } catch(err){

        }
    }

    async findActiveJournalIssues(journal_id: number): Promise<any> {
        const issues = await this.issuesRepository.find({where: { journalId: journal_id, status: true}});
        const res = {
            success: 'success',
            message: 'successfull',
            issues
        };
  
        return res;
    }
    

    async findJournalIssues(journal_id: number): Promise<any> {
        const issues = await this.issuesRepository.find({where: { journalId: journal_id}});
        const res = {
            success: 'success',
            message: 'successfull',
            issues
        };
  
        return res;
    }
    

    // sections
    async findJournalSections(journal_id: number): Promise<any> {
        const sections = await this.sectionRepository.find({where: { journalId: journal_id }});

        const res = {
            success: 'success',
            message: 'successfull',
            sections
        };
  
        return res;
    }

    async createSection(createSectionData: CreateSectionDto) : Promise<any> {
        try{

            const journal = await this.journalsRepository.findOne({ where: {id: createSectionData.journalId, status: true }, });
            if(!journal)
                return{
                    error: 'error',
                    message: 'Journal not found'
                }

            const sanitizedPolicy = this.sanitizerService.sanitizeInput(createSectionData.policy);

            const payload = {
                title: createSectionData.title,
                abbreviation: createSectionData.abbreviation,
                policy: createSectionData.policy,
                policyPlain: sanitizedPolicy,
                word_count: createSectionData.word_count,
                identification_text: createSectionData.identification_text,
                journal: journal,
                journalId: createSectionData.journalId,
            }

            const newSection = this.sectionRepository.create(payload);

            const section = await this.sectionRepository.save(newSection);

            const data = {
                success: 'success',
                message: 'Section created successfully',
                section
            }
            
            return data;
        } catch{
            throw new HttpException(
                'Couldnt save the Section!',
                HttpStatus.BAD_REQUEST
            );
        }
    }

    async updateSection(section_id: number, updateSectionData: UpdateSectionDto) : Promise<any> {
        try{

            // const journal = await this.journalsRepository.findOneBy({ id: updateSectionData.journalId });
            // if(!journal)
            //     return{
            //         error: 'error',
            //         message: 'Journal not found'
            //     }

            const section = await this.sectionRepository.findOneBy({ id: section_id });
            if(!section)
                return{
                    error: 'error',
                    message: 'Section not found'
                }
            let sanitizedPolicy;

            if(updateSectionData.policy){
                sanitizedPolicy = this.sanitizerService.sanitizeInput(updateSectionData.policy);
            }

            const updatedFields = {
                title: updateSectionData.title,
                abbreviation: updateSectionData.abbreviation,
                policy: updateSectionData.policy??'',
                policyPlain: sanitizedPolicy??'',
                word_count: updateSectionData.word_count,
                identification_text: updateSectionData.identification_text,
            }

            const updated = await this.sectionRepository.update({ id: section.id }, updatedFields);

            if(updated.affected < 1)
                throw new HttpException(
                    'Couldnt save the Section!',
                    HttpStatus.BAD_REQUEST
                );

            const data = {
                success: 'success',
                message: 'Section created successfully',
                section
            }
            return data;
        } catch{
            throw new HttpException(
                'Couldnt save the Section!',
                HttpStatus.BAD_REQUEST
            );
        }
    }

    async findAllSections() {
        const sections = await this.sectionRepository.find({});

        const res = {
            success: 'success',
            message: 'successfull',
            sections
        };
  
        return res;
    }


    async deleteSection(id: number) {
        try {
            const section = await this.sectionRepository.findOne({
                where: { id },
            });
        
            if (!section) {
                return { error: 'error', message: 'Section not found' };
            }
                
            await this.sectionRepository.delete(id);

            return { success: 'success', message: 'Section deleted successfully' };
    
        } catch (err) {
            console.error('Error deleting section:', err);
            throw new HttpException(
                'Error deleting Section',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

}
