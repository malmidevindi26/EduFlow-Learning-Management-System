import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  Min,
  Matches
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
    @Matches(/^\/uploads\/[A-Za-z0-9._-]+$/, {
    message: 'fileUrl must be a file uploaded through /api/uploads',
    })
    fileUrl?: string

    @IsOptional()
    @IsInt()
    @Min(1)
    position?: number
}