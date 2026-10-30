import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateLessonDto{
    @IsString()
    @IsNotEmpty()
    @MaxLength(120)
    title: string

    @IsString()
    @IsNotEmpty()
    content: string

    @IsOptional()
    @IsUrl()
    videoUrl?: string

    @IsOptional()
    @IsString()
    fileUrl?: string

    @IsOptional()
    @IsInt()
    @Min(1)
    position?: number
}