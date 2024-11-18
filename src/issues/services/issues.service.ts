import { ConflictException, forwardRef, HttpException, HttpStatus, Inject, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateIssueDto } from '../dto/create-issue.dto';
import { Issue } from 'src/typeorm/entities/Issue';
import { Repository } from 'typeorm';
import { User } from 'src/typeorm/entities/User';
import { UpdateIssueDto } from '../dto/update-issue.dto';
import { UsersService } from 'src/users/services/users.service';
import { SanitizerService } from 'src/core/utils/SanitizerService';
import { Journal } from 'src/typeorm/entities/Journal';

@Injectable()
export class IssuesService {
    constructor(

        private usersService: UsersService ,
        private readonly sanitizerService: SanitizerService,

        @InjectRepository(User) private userRepository: Repository<User>,        
        @InjectRepository(Issue) private issueRepository: Repository<Issue>,        
        @InjectRepository(Journal) private journalsRepository: Repository<Journal>,        
    ) {}

    async findAllIssues() {
        const issues = await this.issueRepository.find({});

        const res = {
            success: 'success',
            message: 'successfull',
            issues
        };
  
        return res;
    }

    async createIssue(issueData: CreateIssueDto): Promise<any> {
        try{

            const user = await this.usersService.getUserAccountById(issueData.userId)
        
            if (!user) {
                throw new NotFoundException('User not found');
            }

            const journal = await this.journalsRepository.findOne({where:{ id: issueData.journalId }});
            if (!journal) {
                throw new NotFoundException('Journal not found');
            }
        
            const sanitizedDescription = this.sanitizerService.sanitizeInput(issueData.description);

            const entryFields = {
                title: issueData.title,
                volume: issueData.volume,
                number: issueData.number,
                year: issueData.year,
                description: issueData.description,
                descriptionPlain: sanitizedDescription,
                cover_image_name: issueData.cover_image_name,
                cover_image_url: issueData.cover_image_url,
                url_path: issueData.url_path,
                user:user,
                userId:issueData.userId,
                journal:journal,
                journalId:issueData.journalId,
            }

            const newIssue = this.issueRepository.create(entryFields);

            const savedNewIssue = await this.issueRepository.save(newIssue);

            console.log(`issue has been created`);
            let data = {
                success: 'success',
                message: 'Created Successfully',
                issue: savedNewIssue,
            };
            return data;
    
        } catch (err) {
            let data = {
                error: err.message,
            };
            return data;
        }
    };

    async updateIssueStatus(issue_id: number){
        try{
            const issue = await this.issueRepository.findOneBy({ id: issue_id });
            if(!issue)
                return{
                    error: 'error',
                    message: 'User not found'
                }

            let is_active =!issue.status;
            await this.issueRepository.update({ id: issue.id }, {status: is_active});

            const data = {
                success: 'success',
                message: 'Issue status updated successfully',
            }
            return data;
        } catch(err){

        }
    }

    async updateIssue(id: number, updateIssueDto: UpdateIssueDto) {
        try{
    
            const user = await this.usersService.getUserAccountById(updateIssueDto.userId)
        
            if (!user) {
                throw new NotFoundException('User not found');
            }
        
            const issue = await this.issueRepository.findOne({where:{ id }});
            if (!issue) {
                throw new NotFoundException('Issue not found');
            }
        
            // console.log(optionType, difficultyType)
            const sanitizedDescription = this.sanitizerService.sanitizeInput(updateIssueDto.description);
            // console.log(sanitizedQuestion, questionData.question, 'questionData.question');
            // return;
        
            const updatedFields = {
                // userId: updateIssueDto.userId,
                title: updateIssueDto.title,
                volume: updateIssueDto.volume,
                number: updateIssueDto.number,
                year: updateIssueDto.year,
                description: updateIssueDto.description,
                descriptionPlain: sanitizedDescription,
                cover_image_name: updateIssueDto.cover_image_name,
                cover_image_url: updateIssueDto.cover_image_url,
                url_path: updateIssueDto.url_path,
                user:user,
            }
    
            const update = await this.issueRepository.update({ id }, updatedFields);
        
            console.log(update)
            if(update.affected < 1){
                return {
                    error:'error',
                    message: 'An error has occurred'
                }
            }
    
            const newIssue = await this.issueRepository.findOne({where:{ id }});
            
            let data = {
                success: 'success',
                issue: newIssue,
            };
            return data;
    
        } catch (err) {
            let data = {
                error: err.message,
            };
            return data;
        }
    }


    async deleteIssue(id: number) {
        try {
            const issue = await this.issueRepository.findOne({
                where: { id },
            });
        
            if (!issue) {
                return { error: 'error', message: 'Issue not found' };
            }
    
            await this.issueRepository.delete(id);
            return { success: 'success', message: 'Issue deleted successfully' };
    
        } catch (err) {
                console.error('Error deleting Issue:', err);
                throw new HttpException(
                    'Error deleting Issue',
                    HttpStatus.INTERNAL_SERVER_ERROR,
                );
        }
    }
}
