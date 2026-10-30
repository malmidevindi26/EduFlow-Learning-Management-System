import { CourseStatus } from '@prisma/client';
import { IsEnum } from 'class-validator';

export class ChangeStatusDto{
    @IsEnum(CourseStatus)
    status: CourseStatus
}