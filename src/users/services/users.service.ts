import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Journal } from 'src/typeorm/entities/Journal';
import { Profile } from 'src/typeorm/entities/Profile';
import { Submission } from 'src/typeorm/entities/Submission';
import { User } from 'src/typeorm/entities/User';
import { UserRole } from 'src/typeorm/entities/UserRole';
import { Repository } from 'typeorm';

// export type User = any;

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User) private userRepository: Repository<User>,
        @InjectRepository(Profile) private profileRepository: Repository<Profile>,        
        @InjectRepository(UserRole) private userRoleRepository: Repository<UserRole>,        
        @InjectRepository(Submission) private submissionsRepository: Repository<Submission>,        
        @InjectRepository(Journal) private journalRepository: Repository<Journal>,        
    ) {}

      
    // private readonly users = [
    //     {
    //       id: 1,
    //       username: 'john',
    //       email: 'john',
    //       password: 'changeme',
    //     },
    //     {
    //       id: 2,
    //       username: 'maria',
    //       email: 'maria',
    //       password: 'guess',
    //     },
    // ];

      
    // async findOne(username: string): Promise<User | undefined> {
    //     return this.users.find(user => user.username === username);
    // }

    async getUserSubmissions(user_id: number): Promise<any | undefined> {
        const user = await this.userRepository.findOne({where: { id: user_id }});
        console.log(user, 'user')
        if(!user){
            return{
                error: 'error',
                message: 'No User Found'
            }
        }

        const data = await this.submissionsRepository.find({
            where:{ user : user, completed: 1},
            order: {
                createdAt: 'DESC', // Sort by creation date in descending order
            },
            relations: ['user', 'files', 'user.profile'],
        });

        const res = {
            success: 'success',
            message: 'successful',
            data
        };

        return res;
    }

    async getUserJournalSubmissions(user_id: number, journal_id: number): Promise<any | undefined> {
        const user = await this.userRepository.findOne({where: { id: user_id }});
        if(!user){
            return{
                error: 'error',
                message: 'No User Found'
            }
        }

        const journal = await this.journalRepository.findOne({where: { id: journal_id }});
        if(!journal){
            return{
                error: 'error',
                message: 'No User Found'
            }
        }

        const data = await this.submissionsRepository.find({
            where:{ user : user, completed: 1, journalId: journal.id},
            order: {
                createdAt: 'DESC', // Sort by creation date in descending order
            },
            relations: ['user', 'files', 'user.profile'],
        });

        const res = {
            success: 'success',
            message: 'successful',
            data
        };

        return res;
    }


    async getUserAccountById(id: number) {
        const user = await this.userRepository.findOneBy({ id });    
        return user;
    }

    async getUserAccountByEmail(email: string) {
        // const user = this.users.find(user => user.email === email);
        const user = await this.userRepository.findOneBy({ email });    
        return user;
    }

    async getUserAccountPassword(email: string): Promise<string | undefined> {
        // const user = this.users.find(user => user.email === email);
        const user = await this.userRepository.findOneBy({ email });
        return user?.password;
    }
    
    async checkUserAccountEmailExists(email: string): Promise<boolean> {
        const user = await this.getUserAccountByEmail(email);
        if (user) return true;
        return false;
    }

    async getUserRoles(userId: number): Promise<UserRole[]> {
        return await this.userRoleRepository.find({
          where: { user: { id: userId } },
          relations: ['role'],
        });
    }
    
}
