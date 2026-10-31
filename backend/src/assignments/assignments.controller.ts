import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import type { JwtUser } from '../auth/types/jwt-user';
import { AssignmentsService } from './assignments.service';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { GradeSubmissionDto } from './dto/grade-submission.dto';
import { SubmitAssignmentDto } from './dto/submit-assignment.dto';
import { UpdateAssignmentDto } from './dto/update-assignment.dto';

@ApiTags('assignments')
@ApiBearerAuth()
@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
export class AssignmentsController {
    constructor(private readonly assignments: AssignmentsService){}

  @Roles(Role.INSTRUCTOR)
  @Post('courses/:courseId/assignments')
  create(
    @Param('courseId', ParseUUIDPipe) courseId: string,
    @Body() dto: CreateAssignmentDto,
    @CurrentUser() user: JwtUser,
  ) {
    return this.assignments.create(courseId, dto, user);
  }

  @Get('courses/:courseId/assignments')
  findByCourse(
    @Param('courseId', ParseUUIDPipe) courseId: string,
    @CurrentUser() user: JwtUser,
  ) {
    return this.assignments.findByCourse(courseId, user);
  }

  @Roles(Role.INSTRUCTOR)
  @Patch('assignments/:id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateAssignmentDto,
    @CurrentUser() user: JwtUser,
  ) {
    return this.assignments.update(id, dto, user);
  }

  @Roles(Role.INSTRUCTOR)
  @Delete('assignments/:id')
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtUser) {
    return this.assignments.remove(id, user);
  }

  @Roles(Role.STUDENT)
  @Post('assignments/:id/submit')
  submit(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: SubmitAssignmentDto,
    @CurrentUser() user: JwtUser,
  ) {
    return this.assignments.submit(id, dto, user);
  }

  @Roles(Role.STUDENT)
  @Get('submissions/my')
  findMySubmissions(
    @CurrentUser() user: JwtUser) {
    return this.assignments.findMySubmissions(user);
  }

  @Roles(Role.INSTRUCTOR, Role.ADMIN)
  @Get('assignments/:id/submissions')
  findSubmissions(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtUser,
  ) {
    return this.assignments.findSubmissions(id, user);
  }

  @Roles(Role.INSTRUCTOR)
  @Patch('submissions/:id/grade')
  grade(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: GradeSubmissionDto,
    @CurrentUser() user: JwtUser,
  ) {
    return this.assignments.grade(id, dto, user);
  }
}
