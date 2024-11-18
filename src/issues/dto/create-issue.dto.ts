import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class CreateIssueDto {
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
