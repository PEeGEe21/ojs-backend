import { PartialType } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from "class-validator";
import { CreateJournalDto } from './create-journal.dto';

export class UpdateJournalDto extends PartialType(CreateJournalDto) {
    // @IsNumber()
    // id: number;

    @IsNumber()
    userId: number;

    @IsNumber()
    editorId: number;

    @IsNotEmpty()
    name: string;  

    note?: string; 
    
    notePlain?: string;
    
    slug?: string;
    
    accronym?: string;
    file_name?: string;
}
