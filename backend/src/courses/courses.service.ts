import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CourseStatus, Prisma, Role } from '@prisma/client';
import type { JwtUser } from '../auth/types/jwt-user';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { QueryCoursesDto } from './dto/query-courses.dto';
import { UpdateCourseDto } from './dto/update-course.dto';

type Transitions = Record<CourseStatus, CourseStatus[]>;

const INSTRUCTOR_TRANSITIONS: Transitions = {
  DRAFT: ['PENDING', 'ARCHIVED'],
  PENDING: ['DRAFT', 'ARCHIVED'],
  PUBLISHED: ['ARCHIVED'],
  ARCHIVED: ['DRAFT'],
};

const ADMIN_TRANSITIONS: Transitions = {
  DRAFT: ['ARCHIVED'],
  PENDING: ['PUBLISHED', 'DRAFT', 'ARCHIVED'],
  PUBLISHED: ['DRAFT', 'ARCHIVED'],
  ARCHIVED: ['DRAFT'],
};

@Injectable()
export class CoursesService {
  constructor(private readonly prisma: PrismaService) {}

  private readonly include = {
    category: { select: { id: true, name: true } },
    instructor: { select: { id: true, name: true } },
  };

  async create(dto: CreateCourseDto, user: JwtUser) {
    await this.assertCategoryExists(dto.categoryId);
    return this.prisma.course.create({
      data: { ...dto, instructorId: user.id },
      include: this.include,
    });
  }

  async findAll(query: QueryCoursesDto) {
    const {
      search,
      categoryId,
      level,
      sort = 'newest',
      page = 1,
      limit = 10,
    } = query;

    const where: Prisma.CourseWhereInput = {
      status: CourseStatus.PUBLISHED,
    };
    if (categoryId) where.categoryId = categoryId;
    if (level) where.level = level;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const orderBy: Prisma.CourseOrderByWithRelationInput =
      sort === 'title'
        ? { title: 'asc' }
        : sort === 'oldest'
          ? { createdAt: 'asc' }
          : { createdAt: 'desc' };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.course.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
        include: this.include,
      }),
      this.prisma.course.count({ where }),
    ]);

    return {
      items,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  findMine(user: JwtUser) {
    return this.prisma.course.findMany({
      where: { instructorId: user.id },
      orderBy: { createdAt: 'desc' },
      include: { ...this.include, _count: { select: { lessons: true } } },
    });
  }

  findPending() {
    return this.prisma.course.findMany({
      where: { status: CourseStatus.PENDING },
      orderBy: { createdAt: 'asc' },
      include: { ...this.include, _count: { select: { lessons: true } } },
    });
  }

  async findOne(id: string, user: JwtUser | null) {
    const course = await this.prisma.course.findUnique({
      where: { id },
      include: {
        ...this.include,
        lessons: {
          select: { id: true, title: true, position: true },
          orderBy: { position: 'asc' },
        },
      },
    });
    if (!course) throw new NotFoundException('Course not found');

    if (course.status !== CourseStatus.PUBLISHED) {
      const canSee =
        !!user && (user.role === Role.ADMIN || course.instructorId === user.id);
      if (!canSee) throw new NotFoundException('Course not found');
    }
    return course;
  }

  async update(id: string, dto: UpdateCourseDto, user: JwtUser) {
    await this.getManageableCourse(id, user);
    if (dto.categoryId) await this.assertCategoryExists(dto.categoryId);
    return this.prisma.course.update({
      where: { id },
      data: dto,
      include: this.include,
    });
  }

  async changeStatus(id: string, status: CourseStatus, user: JwtUser) {
    const course = await this.getManageableCourse(id, user);
    const transitions =
      user.role === Role.ADMIN ? ADMIN_TRANSITIONS : INSTRUCTOR_TRANSITIONS;

    if (!transitions[course.status].includes(status)) {
      throw new BadRequestException(
        `Cannot change status from ${course.status} to ${status}`,
      );
    }

    if (status === CourseStatus.PENDING) {
      const lessonCount = await this.prisma.lesson.count({
        where: { courseId: id },
      });
      if (lessonCount === 0) {
        throw new BadRequestException(
          'Add at least one lesson before submitting for approval',
        );
      }
    }

    return this.prisma.course.update({
      where: { id },
      data: { status },
      include: this.include,
    });
  }

  remove(id: string, user: JwtUser) {
    return this.changeStatus(id, CourseStatus.ARCHIVED, user);
  }

  private async getManageableCourse(id: string, user: JwtUser) {
    const course = await this.prisma.course.findUnique({ where: { id } });
    if (!course) throw new NotFoundException('Course not found');
    if (user.role !== Role.ADMIN && course.instructorId !== user.id) {
      throw new ForbiddenException('You can only manage your own courses');
    }
    return course;
  }

  private async assertCategoryExists(categoryId: string) {
    const category = await this.prisma.category.findUnique({
      where: { id: categoryId },
    });
    if (!category) throw new NotFoundException('Category not found');
  }
}