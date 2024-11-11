import { ConflictException, forwardRef, HttpException, HttpStatus, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto } from 'src/auth/dtos/create-user.dto';
import { UpdateUserDto } from 'src/auth/dtos/update-user.dto';
import { AuthService } from 'src/auth/services/auth.service';
import { Journal } from 'src/typeorm/entities/Journal';
import { Profile } from 'src/typeorm/entities/Profile';
import { Role } from 'src/typeorm/entities/Role';
import { Submission } from 'src/typeorm/entities/Submission';
import { User } from 'src/typeorm/entities/User';
import { UserRole } from 'src/typeorm/entities/UserRole';
import { Repository } from 'typeorm';

// export type User = any;

@Injectable()
export class UsersService {
    constructor(

        @Inject(forwardRef(() => AuthService))
        private authService: AuthService,

        @InjectRepository(User) private userRepository: Repository<User>,
        @InjectRepository(Profile) private profileRepository: Repository<Profile>,        
        @InjectRepository(UserRole) private userRoleRepository: Repository<UserRole>,        
        @InjectRepository(Submission) private submissionsRepository: Repository<Submission>,        
        @InjectRepository(Journal) private journalRepository: Repository<Journal>,        
        @InjectRepository(Role) private roleRepository: Repository<Role>,        
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

    async findAll() {
        const users = await this.userRepository.find({relations: ['userRoles.role']});
        const roles = await this.roleRepository.find({});
    

        const updatedUsers = users.map((user) => {
            const roles = user.userRoles;
            const rolesIds = roles.map((role) => role.roleId); // Pluck role IDs
            const defaultUserRole = roles.find((role) => role.is_default); 
            const defaultRole = defaultUserRole ? defaultUserRole.role : null;
            const user_default_role = defaultRole ? defaultRole.name : null;
            const user_default_role_id = defaultRole ? Number(defaultRole.id) : null;
          
            return {     
                ...user,
                roles: roles,
                default_role: defaultRole,
                user_default_role,
                user_default_role_id,
                rolesIds
            };
        });

        const res = {
            success: 'success',
            message: 'successfull',
            users: updatedUsers,
            roles
        };
  
        return res;
    }

    async delete(id: number) {
        try {
            const user = await this.userRepository.findOne({
                where: { id },
            });
        
            if (!user) {
                return { error: 'error', message: 'User not found' };
            }
    
            await this.deleteUserRoles(user);

            await this.deleteUserProfile(user);
                
            await this.userRepository.delete(id);

            return { success: 'success', message: 'User deleted successfully' };
    
        } catch (err) {
                console.error('Error deleting user:', err);
                throw new HttpException(
                    'Error deleting User',
                    HttpStatus.INTERNAL_SERVER_ERROR,
                );
        }
    }

    async deleteUserProfile(user){
        const user_profile = await this.profileRepository.findOne({
            where: { user: user },
        });

        if(user_profile)
            await this.profileRepository.delete(user_profile.id);
    }

    async deleteUserRoles(user){
        const user_roles = await this.userRoleRepository.find({
            where: { user: user },
        });

        for (const role of user_roles) {
            await this.userRoleRepository.delete(role.id);
        };
    }

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

    async createUser(userdetails: CreateUserDto){
        const savedData = await this.authService.signUp(userdetails);
        const data = {
            success: 'success',
            message: 'User created successfully',
        }
        return data
    }

    async updateUser(user_id: number, userdetails: UpdateUserDto){
        const user  = await this.getUserAccountById(user_id);
        if(!user)
            return{
                error: 'error',
                message: 'User not found'
            }

        const matches = await this.checkUserEmailMatchesIncoming(user, userdetails)
        if(!matches)
            await this.authService.checkUserAccountEmailExists(userdetails.email);
        
        const updatedFields: {
            username: string;
            firstname: string;
            lastname: string;
            email: string;
            password?: string; 
        } = {
            username: userdetails.username,
            firstname: userdetails.fname,
            lastname: userdetails.lname,
            email: userdetails.email,
        };

        if(userdetails.roles.length > 0){
            await this.updateUserRoles(user, userdetails);
            // for(const user_role of userdetails.roles){
            //     let isDefault = false;
            //     const role = await this.roleRepository.findOneBy({ id: user_role });
            //     if (!role) {
            //         throw new HttpException('Role not found', HttpStatus.NOT_FOUND);
            //       }
              
    
            //     if(user_role === Number(userdetails.defaultRole)){
            //         isDefault = true;
            //     }

            //     const existingUserRole = await this.userRoleRepository.findOne({ where: { userId: user.id , roleId: role.id} });

            //     if (existingUserRole) {
            //         if (isDefault && !existingUserRole.is_default) {
            //             existingUserRole.is_default = true;
            //             await this.userRoleRepository.save(existingUserRole);
            //         }

            //         if (!userdetails.roles.includes(user_role)) {
            //             await this.userRoleRepository.remove(existingUserRole);
            //         }
            //     } else {
            //         await this.authService.addRoleAndDefaultRole(user, role, isDefault);
            //     }
            // }
        }

        
        if(userdetails.password || userdetails.password !== '')
            updatedFields.password = await this.authService.hashPassword(userdetails.password);


        const update = await this.userRepository.update({ id: user.id }, updatedFields);
    
        console.log(update)
        if(update.affected < 1){
            return {
                error:'error',
                message: 'An error has occurred'
            }
        }
    
        const data = {
            success: 'success',
            message: 'User updated successfully',
        }
        return data
    };

    async updateUserStatus(user_id: number){
        try{
            const user  = await this.getUserAccountById(user_id);
            if(!user)
                return{
                    error: 'error',
                    message: 'User not found'
                }

            let is_active =!user.is_active;
            await this.userRepository.update({ id: user.id }, {is_active: is_active});

            const data = {
                success: 'success',
                message: 'User status updated successfully',
            }
            return data;


        } catch(err){

        }
    }

    async updateUserRoles(
        user,
        userdetails
    ): Promise<void> {
        if (!userdetails.roles.length) {
            throw new HttpException(
                'User must have at least one role',
                HttpStatus.BAD_REQUEST
            );
        }

        if (userdetails.roles.length > 0) {
            // Get all existing user roles
            const existingUserRoles = await this.userRoleRepository.find({
                where: { userId: user.id }
            });
    
            const promises: Promise<any>[] = [];
    
            const rolesToRemove = await this.validateRoleChanges(
                user,
                userdetails,
                existingUserRoles
            );
            
            // Process each role
            for (const roleId of userdetails.roles) {
                const isDefault = roleId === Number(userdetails.defaultRole);
                const role = await this.roleRepository.findOneBy({ id: roleId });
                
                if (!role) {
                    throw new HttpException(
                        `Role with ID ${roleId} not found`,
                        HttpStatus.NOT_FOUND
                    );
                }
    
                const existingUserRole = existingUserRoles.find(
                    ur => ur.roleId == role.id
                );

                console.log(existingUserRoles, existingUserRole, 'heree')
    
                if (existingUserRole) {
                    // Update only if default status changed
                    console.log(isDefault !== existingUserRole.is_default)
                    if (isDefault !== existingUserRole.is_default) {
                        existingUserRole.is_default = isDefault;
        // const update = await this.userRepository.update({ id: user.id }, updatedFields);

                        promises.push(
                            this.userRoleRepository.update({ id: existingUserRole.id }, {is_default: isDefault})
                            // this.userRoleRepository.save(existingUserRole)
                        );
                    }
                } else {
                    // Add new role
                    promises.push(
                        this.authService.addRoleAndDefaultRole(user, role, isDefault)
                    );
                }
            }
    
            // Remove unchecked roles
            // const rolesToRemove = existingUserRoles.filter(
            //     existingRole => !userdetails.roles.includes(existingRole.roleId)
            // );
    
            console.log(rolesToRemove, 'rolesToRemove 1')
            if (rolesToRemove.length > 0) {
                console.log(rolesToRemove, 'rolesToRemove 2');
                promises.push(this.userRoleRepository.remove(rolesToRemove));
            }
    
            // // Execute all operations
            await Promise.all(promises);
        }
    }

    async validateRoleChanges(
        user: any,
        userdetails,
        existingUserRoles: any[]
    ) {
        // Validate that we're not removing all roles
        if (userdetails.roles.length === 0) {
            throw new HttpException(
                'User must have at least one role',
                HttpStatus.BAD_REQUEST
            );
        }

        // Get roles to be removed
        const rolesToRemove = existingUserRoles.filter(
            existingRole => !userdetails.roles.includes(existingRole.roleId)
        );

        // Check if we're trying to remove a default role
        const removingDefaultRole = rolesToRemove.some(role => role.is_default);
        if (removingDefaultRole) {
            // If removing default role, ensure a new default is specified
            const newDefaultSpecified = userdetails.roles.includes(Number(userdetails.defaultRole));
            if (!newDefaultSpecified) {
                throw new HttpException(
                    'Please Choose a Default Role!',
                    HttpStatus.BAD_REQUEST
                );
            }
        }

        return rolesToRemove;
    }



    async checkUserEmailMatchesIncoming(user, userDetails) {
        const currentEmail = user.email.trim().toLowerCase();
        const newEmail = userDetails.email.trim().toLowerCase();

        const matches = currentEmail === newEmail;

        return matches;
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

    async checkAccountActiveStatus(id: number): Promise<any> {
        const isDeactivated = await this.userRepository.findOne({ where: {id: id, is_active: false} });
        if (isDeactivated) {
            throw new UnauthorizedException(
                'Your account has been deactivated. Contact the Admin.',
            );
        }
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
        const user_roles =  await this.userRoleRepository.find({
          where: { user: { id: userId } },
          relations: ['role'],
        });

        console.log(user_roles, 'user_roles')
        if(user_roles.length > 0) {
            return user_roles;
        }
        return [];
    }
    
}
