import { forwardRef, Module } from '@nestjs/common';
import { IssuesController } from './controllers/issues.controller';
import { IssuesService } from './services/issues.service';
import { UsersService } from 'src/users/services/users.service';
import { SanitizerService } from 'src/core/utils/SanitizerService';
import { UsersModule } from 'src/users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Issue } from 'src/typeorm/entities/Issue';
import { Journal } from 'src/typeorm/entities/Journal';
import { SubmissionFile } from 'src/typeorm/entities/SubmissionFIle';
import { Submission } from 'src/typeorm/entities/Submission';
import { UserRole } from 'src/typeorm/entities/UserRole';
import { Role } from 'src/typeorm/entities/Role';
import { Profile } from 'src/typeorm/entities/Profile';
import { User } from 'src/typeorm/entities/User';
import { JournalsModule } from 'src/journals/journals.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    forwardRef(() => AuthModule),  // Import AuthModule here
    forwardRef(() => UsersModule), // Import UsersModule if needed
    JournalsModule,
    TypeOrmModule.forFeature([User, Profile, Role, UserRole, Submission, SubmissionFile, Journal, Issue])
  ],
  controllers: [IssuesController],
  providers: [IssuesService, UsersService, SanitizerService],
  exports: [IssuesService]
})
export class IssuesModule {}
