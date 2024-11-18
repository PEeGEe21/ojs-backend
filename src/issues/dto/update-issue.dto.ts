import { PartialType } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from "class-validator";
import { CreateIssueDto } from './create-issue.dto';

export class UpdateIssueDto extends PartialType(CreateIssueDto) {
    @IsNumber()
    userId: number;

    @IsNumber()
    journalId: number;

    @IsNotEmpty()
    @IsString()
    title: string;

    @IsString()
    volume?: string; 

    @IsNumber()
    number?: number; 

    @IsNumber()
    year?: number;

    @IsString()
    description?: string; 
    
    @IsString()
    cover_image_url?: string;

    @IsString()
    cover_image_name?: string;

    @IsString()
    url_path?: string;
}
