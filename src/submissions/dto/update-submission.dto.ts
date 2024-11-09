import { PartialType } from '@nestjs/swagger';
import { CreateSubmissionDto } from './create-submission.dto';
import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class UpdateSubmissionDto extends PartialType(CreateSubmissionDto) {
    @IsNumber()
    id: number;

    @IsNumber()
    userId: number;

    @IsString()
    @IsNotEmpty()
    prefix: string;

    @IsNotEmpty()
    title: string;  

    @IsNotEmpty()
    subTitle: string;  

    @IsNotEmpty()
    abstract: string; 
    
    @IsNotEmpty()
    abstractPlain: string;
    
    @IsString()
    keywords?: string; 
}
