import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { SubmissionsService } from '../services/submissions.service';
import { CreateSubmissionDto } from '../dto/create-submission.dto';
import { UpdateSubmissionDto } from '../dto/update-submission.dto';
import { CreateSubmissionFirstStepDto } from '../dto/create-submission-first-step.dto';
import { CreateSubmissionFinalSaveDto } from '../dto/create-submission-final-save.dto';

@Controller('submissions')
export class SubmissionsController {
  constructor(private readonly submissionsService: SubmissionsService) {}

  @Post('/create-submission')
  createFirstStep(@Body() createSubmissionDto: CreateSubmissionFirstStepDto) {
    return this.submissionsService.createFirstStep(createSubmissionDto);
  }

  @Post('/final-save')
  createFinalStep(@Body() createSubmissionDto: CreateSubmissionFinalSaveDto) {
    return this.submissionsService.finalSave(createSubmissionDto);
  }

  @Post()
  create(@Body() createSubmissionDto: CreateSubmissionDto) {
    return this.submissionsService.create(createSubmissionDto);
  }

  @Get()
  findAll() { 
    return this.submissionsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.submissionsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSubmissionDto: UpdateSubmissionDto) {
    return this.submissionsService.update(+id, updateSubmissionDto);
  }

  @Delete('delete/:id')
  remove(@Param('id') id: number) {
    return this.submissionsService.remove(+id);
  }

  @Delete(':id/delete/:fileId')
  removeSubmissionFile(
    @Param('id') id: number,
    @Param('fileId') fileId: number
  ) {
    return this.submissionsService.removeSubmissionFile(+id, fileId);
  }
}
