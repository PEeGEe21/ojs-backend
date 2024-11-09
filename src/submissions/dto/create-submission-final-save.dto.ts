import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class CreateSubmissionFinalSaveDto {
    @IsNumber()
    id: number;

    @IsNumber()
    userId: number;
}
