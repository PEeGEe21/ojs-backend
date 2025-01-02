import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post } from '@nestjs/common';
import { UsersService } from '../services/users.service';

@Controller('users')
export class UsersController {
    constructor(private usersService: UsersService) {}

    @Get('/init-data')
    initData() {
        return this.usersService.initData();
    }

    @Get(':id')
    findOne(
        @Param('id') id: number
    ) {
        return this.usersService.findOne(id);
    }

    @Get('/')
    findAll() {
        return this.usersService.findAll();
    }

    @Delete('delete/:id')
    remove(@Param('id') id: number) {
        return this.usersService.delete(+id);
    }

    @Get('/:user_id/submissions')
    getUserSubmissions(@Param('user_id', ParseIntPipe) user_id: number) {
        console.log('in here')
        return this.usersService.getUserSubmissions(user_id);
    }

    @Get('/:user_id/:journal_id/submissions')
    getUserJournalSubmissions(
        @Param('user_id', ParseIntPipe) user_id: number,
        @Param('journal_id', ParseIntPipe) journal_id: number,
    ) {
        return this.usersService.getUserJournalSubmissions(user_id, journal_id);
    }

    @Get('/role/:role_id')
    findUsersWithRole(
        @Param('role_id', ParseIntPipe) role_id: number,
    ) {
        return this.usersService.findUsersWithRole(role_id);
    }

    @Get('/reset-profiles')
    resetUserProfiles() {
        return this.usersService.resetUserProfiles();
    }

    @Post('/add-user')
    async createUser(
        @Body() userSignupDto: any,
    ): Promise<any> {
        return this.usersService.createUser(userSignupDto);
    }

    @Post('/update-user/:user_id')
    async updateUser(
        @Param('user_id', ParseIntPipe) user_id: number,
        @Body() userUpdateDto: any,
    ): Promise<any> {
        return this.usersService.updateUser(user_id, userUpdateDto);
    }

    @Post('/update-user-password/:user_id')
    async updateUserPassword(
        @Param('user_id', ParseIntPipe) user_id: number,
        @Body() userUpdateDto: any,
    ): Promise<any> {
        return this.usersService.updateUserPassword(user_id, userUpdateDto);
    }

    @Post('/update-user-profile/:user_id')
    async updateUserProfile(
        @Param('user_id', ParseIntPipe) user_id: number,
        @Body() userUpdateDto: any,
    ): Promise<any> {
        return this.usersService.updateUserProfile(user_id, userUpdateDto);
    }

    @Post('/delete-user-avatar/:user_id')
    async deleteUserAvatar(
        @Param('user_id', ParseIntPipe) user_id: number,
    ): Promise<any> {
        return this.usersService.deleteUserAvatar(user_id);
    }

    @Post('/update-user-identity-profile/:user_id')
    async updateUserIdentityProfile(
        @Param('user_id', ParseIntPipe) user_id: number,
        @Body() userUpdateDto: any,
    ): Promise<any> {
        return this.usersService.updateUserIdentityProfile(user_id, userUpdateDto);
    }

    @Post('/update-user-contact-profile/:user_id')
    async updateUserContactProfile(
        @Param('user_id', ParseIntPipe) user_id: number,
        @Body() userUpdateDto: any,
    ): Promise<any> {
        return this.usersService.updateUserContactProfile(user_id, userUpdateDto);
    }

    @Post('/update-active-status/:user_id')
    async updateUserStatus(
        @Param('user_id', ParseIntPipe) user_id: number,
    ): Promise<any> {
        return this.usersService.updateUserStatus(user_id);
    }

}
