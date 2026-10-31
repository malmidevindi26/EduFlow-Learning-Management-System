import {
  Body,
  Controller,
  Delete,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import type { JwtUser } from '../auth/types/jwt-user';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import { LessonsService } from './lessons.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('lessons')
@ApiBearerAuth()
@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.INSTRUCTOR)
export class LessonsController {
    constructor(private readonly lessons: LessonsService){}

    @Post('courses/:courseId/lessons')
    create(
        @Param('courseId', ParseUUIDPipe) courseId: string,
        @Body() dto: CreateLessonDto,
        @CurrentUser() user:JwtUser,
    ){
        return this.lessons.create(courseId, dto, user)
    }

    @Patch('lessons/:id')
    update(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() dto: UpdateLessonDto,
        @CurrentUser() user: JwtUser,
    ){
        return this.lessons.update(id, dto, user)
    }

    @Delete('lessons/:id')
    remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: JwtUser){
        return this.lessons.remove(id, user)
    }
}
