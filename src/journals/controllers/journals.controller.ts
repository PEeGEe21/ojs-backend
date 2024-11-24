import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { JournalsService } from '../services/journals.service';
import { CreateJournalDto } from '../dto/create-journal.dto';
import { UpdateJournalDto } from '../dto/update-journal.dto';
import { CreateSectionDto } from '../dto/create-section.dto';
import { UpdateSectionDto } from '../dto/update-section.dto';

@Controller('journals')
export class JournalsController {
    constructor(private readonly journalsService: JournalsService) {}

    @Post()
    create(@Body() createJournalDto: CreateJournalDto) {
        return this.journalsService.create(createJournalDto);
    }

    @Get()
    findActiveJournals() { 
        return this.journalsService.findActiveJournals();
    }

    @Get('/all')
    findAll() { 
        return this.journalsService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: number) {
        return this.journalsService.findOne(+id);
    }

    @Post('/update-journal/:id')
    update(@Param('id') id: number, @Body() updateJournalDto: UpdateJournalDto) {
        return this.journalsService.update(+id, updateJournalDto);
    }

    @Delete('delete/:id')
    remove(@Param('id') id: number) {
        return this.journalsService.remove(+id);
    }

    @Post('/update-active-status/:journal_id')
    async updateUserStatus(
        @Param('journal_id', ParseIntPipe) journal_id: number,
    ): Promise<any> {
        return this.journalsService.updateJournalStatus(journal_id);
    }

    @Get('/issues/:journal_id')
    async findActiveJournalIssues(
        @Param('journal_id', ParseIntPipe) journal_id: number,
    ): Promise<any> {
        return this.journalsService.findActiveJournalIssues(journal_id);
    }

    @Get('/all-issues/:journal_id')
    async findJournalIssues(
        @Param('journal_id', ParseIntPipe) journal_id: number,
    ): Promise<any> {
        return this.journalsService.findJournalIssues(journal_id);
    }



    // sections
    @Get('/sections/:journal_id')
    findJournalSections(@Param('journal_id') journal_id: number) {
        return this.journalsService.findJournalSections(journal_id);
    }

    @Post('/sections')
    createSection(@Body() createSectionDto: CreateSectionDto) {
        return this.journalsService.createSection(createSectionDto);
    }

    @Delete('/sections/delete/:id')
    deleteSection(@Param('id') id: number) {
        return this.journalsService.deleteSection(+id);
    }

    @Post('/sections/update-section/:id')
    updateSection(@Param('id') id: number, @Body() updateSectionDto: UpdateSectionDto) {
        return this.journalsService.updateSection(+id, updateSectionDto);
    }



}
