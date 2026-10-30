import { CourseLevel } from '@prisma/client'
import { Type } from 'class-transformer'
import { IsEnum, IsIn, IsInt, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator'

export class QueryCoursesDto{
    @IsOptional()
    @IsString()
    search?:string

    @IsOptional()
    @IsUUID()
    categoryId?: string

    @IsOptional()
    @IsEnum(CourseLevel)
    level?: CourseLevel

    @IsOptional()
    @IsIn(['newest', 'oldest', 'title'])
    sort?: 'newest' | 'oldest' | 'title'

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page?: number = 10

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(50)
    limit?: number = 10;
}