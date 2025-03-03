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
import * as bcrypt from 'bcryptjs';
import { SanitizerService } from 'src/core/utils/SanitizerService';

// export type User = any;

@Injectable()
export class UsersService {
    constructor(

        @Inject(forwardRef(() => AuthService))
        private authService: AuthService,
        private readonly sanitizerService: SanitizerService,

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

    async findOne(id: number): Promise<any | undefined> { 
        try{
            const user = await this.userRepository.findOne({ where: {id: id, is_active: true}, relations: ['profile'] });

            if(!user)
                return {
                    error: 'User not found',
                    message: 'User not found',
                }

            return {
                success:'success',
                message:'success',
                user
            };
        } catch(err) {

        }
    }

    async findUsersWithRole2(role_id: any) {

        const users = await this.userRepository.find({relations: ['userRoles.role']});
        const role = await this.roleRepository.findOne({where: {id: role_id}});
    

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

    async findUsersWithRole(role_id: number) {
        // Fetch all users with their roles
      
        // Filter users whose roles include the given role_id and are not default
        const updatedUsers = await this.getUsersWithRole(role_id);
        const res = {
          success: 'success',
          message: 'successful',
          users: updatedUsers,
        };
      
        return res;
    }

    async getUsersWithRole(role_id: number): Promise<any>{
        const users = await this.userRepository.find({ relations: ['userRoles.role', 'profile'] });

        // const updatedSubmissions = await Promise.all(submissions.map(async (submission) => {

        const updatedUsers = users.map((user) => {
            
            const roles = user.userRoles.map((userRole) => userRole.role);
            const roleIds = roles.map((role) => role.id);
            
            // Check if the role exists and is NOT default
            const matchingRole = roles.find((role) => role.id == role_id && role.is_active);  
            const updatedUser =   {
                  ...user,
                  roles,
                  roleIds,
                };

            return matchingRole
              ? updatedUser
              : null;
          })
          .filter((user) => user !== null); // Filter out users who don't match the criteria
      
          return updatedUsers
    }

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


    async resetUserProfiles() {
        try{
            const users = await this.userRepository.find({});
            for (const user of users) {
                const userProfile = await this.findUserProfile(user);

                const updatedFields = {
                    profile: userProfile,
                }
        
                const update = await this.userRepository.update({ id: user.id }, updatedFields);
            
                if(update.affected < 1){
                    return {
                        error:'error',
                        message: 'An error has occurred'
                    }
                }

            }
            return {
                success: 'success',
                message: 'success'
            }
        } catch(err){

        }
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
        const user_profile = await this.findUserProfile(user);

        if(user_profile)
            await this.profileRepository.delete(user_profile.id);
    }

    async findUserProfile(user){
        const user_profile = await this.profileRepository.findOne({
            where: { user: user },
        });
        if(!user_profile)
            return null;

        return user_profile
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
        if(savedData.success == 'success'){
            const data = {
                success: 'success',
                message: 'User created successfully',
            }
            return data
        }

        throw new HttpException(
            'An Error Occurred!',
            HttpStatus.BAD_REQUEST
        );
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

    async updateUserPassword(user_id: number, userdetails: any){
        try{
            const user  = await this.getUserAccountById(user_id);
            if(!user)
                return{
                    error: 'error',
                    message: 'User not found'
                }

            const userPassword = await this.getUserAccountPassword(
                user.email,
            );
            
            const isCorrectPassword = await bcrypt.compare(userdetails.password, userPassword);
            
            if (!isCorrectPassword) {
                return{
                    error: 'error',
                    message: 'Incorrect Password'
                }

            }

            const matches = await this.checkPasswordMatchesIncoming(userdetails.apassword, userdetails.cpassword)
            if(!matches)
                return{
                    error: 'error',
                    message: 'New Passwords do not match'
                }
            
            const updatedFields: {
                password?: string; 
            } = {};
            
            if(userdetails.apassword || userdetails.apassword !== '')
                updatedFields.password = await this.authService.hashPassword(userdetails.apassword);


            const update = await this.userRepository.update({ id: user.id }, updatedFields);
        
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
        } catch(err){

        }
    };

    async updateUserProfile(user_id: number, userdetails: any){
        try{
            const user  = await this.getUserAccountById(user_id);
            if(!user)
                return{
                    error: 'error',
                    message: 'User not found'
                }

            const updateUserProfile = await this.updateProfile(user, userdetails);
            console.log(updateUserProfile, 'sdsd')
            if(!updateUserProfile){
                return {
                    error:'error',
                    message: 'An error has occurred'
                }
            }

            const updatedFields: {
                avatar?: string; 
            } = {
                avatar: userdetails.avatar
            };


            const update = await this.userRepository.update({ id: user.id }, updatedFields);
        
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
        } catch(err){

        }
    };

    async deleteUserAvatar(user_id: number){
        try{
            const user  = await this.getUserAccountById(user_id);
            if(!user)
                return{
                    error: 'error',
                    message: 'User not found'
                }

            const updatedFields: {
                avatar?: string; 
            } = {
                avatar: null
            };


            const update = await this.userRepository.update({ id: user.id }, updatedFields);
        
            if(update.affected < 1){
                return {
                    error:'error',
                    message: 'An error has occurred'
                }
            }
        
            const data = {
                success: 'success',
                message: 'User updated successfully',
                user: user,
            }
            return data
        } catch(err){

        }
    };

    async updateUserIdentityProfile(user_id: number, userdetails: any){
        try{
            const user  = await this.getUserAccountById(user_id);
            if(!user)
                return{
                    error: 'error',
                    message: 'User not found'
                }

            const updatedFields: {
                firstname?: string; 
                lastname?: string; 
                public_name?: string; 
            } = {
                firstname: userdetails.firstname??'',
                lastname: userdetails.lastname??'',
                public_name: userdetails.public_name??''
            };

            const update = await this.userRepository.update({ id: user.id }, updatedFields);
        
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
        } catch(err){

        }
    };

    async updateUserContactProfile(user_id: number, userdetails: any){
        try{
            const user  = await this.getUserAccountById(user_id);
            if(!user)
                return{
                    error: 'error',
                    message: 'User not found'
                }            
            
            const matches = await this.checkUserEmailMatchesIncoming(user, userdetails)
            if(!matches)
                await this.authService.checkUserAccountEmailExists(userdetails.email);
                
            const updateUserProfile = await this.updateProfile(user, userdetails);
            if(!updateUserProfile){
                return {
                    error:'error',
                    message: 'An error has occurred'
                }
            }

            const updatedFields: {
                email?: string; 
            } = {
                email: userdetails.email
            };


            const update = await this.userRepository.update({ id: user.id }, updatedFields);
        
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
        } catch(err){

        }
    };

    async updateProfile(user:any, userdetails:any){
        try{
            const profile = await this.profileRepository.findOne({ where: { user: user } });

            console.log(profile, 'ssd')
            if (!profile) {
                throw new HttpException('Profile not found', HttpStatus.NOT_FOUND);
            }

            

            const updatedFields: {
                bio?: string;
                bioPlain?: string;
                phonenumber?: string;
                affiliation?: string;
                mailing_address?: string;
                homepage?: string;
                orcid?: string;
            } = {
                // bio: userdetails.bio,
                // bioPlain: sanitizedBio,
                // homepage: userdetails.homepage??'',
                // orcid: userdetails.orcid??'',
                // phonenumber: userdetails.phonenumber??'',
                // affiliation: userdetails.affiliation??'',
                // mailing_address: userdetails.mailing_address??'',
            };

            if(userdetails.bio){
                const sanitizedBio = this.sanitizerService.sanitizeInput(userdetails.bio);
                updatedFields.bio = userdetails.bio??'';
                updatedFields.bioPlain = sanitizedBio;
            }

            if(userdetails.phonenumber)
                updatedFields.phonenumber = userdetails.phonenumber??'';

            if(userdetails.affiliation)
                updatedFields.affiliation = userdetails.affiliation??'';

            if(userdetails.mailing_address)
                updatedFields.mailing_address = userdetails.mailing_address??'';

            if(userdetails.homepage)
                updatedFields.homepage = userdetails.homepage??'';

            if(userdetails.orcid)
                updatedFields.orcid = userdetails.orcid??'';

            const update = await this.profileRepository.update({ id: profile.id }, updatedFields);
            if(update.affected < 1){
                return false
            }
            return true

        } catch (err) {
            console.log(err)
        }

    }

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


    

    // settings
    async initData() {
        const users = await this.userRepository.find({});

        const res = {
            success: 'success',
            message: 'successfull',
            users
        };
  
        return res;
    }

    async checkUserEmailMatchesIncoming(user, userDetails) {
        const currentEmail = user.email.trim().toLowerCase();
        const newEmail = userDetails.email.trim().toLowerCase();

        const matches = currentEmail === newEmail;

        return matches;
    }

    async checkPasswordMatchesIncoming(apassword, cpassword) {
        const password = apassword.trim();
        const confirmpassword = cpassword.trim();

        const matches = password === confirmpassword;

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
