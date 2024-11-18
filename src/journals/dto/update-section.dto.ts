import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class UpdateSectionDto {
    @IsNotEmpty()
    title: string;

    abbreviation?: string; 
    policy?: string; 
    word_count?: number; 
    identification_text?: string;
}
