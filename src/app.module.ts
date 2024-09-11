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

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: config.db.type,
      host: config.db.host,
      port: config.db.port,
      username: config.db.username,
      password: config.db.password,
      database: config.db.name,
      entities: [User, Profile, Role, UserRole],
      synchronize: true,
      autoLoadEntities:true
    }),
    TypeOrmModule.forFeature([Role]), // Ensure Role is added here
    AuthModule, 
    UsersModule
  ],
  controllers: [AppController],
  providers: [AppService, SeederService],
})
export class AppModule {}
