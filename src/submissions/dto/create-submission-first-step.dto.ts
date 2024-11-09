import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class CreateSubmissionFirstStepDto {
    @IsNumber()
    userId: number;
    
    @IsString()
    editorsNote?: string;  
    
    @IsNumber()
    is_previously_published: number;

    @IsNumber()
    url_reference: number;  

    @IsNumber()
    formatted_correctly: number; 
    
    @IsNumber()
    author_guidelines: number;  

    @IsNumber()
    accept_data_collection: number;

    @IsNumber()
    journalId: number;
}
