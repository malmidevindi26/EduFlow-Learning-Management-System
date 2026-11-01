import { Injectable, ForbiddenException, ConflictException, NotFoundException } from '@nestjs/common';
import { CourseStatus, EnrollmentStatus, Role } from '@prisma/client';
import type { JwtUser } from '../auth/types/jwt-user';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';

@Injectable()
export class ReviewsService {
    constructor(private readonly prisma: PrismaService){}

    private async getPublishedCourse(courseId: string){
        const course = await this.prisma.course.findUnique({
            where: { id: courseId },
        })
        if(!course || course.status !== CourseStatus.PUBLISHED){
            throw new NotFoundException('Course not found')
        }
        return course
    }

    async create(courseId: string, dto: CreateReviewDto, user:JwtUser){
        await this.getPublishedCourse(courseId)

        const enrollment = await this.prisma.enrollment.findUnique({
            where: { userId_courseId: { userId: user.id, courseId } },
        })
        if(!enrollment || enrollment.status === EnrollmentStatus.DROPPED){
            throw new ForbiddenException('Only enrolled students can review a course')
        }

        const existing = await this.prisma.review.findUnique({
            where: { courseId_userId: { courseId, userId: user.id } },
        });
        if (existing) {
           throw new ConflictException('You have already reviewed this course');
        } 

        return this.prisma.review.create({
           data: {
             courseId,
             userId: user.id,
             rating: dto.rating,
             comment: dto.comment,
            },
        });  
    }

    async findByCourse(courseId: string){
        await this.getPublishedCourse(courseId)

        const [items, stats] = await Promise.all([
            this.prisma.review.findMany({
                where: { courseId },
                orderBy: { createdAt: 'desc' },
                take: 50,
                include: { user: { select: { id: true, name: true } } },
            }),
            this.prisma.review.aggregate({
                where: { courseId },
                _avg: {rating: true},
                _count: { _all: true }
            })
        ])

        return {
          average: stats._avg.rating
            ? Math.round(stats._avg.rating * 10) / 10
            : null,
          count: stats._count._all,
          items,
        }
    }

    async update(id: string, dto: UpdateReviewDto, user: JwtUser){
        const review = await this.prisma.review.findUnique({ where: { id } })
        if(!review) throw new NotFoundException('Review not found')
        if(review.userId !== user.id){
            throw new ForbiddenException('You can only edit your own review')
        }
        return this.prisma.review.update({ where: { id }, data: dto })
    }

    async remove(id: string, user: JwtUser){
        const review = await this.prisma.review.findUnique({ where: { id } })
        if(!review) throw new NotFoundException('Review not found')
        if(user.role !== Role.ADMIN && review.userId !== user.id){
            throw new ForbiddenException('You can only delete your own review')
        }

        await this.prisma.review.delete({ where: { id } })
        return { message: 'Review deleted' }
    }
}
