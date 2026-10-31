import { Controller, Delete, Get, HttpCode, Param, ParseUUIDPipe, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import type { JwtUser } from '../auth/types/jwt-user';
import { EnrollmentsService } from './enrollments.service';

@ApiTags('enrollments')
@ApiBearerAuth()
@Controller('enrollments')
@UseGuards(JwtAuthGuard, RolesGuard)

export class EnrollmentsController {
    constructor(private readonly enrollments: EnrollmentsService){}

    @Roles(Role.STUDENT)
    @Post('courses/:courseId/enroll')
    enroll(
        @Param('courseId', ParseUUIDPipe) courseId: string,
        @CurrentUser() user: JwtUser,
    ){
        return this.enrollments.enroll(courseId, user)
    }

    @Roles(Role.STUDENT)
    @Delete('courses/:courseId/enroll')
    unenroll(
        @Param('courseId', ParseUUIDPipe) courseId: string,
        @CurrentUser() user: JwtUser,
    ){
        return this.enrollments.unenroll(courseId, user)
    }

    @Roles(Role.STUDENT)
    @Get('enrollments/my')
    findMine(@CurrentUser() user: JwtUser){
        return this.enrollments.findMine(user)
    }

    @Get('lessons/:lessonId/content')
    getLessonContent(
        @Param('lessonId', ParseUUIDPipe) lessonId: string,
        @CurrentUser() user: JwtUser,
    ){
        return this.enrollments.getLessonContent(lessonId, user)
    }

    @Roles(Role.STUDENT)
    @HttpCode(200)
    @Post('lessons/:lessonId/complete')
    completeLesson(
        @Param('lessonId', ParseUUIDPipe) lessonId: string,
        @CurrentUser() user: JwtUser
    ){
        return this.enrollments.completeLesson(lessonId, user)
    }

    @Roles(Role.INSTRUCTOR, Role.ADMIN)
    @Get('courses/:courseId/students')
    getCourseStudents(
        @Param('courseId', ParseUUIDPipe) courseId: string,
        @CurrentUser() user: JwtUser,
    ){
        return this.enrollments.getCourseStudents(courseId, user)
    }
    
}
