import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException,} from '@nestjs/common';
import { EnrollmentStatus, Role, SubmissionStatus } from '@prisma/client';
import type { JwtUser } from '../auth/types/jwt-user';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { GradeSubmissionDto } from './dto/grade-submission.dto';
import { SubmitAssignmentDto } from './dto/submit-assignment.dto';
import { UpdateAssignmentDto } from './dto/update-assignment.dto';

@Injectable()
export class AssignmentsService {
  constructor(private readonly prisma: PrismaService) {}

  private async getAssignment(id: string) {
    const assignment = await this.prisma.assignment.findUnique({
      where: { id },
      include: { course: { select: { id: true, instructorId: true } } },
    });
    if (!assignment) throw new NotFoundException('Assignment not found');
    return assignment;
  }

  private assertOwner(instructorId: string, user: JwtUser) {
    if (instructorId !== user.id) {
      throw new ForbiddenException(
        'You can only manage assignments of your own course',
      );
    }
  }

  private async assertEnrolled(userId: string, courseId: string) {
    const enrollment = await this.prisma.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId } },
    });
    if (!enrollment || enrollment.status === EnrollmentStatus.DROPPED) {
      throw new ForbiddenException('You are not enrolled in this course');
    }
  }



  async create(courseId: string, dto: CreateAssignmentDto, user: JwtUser) {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
    });
    if (!course) throw new NotFoundException('Course not found');
    this.assertOwner(course.instructorId, user);

    return this.prisma.assignment.create({
      data: { ...dto, dueDate: new Date(dto.dueDate), courseId },
    });
  }

  async findByCourse(courseId: string, user: JwtUser) {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
    });
    if (!course) throw new NotFoundException('Course not found');

    const canManage =
      user.role === Role.ADMIN || course.instructorId === user.id;
    if (!canManage) await this.assertEnrolled(user.id, courseId);

    return this.prisma.assignment.findMany({
      where: { courseId },
      orderBy: { dueDate: 'asc' },
    });
  }

  async update(id: string, dto: UpdateAssignmentDto, user: JwtUser) {
    const assignment = await this.getAssignment(id);
    this.assertOwner(assignment.course.instructorId, user);

    return this.prisma.assignment.update({
      where: { id },
      data: {
        ...dto,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
      },
    });
  }

  async remove(id: string, user: JwtUser) {
    const assignment = await this.getAssignment(id);
    this.assertOwner(assignment.course.instructorId, user);
    await this.prisma.assignment.delete({ where: { id } });
    return { message: 'Assignment deleted' };
  }


  async submit(assignmentId: string, dto: SubmitAssignmentDto, user: JwtUser) {
    const assignment = await this.getAssignment(assignmentId);
    await this.assertEnrolled(user.id, assignment.courseId);

    if (!dto.answerText && !dto.fileUrl) {
      throw new BadRequestException('Provide an answer text or a file');
    }

    const existing = await this.prisma.submission.findUnique({
      where: {
        assignmentId_studentId: { assignmentId, studentId: user.id },
      },
    });
    if (existing?.status === SubmissionStatus.GRADED) {
      throw new ConflictException(
        'This submission is already graded and cannot be changed',
      );
    }

    const now = new Date();
    const isLate = now > assignment.dueDate;

    return this.prisma.submission.upsert({
      where: { assignmentId_studentId: { assignmentId, studentId: user.id } },
      update: {
        answerText: dto.answerText ?? null,
        fileUrl: dto.fileUrl ?? null,
        submittedAt: now,
        isLate,
      },
      create: {
        assignmentId,
        studentId: user.id,
        answerText: dto.answerText ?? null,
        fileUrl: dto.fileUrl ?? null,
        isLate,
      },
    });
  }

  findMySubmissions(user: JwtUser) {
    return this.prisma.submission.findMany({
      where: { studentId: user.id },
      orderBy: { submittedAt: 'desc' },
      include: {
        assignment: {
          select: {
            id: true,
            title: true,
            dueDate: true,
            maxMarks: true,
            course: { select: { id: true, title: true } },
          },
        },
      },
    });
  }

  async findSubmissions(assignmentId: string, user: JwtUser) {
    const assignment = await this.getAssignment(assignmentId);
    if (user.role !== Role.ADMIN) {
      this.assertOwner(assignment.course.instructorId, user);
    }

    return this.prisma.submission.findMany({
      where: { assignmentId },
      orderBy: { submittedAt: 'asc' },
      include: { student: { select: { id: true, name: true, email: true } } },
    });
  }

  async grade(submissionId: string, dto: GradeSubmissionDto, user: JwtUser) {
    const submission = await this.prisma.submission.findUnique({
      where: { id: submissionId },
      include: {
        assignment: {
          select: {
            maxMarks: true,
            course: { select: { instructorId: true } },
          },
        },
      },
    });
    if (!submission) throw new NotFoundException('Submission not found');
    this.assertOwner(submission.assignment.course.instructorId, user);

    if (dto.marks > submission.assignment.maxMarks) {
      throw new BadRequestException(
        `Marks cannot be more than ${submission.assignment.maxMarks}`,
      );
    }

    return this.prisma.submission.update({
      where: { id: submissionId },
      data: {
        marks: dto.marks,
        feedback: dto.feedback ?? null,
        status: SubmissionStatus.GRADED,
        gradedAt: new Date(),
      },
    });
  }
}