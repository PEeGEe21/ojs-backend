import { ConflictException, forwardRef, HttpException, HttpStatus, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateRoleDto } from '../dtos/create-role.dto';
import { AuthService } from 'src/auth/services/auth.service';
import { User } from 'src/typeorm/entities/User';
import { Role } from 'src/typeorm/entities/Role';
import { Repository } from 'typeorm';

@Injectable()
export class RolesService {
    constructor(
        @InjectRepository(Role) private roleRepository: Repository<Role>,        
    ) {}

    async createRole(createRoleData: CreateRoleDto) : Promise<any> {
        try{
            const payload = {
                name: createRoleData.name,
                description: createRoleData.description,
            }

            const newRole = this.roleRepository.create(payload);

            const role = await this.roleRepository.save(newRole);

            const data = {
                success: 'success',
                message: 'Role created successfully',
                role
            }
            
            return data;
        } catch{
            throw new HttpException(
                'Couldnt save the Role!',
                HttpStatus.BAD_REQUEST
            );
        }
    }

    async updateRoleStatus(role_id: number){
        try{
            const role = await this.roleRepository.findOneBy({ id: role_id });
            if(!role)
                return{
                    error: 'error',
                    message: 'User not found'
                }

            let is_active =!role.is_active;
            await this.roleRepository.update({ id: role.id }, {is_active: is_active});

            const data = {
                success: 'success',
                message: 'Role status updated successfully',
            }
            return data;
        } catch(err){

        }
    }

    async updateRole(role_id: number, createRoleData: CreateRoleDto) : Promise<any> {
        try{

            const role = await this.roleRepository.findOneBy({ id: role_id });
            if(!role)
                return{
                    error: 'error',
                    message: 'Role not found'
                }

            const updatedFields = {
                name: createRoleData.name,
                description: createRoleData.description,
            }

            const updated = await this.roleRepository.update({ id: role.id }, updatedFields);

            if(updated.affected < 1)
                throw new HttpException(
                    'Couldnt save the Role!',
                    HttpStatus.BAD_REQUEST
                );

            const data = {
                success: 'success',
                message: 'Role created successfully',
                role
            }
            return data;
        } catch{
            throw new HttpException(
                'Couldnt save the Role!',
                HttpStatus.BAD_REQUEST
            );
        }
    }


    async findAllRoles() {
        const roles = await this.roleRepository.find({});

        const res = {
            success: 'success',
            message: 'successfull',
            roles
        };
  
        return res;
    }


    async deleteRole(id: number) {
        try {
            const role = await this.roleRepository.findOne({
                where: { id },
            });
        
            if (!role) {
                return { error: 'error', message: 'Role not found' };
            }
                
            await this.roleRepository.delete(id);

            return { success: 'success', message: 'Role deleted successfully' };
    
        } catch (err) {
            console.error('Error deleting role:', err);
            throw new HttpException(
                'Error deleting Role',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }
}
