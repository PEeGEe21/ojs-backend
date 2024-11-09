import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { UsersService } from '../services/users.service';

@Controller('users')
export class UsersController {
    constructor(private usersService: UsersService) {}

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
}
