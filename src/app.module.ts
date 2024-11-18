import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { User } from './typeorm/entities/User';
import { Profile } from './typeorm/entities/Profile';
import { config } from './config';
import { SeederService } from './seeder/seeder.service';
import { UserRole } from './typeorm/entities/UserRole';
import { Role } from './typeorm/entities/Role';
import { SubmissionsModule } from './submissions/submissions.module';
import { Submission } from './typeorm/entities/Submission';
import { SubmissionFile } from './typeorm/entities/SubmissionFIle';
import { JournalsModule } from './journals/journals.module';
import { Journal } from './typeorm/entities/Journal';
import { RolesModule } from './roles/roles.module';
import { IssuesModule } from './issues/issues.module';
import { Issue } from './typeorm/entities/Issue';
import { Section } from './typeorm/entities/Section';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DATABASE_HOST,
      port: Number(process.env.DATABASE_PORT),
      username: process.env.DATABASE_USERNAME,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME,
      ssl: { rejectUnauthorized: false },
      entities: [User, Profile, Role, UserRole, Submission, SubmissionFile, Journal, Issue, Section],
      synchronize: true,
      autoLoadEntities:true
    }),
    TypeOrmModule.forFeature([User, UserRole, Profile, Role, Submission, SubmissionFile, Journal, Issue, Section]), // Ensure Role is added here
    AuthModule, 
    UsersModule, 
    SubmissionsModule, 
    JournalsModule, 
    RolesModule, 
    IssuesModule
  ],
  controllers: [AppController],
  providers: [AppService, SeederService],
})
export class AppModule {}
