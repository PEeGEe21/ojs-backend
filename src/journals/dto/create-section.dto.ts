import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class CreateSectionDto {
    @IsNumber()
    journalId: number;

    @IsNotEmpty()
    title: string;

    abbreviation?: string; 
    policy?: string; 
    word_count?: number; 
    identification_text?: string;
}
