import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class CreateSubmissionDto {
    @IsNumber()
    id: number;

    @IsNumber()
    userId: number;

    @IsString()
    @IsNotEmpty()
    prefix: string;

    @IsNotEmpty()
    title: string;  

    // @IsNotEmpty()
    subTitle?: string;  

    @IsNotEmpty()
    abstract: string; 
    
    @IsString()
    keywords?: string;  
}
