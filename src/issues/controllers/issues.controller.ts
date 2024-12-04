import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post } from '@nestjs/common';
import { IssuesService } from '../services/issues.service';


@Controller('issues')
export class IssuesController {
    constructor(private issuesService: IssuesService) {}

    @Get('/')
    findAllIssues() {
        return this.issuesService.findAllIssues();
    }

    @Delete('delete/:id')
    removeIssue(@Param('id') id: number) {
        return this.issuesService.deleteIssue(+id);
    }

    @Post('/add-issue')
    async createIssue(
        @Body() issueCreateDto: any,
    ): Promise<any> {
        return this.issuesService.createIssue(issueCreateDto);
    }

    @Post('/update-status/:issue_id')
    async updateIssueStatus(
        @Param('issue_id', ParseIntPipe) issue_id: number,
    ): Promise<any> {
        return this.issuesService.updateIssueStatus(issue_id);
    }

    @Post('/update/:issue_id')
    async updateIssue(
        @Param('issue_id', ParseIntPipe) issue_id: number,
        @Body() issueUpdateDto: any,
    ): Promise<any> {
        return this.issuesService.updateIssue(issue_id, issueUpdateDto);
    }

    @Post(':id/publish')
    async publishIssue(
        @Param('id', ParseIntPipe) id: number,
    ): Promise<any> {
        return this.issuesService.publishIssue(id);
    }

    @Post(':id/unpublish')
    async unPublishSubmission(
        @Param('id', ParseIntPipe) id: number,
    ): Promise<any> {
        return this.issuesService.unPublishIssue(id);
    }
}
