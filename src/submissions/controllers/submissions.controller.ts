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

  @Post('/assign-issue')
  assignIssue(@Body() attachData: any) {
    return this.submissionsService.assignIssue(attachData);
  }

  @Post('admin/:id/update-issue')
  updateSubmissionSection(
    @Param('id') id: number,
    @Body() updateSubmissionDto: any) {
    return this.submissionsService.updateSubmissionSection(id, updateSubmissionDto);
  }

  @Post('admin/:id/update-title')
  updateSubmissionTitle(
    @Param('id') id: number,
    @Body() updateSubmissionDto: any) {
    return this.submissionsService.updateSubmissionTitle(id, updateSubmissionDto);
  }

  @Post('/assign-editor')
  attachEditor(@Body() attachData: any) {
    return this.submissionsService.attachEditor(attachData);
  }

  @Delete('remove-editor/:editorId/:submissionId')
  removeAttachment(
    @Param('editorId') editorId: number,
    @Param('submissionId') submissionId: number) {
    return this.submissionsService.removeEditor(editorId, submissionId);
  }

  @Get()
  findAll() { 
    return this.submissionsService.findAll();
  }

  @Get('admin/all')
  findAllAdmin() { 
    return this.submissionsService.findAllAdmin();
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.submissionsService.findOne(+id);
  }

  @Get(':id/files')
  findSubmissionFiles(@Param('id') id: number) {
    return this.submissionsService.findSubmissionFiles(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSubmissionDto: UpdateSubmissionDto) {
    return this.submissionsService.update(+id, updateSubmissionDto);
  }

  @Delete('delete/:id')
  remove(@Param('id') id: number) {
    return this.submissionsService.remove(+id);
  }

  @Delete(':id/delete/:fileId/file')
  removeSubmissionFile(
    @Param('id') id: number,
    @Param('fileId') fileId: number
  ) {
    return this.submissionsService.removeSubmissionFile(+id, fileId);
  }

  @Post(':id/save-upload')
  saveSubmissionUpload(
    @Param('id') id: number,
    @Body() createSubmissionFilesDto: any) {
    return this.submissionsService.saveSubmissionUpload(id, createSubmissionFilesDto);
  }

  @Post(':id/accept')
  acceptSubmission(
    @Param('id') id: number){
    return this.submissionsService.acceptSubmission(id);
  }

  @Post(':id/reject')
  rejectSubmission(
    @Param('id') id: number){
    return this.submissionsService.rejectSubmission(id);
  }

  @Post(':id/publish')
  publishSubmission(
    @Param('id') id: number){
    return this.submissionsService.publishSubmission(id);
  }
  @Post(':id/unpublish')
  unPublishSubmission(
    @Param('id') id: number){
    return this.submissionsService.unPublishSubmission(id);
  }

  @Post(':id/summarize')
  summarizeFile(
    @Param('id') id: number){
    return this.submissionsService.summarizeFile(id);
  }

  @Post(':id/submission-files/toggle-main/:fileId')
  toggleSubmissionFilesMain(
    @Param('id') id: number,
    @Param('fileId') fileId: number,
  ){
    return this.submissionsService.toggleSubmissionFilesMain(id, fileId);
  }
  
}
