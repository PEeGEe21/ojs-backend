import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './services/users.service';
import { UsersController } from './controllers/users.controller';
import { User } from 'src/typeorm/entities/User';
import { Profile } from 'src/typeorm/entities/Profile';
import { Role } from 'src/typeorm/entities/Role';
import { UserRole } from 'src/typeorm/entities/UserRole';
import { SubmissionFile } from 'src/typeorm/entities/SubmissionFIle';
import { Submission } from 'src/typeorm/entities/Submission';
import { Journal } from 'src/typeorm/entities/Journal';
import { AuthModule } from 'src/auth/auth.module';
import { SubmissionsModule } from 'src/submissions/submissions.module';
import { AuthService } from 'src/auth/services/auth.service';

@Module({
  imports: [
    forwardRef(() => AuthModule),
    SubmissionsModule,
    TypeOrmModule.forFeature([User, Profile, Role, UserRole, Submission, SubmissionFile, Journal])],
  providers: [UsersService],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
