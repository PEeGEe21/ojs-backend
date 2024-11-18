import { Module } from '@nestjs/common';
import { RolesController } from './controllers/roles.controller';
import { RolesService } from './services/roles.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/typeorm/entities/User';
import { UserRole } from 'src/typeorm/entities/UserRole';
import { Role } from 'src/typeorm/entities/Role';
import { Profile } from 'src/typeorm/entities/Profile';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Profile, Role, UserRole])
  ],
  exports: [RolesService],
  controllers: [RolesController],
  providers: [RolesService]
})
export class RolesModule {}
