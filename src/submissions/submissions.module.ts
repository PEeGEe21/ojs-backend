import { Module } from '@nestjs/common';
import { SubmissionsService } from './services/submissions.service';
import { SubmissionsController } from './controllers/submissions.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/typeorm/entities/User';
import { Profile } from 'src/typeorm/entities/Profile';
import { Role } from 'src/typeorm/entities/Role';
import { UserRole } from 'src/typeorm/entities/UserRole';
import { Submission } from 'src/typeorm/entities/Submission';
import { SubmissionFile } from 'src/typeorm/entities/SubmissionFIle';
import { UsersService } from 'src/users/services/users.service';
import { SanitizerService } from 'src/core/utils/SanitizerService';
import { Journal } from 'src/typeorm/entities/Journal';

@Module({
  imports: [TypeOrmModule.forFeature([User, Profile, Role, UserRole, Submission, SubmissionFile, Journal])],
  controllers: [SubmissionsController],
  providers: [SubmissionsService, UsersService, SanitizerService],
  exports: [SubmissionsService]
})
export class SubmissionsModule {}
