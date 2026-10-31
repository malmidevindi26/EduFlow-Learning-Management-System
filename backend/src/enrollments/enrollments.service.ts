import { ConflictException, ForbiddenException, Injectable, NotFoundException,} from '@nestjs/common';
import { CourseStatus, EnrollmentStatus, Role } from '@prisma/client';
import type { JwtUser } from '../auth/types/jwt-user';
import { PrismaService } from '../prisma/prisma.service';

const percent = (done: number, total: number) =>
  total > 0 ? Math.round((done / total) * 100) : 0;

@Injectable()
export class EnrollmentsService {
  constructor(private readonly prisma: PrismaService) {}

  private findEnrollment(userId: string, courseId: string) {
    return this.prisma.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId } },
    });
  }

  async enroll(courseId: string, user: JwtUser) {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
    });
    if (!course || course.status !== CourseStatus.PUBLISHED) {
      throw new NotFoundException('Course not found');
    }

    const existing = await this.findEnrollment(user.id, courseId);
    if (existing) {
      if (existing.status === EnrollmentStatus.DROPPED) {
        return this.prisma.enrollment.update({
          where: { id: existing.id },
          data: { status: EnrollmentStatus.ACTIVE },
        });
      }
      throw new ConflictException('You are already enrolled in this course');
    }

    return this.prisma.enrollment.create({
      data: { userId: user.id, courseId },
    });
  }

  async unenroll(courseId: string, user: JwtUser) {
    const enrollment = await this.findEnrollment(user.id, courseId);
    if (!enrollment || enrollment.status === EnrollmentStatus.DROPPED) {
      throw new NotFoundException('Enrollment not found');
    }
    await this.prisma.enrollment.update({
      where: { id: enrollment.id },
      data: { status: EnrollmentStatus.DROPPED },
    });
    return { message: 'Unenrolled from course' };
  }

  async findMine(user: JwtUser) {
    const enrollments = await this.prisma.enrollment.findMany({
      where: {
        userId: user.id,
        status: { not: EnrollmentStatus.DROPPED },
      },
      orderBy: { enrolledAt: 'desc' },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            thumbnailUrl: true,
            level: true,
            category: { select: { id: true, name: true } },
            instructor: { select: { id: true, name: true } },
            _count: { select: { lessons: true } },
          },
        },
        _count: { select: { progress: true } },
      },
    });

    return enrollments.map((e) => {
      const { _count, ...course } = e.course;
      return {
        id: e.id,
        status: e.status,
        enrolledAt: e.enrolledAt,
        course,
        completedLessons: e._count.progress,
        totalLessons: _count.lessons,
        progress: percent(e._count.progress, _count.lessons),
      };
    });
  }

  async getLessonContent(lessonId: string, user: JwtUser) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
      include: { course: { select: { instructorId: true } } },
    });
    if (!lesson) throw new NotFoundException('Lesson not found');

    const canManage =
      user.role === Role.ADMIN || lesson.course.instructorId === user.id;

    let completed = false;
    if (!canManage) {
      const enrollment = await this.findEnrollment(user.id, lesson.courseId);
      if (!enrollment || enrollment.status === EnrollmentStatus.DROPPED) {
        throw new ForbiddenException('Enroll in this course to view lessons');
      }
      const done = await this.prisma.lessonProgress.findUnique({
        where: {
          enrollmentId_lessonId: { enrollmentId: enrollment.id, lessonId },
        },
      });
      completed = !!done;
    }

    const { course, ...data } = lesson;
    return { ...data, completed };
  }

  async completeLesson(lessonId: string, user: JwtUser) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
    });
    if (!lesson) throw new NotFoundException('Lesson not found');

    const enrollment = await this.findEnrollment(user.id, lesson.courseId);
    if (!enrollment || enrollment.status === EnrollmentStatus.DROPPED) {
      throw new ForbiddenException('You are not enrolled in this course');
    }

    await this.prisma.lessonProgress.upsert({
      where: {
        enrollmentId_lessonId: { enrollmentId: enrollment.id, lessonId },
      },
      update: {},
      create: { enrollmentId: enrollment.id, lessonId },
    });

    const [total, done] = await Promise.all([
      this.prisma.lesson.count({ where: { courseId: lesson.courseId } }),
      this.prisma.lessonProgress.count({
        where: { enrollmentId: enrollment.id },
      }),
    ]);
    const progress = percent(done, total);

    let status = enrollment.status;
    if (progress === 100 && status !== EnrollmentStatus.COMPLETED) {
      status = EnrollmentStatus.COMPLETED;
      await this.prisma.enrollment.update({
        where: { id: enrollment.id },
        data: { status },
      });
    }

    return { lessonId, completedLessons: done, totalLessons: total, progress, status };
  }

  async getCourseStudents(courseId: string, user: JwtUser) {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
    });
    if (!course) throw new NotFoundException('Course not found');
    if (user.role !== Role.ADMIN && course.instructorId !== user.id) {
      throw new ForbiddenException('You can only view students of your own course');
    }

    const total = await this.prisma.lesson.count({ where: { courseId } });
    const enrollments = await this.prisma.enrollment.findMany({
      where: { courseId, status: { not: EnrollmentStatus.DROPPED } },
      orderBy: { enrolledAt: 'desc' },
      include: {
        user: { select: { id: true, name: true, email: true } },
        _count: { select: { progress: true } },
      },
    });

    return enrollments.map((e) => ({
      enrollmentId: e.id,
      student: e.user,
      status: e.status,
      enrolledAt: e.enrolledAt,
      completedLessons: e._count.progress,
      totalLessons: total,
      progress: percent(e._count.progress, total),
    }));
  }
}