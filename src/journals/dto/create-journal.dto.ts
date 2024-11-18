import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class CreateJournalDto {
    @IsNumber()
    userId: number;

    @IsNotEmpty()
    name: string;

    @IsNumber()
    editorId: number;

    note?: string; 
    
    // notePlain?: string;

    slug?: string;

    accronym?: string;

    file_url?: string;
    file_name?: string;
}
