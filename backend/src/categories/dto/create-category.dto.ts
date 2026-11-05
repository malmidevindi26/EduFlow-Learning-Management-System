import { IsNotEmpty, IsOptional, IsString, MaxLength } from "class-validator";

export class CreateCategoryDto{
    @IsString()
    @IsNotEmpty()
    @MaxLength(60)
    name: string

    @IsOptional()
    @IsString()
    @MaxLength(300)
    description?: string
}