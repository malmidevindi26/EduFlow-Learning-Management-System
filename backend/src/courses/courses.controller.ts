import {
  Body,Controller,Delete,Get,Param,ParseUUIDPipe,Patch,Post,Query,UseGuards,
} from '@nestjs/common';
import { Role, User } from '@prisma/client';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import type { JwtUser } from '../auth/types/jwt-user';
import { CoursesService } from './courses.service';
import { ChangeStatusDto } from './dto/change-status.dto';
import { CreateCourseDto } from './dto/create-course.dto';
import { QueryCoursesDto } from './dto/query-courses.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';


@ApiTags('courses')
@Controller('courses')
export class CoursesController {
    constructor(private readonly courses: CoursesService){}

    @Get()
    findAll(@Query() query: QueryCoursesDto){
        return this.courses.findAll(query)
    }

    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.INSTRUCTOR)
    @Get('mine')
    findMine(@CurrentUser() user: JwtUser){
        return this.courses.findMine(user)
    }

    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    @Get('pending')
    findPending(){
        return this.courses.findPending()
    }

    @UseGuards(OptionalJwtAuthGuard)
    @Get(':id')
    findOne(
        @Param('id', ParseUUIDPipe) id: string,
        @CurrentUser() user: JwtUser | null,
    ){
        return this.courses.findOne(id, user)
    }

    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.INSTRUCTOR)
    @Post()
    create(@Body() dto: CreateCourseDto, @CurrentUser() user: JwtUser){
        return this.courses.create(dto, user)
    }

    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.INSTRUCTOR, Role.ADMIN)
    @Patch(':id')
    update(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() dto: UpdateCourseDto,
        @CurrentUser() user: JwtUser,
    ){
        return this.courses.update(id, dto, user)
    }


    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.INSTRUCTOR, Role.ADMIN)
    @Patch(':id/status')
    changeStatus(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() dto: ChangeStatusDto,
        @CurrentUser() user: JwtUser,
    ){
        return this.courses.changeStatus(id, dto.status, user)
    }


    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.INSTRUCTOR, Role.ADMIN)
    @Delete(':id')
    remove(
        @Param('id', ParseUUIDPipe) id: string,
        @CurrentUser() user:JwtUser,
    ){
        return this.courses.remove(id, user)
    }
}
