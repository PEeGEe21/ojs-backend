import { BadRequestException, ConflictException, HttpException, HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from 'src/users/services/users.service';
import { JwtService } from '@nestjs/jwt';
import { EmailLoginDto } from '../dtos/email-login.dto';
import { LoginResponseDto } from '../dtos/login-response.dto';
import * as bcrypt from 'bcryptjs';
import { CreateUserDto } from '../dtos/create-user.dto';
import { SignUpResponseDto } from '../dtos/signup-response.dto';
import { CreateUserProfileDto } from '../dtos/create-user-profile.dto';
import { User } from 'src/typeorm/entities/User';
import { Repository } from 'typeorm';
import { Profile } from 'src/typeorm/entities/Profile';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRole } from 'src/typeorm/entities/UserRole';
import { Role } from 'src/typeorm/entities/Role';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,


        @InjectRepository(User) private userRepository: Repository<User>,
        @InjectRepository(Profile) private userProfileRepository: Repository<Profile>,
        @InjectRepository(UserRole) private userRoleRepository: Repository<UserRole>,
        @InjectRepository(Role) private roleRepository: Repository<Role>,
    ) {}

    async signIn(loginDto: EmailLoginDto): Promise<LoginResponseDto> {
        const { email, password } = loginDto;
        const user = await this.usersService.getUserAccountByEmail(email);
        if (!user)
            throw new HttpException('User not found.', HttpStatus.BAD_REQUEST);

        await this.usersService.checkAccountActiveStatus(user.id);

        if (user) return this.loginUser(user, password);
        return this.loginUser(user, password);
    }

    private async loginUser(
        user: any,
        password: string,
      ): Promise<LoginResponseDto> {
        
        try {
          console.log(user, 'dfd')
            if (!user) {
                throw new UnauthorizedException(
                    'SignIn Failed!, Incorrect login credentials',
                );
            }
            
            const userPassword = await this.usersService.getUserAccountPassword(
                user.email,
            );
        
            const isCorrectPassword = await bcrypt.compare(password, userPassword);

            if (!isCorrectPassword) {
                throw new BadRequestException(
                    'SignIn Failed!, Incorrect login credentials',
                );
            }
            
          console.log(user, 'dfd')


            const userRoles = await this.usersService.getUserRoles(user.id);
            console.log(userRoles,' eeffef')
            const defaultUserRole = userRoles.find(role => role.is_default) || null;

            const payload = {
                email: user.email,
                sub: user.id,
            };
        
            delete user.password;
        
            const response = {
                access_token: await this.jwtService.signAsync(payload),
                success: 'success',
                message: 'Logged in successfully',
                user: { 
                  ...user, 
                  roles: userRoles,
                  defaultRole: defaultUserRole.role, 
                  user_default_role: defaultUserRole.role.name,
                  user_default_role_id: defaultUserRole.role.id,  
                  rolesIds : userRoles.map((role) => role.roleId)

                },
            };

            return response;

        } catch (error) {
          console.log(error, 'Error')
            throw new Error('Error Occured while signing');
        }
        
    }

    async signUp(
        userdetails: CreateUserDto,
      ): Promise<SignUpResponseDto> {
    
        // if(!userdetails.email || !userdetails.password  || !userdetails.cpassword){
        if(!userdetails.email){
            throw new BadRequestException(
              `email field is required`,
            );
        }

        await this.validatePasswords(userdetails.password, userdetails.cpassword)
        // console.log(userdetails, 'herer');
        // return;
    
        await this.checkUserAccountEmailExists(userdetails.email);
    
        if (userdetails.password) {
          userdetails.password = await this.hashPassword(userdetails.password);
        }
        const user: any = await this.createUser(userdetails);
    
        const userprofilepayload = {
          user: user,
          email: user.email,
          profile_created: 1
        };

        if(userdetails.signup_as){
          const role = await this.roleRepository.findOneBy({ id: userdetails.signup_as });
          if (!role) throw new Error('Role not found');

          await this.addRoleAndDefaultRole(user, role);
        }
    
        const userProfileDetails = await this.createUserProfile(user.id, userprofilepayload)
    
        const payload = {
          email: user.email,
          sub: user.id,
        };
        user.profile = userProfileDetails
        const profile = userProfileDetails
    
        user.profileId = profile.id;
        // user.update();
        console.log(profile, 'profile details')


        const userRoles = await this.usersService.getUserRoles(user.id);
        // if(userRoles.length > 0)
        const defaultRole = userRoles.find(role => role.is_default) || null;

        console.log(userRoles, defaultRole)
        // if (config.env === 'production') {
        //   const data = {
        //     env: 'Production',
        //     name: `${userdetails.firstName} ${userdetails.lastName}`,
        //     email: userdetails.email,
        //   };
        //   await this.messagingService.userSignUpNotification(data);
        // }
        delete user.password;
    
        return {
          success: "success",
          access_token: this.jwtService.sign(payload),
          user: { ...user, roles: userRoles, defaultRole },
          profile:profile,
          message: 'Account was successfully created',
        };
    }

    // Password validation function
    async validatePasswords(password: string | undefined, confirmPassword: string | undefined): Promise<void> {
      // Check if either password is missing
      if (!password || !confirmPassword) {
          throw new HttpException(
              'Both password and confirm password are required',
              HttpStatus.BAD_REQUEST
          );
      }

      // Check if passwords match
      if (password !== confirmPassword) {
          throw new HttpException(
              'Passwords do not match',
              HttpStatus.BAD_REQUEST
          );
      }

      // Optional: Add additional password strength validation
      if (password.length < 8) {
          throw new HttpException(
              'Password must be at least 8 characters long',
              HttpStatus.BAD_REQUEST
          );
      }
    }

    async hashPassword(password){
      const saltOrRounds = 10;
      const hashedPassword = await bcrypt.hash(
        password,
        saltOrRounds,
      );
      return hashedPassword;
    }
    
    async createUser(userDetails: CreateUserDto) {
        const newUser = this.userRepository.create({
          ...userDetails,
          firstname: userDetails.fname,
          lastname: userDetails.lname,
          created_at: new Date(),
        });

        return this.userRepository.save(newUser);
    }
    
    async addRoleAndDefaultRole(user, role, isDefault = true) {
      const userRole = this.userRoleRepository.create({
        user: user,
        role: role,
        userId: user.id,
        roleId: role.id,
        is_default: isDefault,
      });
      return this.userRoleRepository.save(userRole);
    }
    async createUserProfile(user_id: number, userProfileDetails: CreateUserProfileDto) {
        const newUserProfile = this.userProfileRepository.create({
          ...userProfileDetails,
        });
        return this.userProfileRepository.save(newUserProfile);
    }

    async checkUserAccountEmailExists(email: string): Promise<void> {
        const userAccountExists: boolean =
          await this.usersService.checkUserAccountEmailExists(email);
        if (userAccountExists) {
          throw new ConflictException(
            'An account with this email exists!',
          );
        }
    }
  
    // async signIn(username: string, pass: string): Promise<{ access_token: string }> {
    //   const user = await this.usersService.findOne(username);
    //   if (user?.password !== pass) {
    //     throw new UnauthorizedException();
    //   }
    //   const payload = { sub: user.userId, username: user.username };
    //   return {
    //     access_token: await this.jwtService.signAsync(payload),
    //   };
    // }

  }
