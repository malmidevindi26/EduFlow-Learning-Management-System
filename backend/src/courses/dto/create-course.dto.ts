import { CourseLevel } from '@prisma/client';
import { IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  IsUUID,
  MaxLength,}from 'class-validator';


export class CreateCourseDto{
    @IsString()
    @IsNotEmpty()
    @MaxLength(120)
    title: string

    @IsString()
    @IsNotEmpty()
    description: string

    @IsOptional()
    @IsEnum(CourseLevel)
    level?: CourseLevel

    @IsOptional()
    @IsUrl()
    thumbnailUrl?: string;

    @IsUUID()
    categoryId: string
    
}
