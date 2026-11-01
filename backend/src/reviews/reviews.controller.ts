import { Controller, Body, Delete, Get, Param, ParseUUIDPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import type { JwtUser } from '../auth/types/jwt-user';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { ReviewsService } from './reviews.service';


@ApiTags('reviews')
@Controller('reviews')
export class ReviewsController {
    constructor (private readonly reviews: ReviewsService){}

    @Get('courses/:courseId/reviews')
    findByCourse(@Param('courseId', ParseUUIDPipe) courseId: string){
        return this.reviews.findByCourse(courseId)
    }

    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.STUDENT)
    @Post('courses/:courseId/reviews')
    create(
        @Param('courseId', ParseUUIDPipe) courseId: string,
        @Body() dto: CreateReviewDto,
        @CurrentUser() user: JwtUser,
    ){
        return this.reviews.create(courseId, dto, user)
    }

    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.STUDENT)
    @Patch('reviews/:id')
    update(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() dto: UpdateReviewDto,
        @CurrentUser() user: JwtUser,
    ){
        return this.reviews.update(id, dto, user)
    }

    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.STUDENT, Role.ADMIN)
    @Delete('reviews/:id')
    remove(
        @Param('id', ParseUUIDPipe) id: string,
        @CurrentUser() user: JwtUser
    ){
        return this.reviews.remove(id, user)
    }

}
