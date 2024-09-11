import { Module } from '@nestjs/common';
import { AuthService } from './services/auth.service';
import { AuthController } from './contollers/auth.controller';
import { UsersModule } from 'src/users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { config } from 'src/config';
import { Profile } from 'src/typeorm/entities/Profile';
import { User } from 'src/typeorm/entities/User';
import { Role } from 'src/typeorm/entities/Role';
import { UserRole } from 'src/typeorm/entities/UserRole';

@Module({
  imports: [
    UsersModule,
    JwtModule.register({
      global: true,
      secret: config.secret,
      signOptions: {
        expiresIn: config.expires, // 1 week
      },
    }),
    TypeOrmModule.forFeature([User, Profile, Role, UserRole]),
  ],
  controllers: [AuthController],
  providers: [AuthService]
})
export class AuthModule {}
