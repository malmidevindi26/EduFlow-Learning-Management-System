import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { JwtUser } from '../auth/types/jwt-user';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';

@Injectable()
export class LessonsService {
    constructor(private readonly prisma: PrismaService){}

    async create(courseId: string, dto: CreateLessonDto, user: JwtUser){
        const course = await this.prisma.course.findUnique({
            where: { id: courseId },
        })
        if(!course) throw new NotFoundException('Course not found')
        if(course.instructorId !== user.id){
            throw new ForbiddenException('You can only add lessons to your own course')
        }

        let position = dto.position
        if(position === undefined){
            const last = await this.prisma.lesson.findFirst({
                where: {courseId},
                orderBy: {position:'desc'},
                select: {position: true}
            })
            position = (last?.position ?? 0) + 1
        }

        return this.prisma.lesson.create({
            data: { ...dto, position, courseId},
        })
    }

    async update(id: string, dto: UpdateLessonDto, user:JwtUser){
        await this.getOwnedLesson(id, user)
        return this.prisma.lesson.update({ where: { id }, data: dto })
    }

    async remove(id: string, user: JwtUser){
        await this.getOwnedLesson(id, user)
        await this.prisma.lesson.delete({ where: { id } })
        return { message: 'Lesson deleted' }
    }

    private async getOwnedLesson(id: string, user: JwtUser){
        const lesson = await this.prisma.lesson.findUnique({
            where: { id },
            include: { course: {select: { instructorId: true }} },
        })
        if(!lesson) throw new NotFoundException('Lesson not found')
        if(lesson.course.instructorId !== user.id){
            throw new ForbiddenException('You can only edit lessons of your own course')
        }
    }
}
