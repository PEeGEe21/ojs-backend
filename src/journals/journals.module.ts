import { forwardRef, Module } from '@nestjs/common';
import { JournalsService } from './services/journals.service';
import { JournalsController } from './controllers/journals.controller';
import { UsersService } from 'src/users/services/users.service';
import { SanitizerService } from 'src/core/utils/SanitizerService';
import { User } from 'src/typeorm/entities/User';
import { Profile } from 'src/typeorm/entities/Profile';
import { Role } from 'src/typeorm/entities/Role';
import { UserRole } from 'src/typeorm/entities/UserRole';
import { Submission } from 'src/typeorm/entities/Submission';
import { SubmissionFile } from 'src/typeorm/entities/SubmissionFIle';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Journal } from 'src/typeorm/entities/Journal';
import { AuthModule } from 'src/auth/auth.module';
import { UsersModule } from 'src/users/users.module';
import { Issue } from 'src/typeorm/entities/Issue';
import { Section } from 'src/typeorm/entities/Section';

@Module({
  imports: [
    forwardRef(() => AuthModule),  // Import AuthModule here
    forwardRef(() => UsersModule), // Import UsersModule if needed
    TypeOrmModule.forFeature([User, Profile, Role, UserRole, Submission, SubmissionFile, Journal, Issue, Section])
  ],
  providers: [JournalsService, UsersService, SanitizerService],
  controllers: [JournalsController],
  exports: [JournalsService]
})
export class JournalsModule {}
