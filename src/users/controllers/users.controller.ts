import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post } from '@nestjs/common';
import { UsersService } from '../services/users.service';

@Controller('users')
export class UsersController {
    constructor(private usersService: UsersService) {}

    @Get('/init-data')
    initData() {
        return this.usersService.initData();
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
        console.log('in here')
        return this.usersService.getUserJournalSubmissions(user_id, journal_id);
    }

    @Get('/role/:role_id')
    findUsersWithRole(
        @Param('role_id', ParseIntPipe) role_id: number,
    ) {
        console.log('in here')
        return this.usersService.findUsersWithRole(role_id);
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

    @Post('/update-active-status/:user_id')
    async updateUserStatus(
        @Param('user_id', ParseIntPipe) user_id: number,
    ): Promise<any> {
        return this.usersService.updateUserStatus(user_id);
    }

}
