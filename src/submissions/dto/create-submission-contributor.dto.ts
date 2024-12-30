import { IsEmail, isNotEmpty, IsNotEmpty, IsNumber, IsString } from "class-validator";

export class CreateSubmissionContributorDto {
    @IsString()
    firstname: string;

    @IsString()
    lastname: string;

    @IsEmail()
    email: string;

    @IsString()
    bio?: string;

    @IsString()
    orcid?: string;  

    @IsString()
    homepage?: string;  

    @IsString()
    public_name?: string;  

    @IsString()
    affiliation?: string; 

    country?: string; 
    
    @IsNumber()
    role: number;

    @IsNumber()
    is_principal_contact?: number;

}
