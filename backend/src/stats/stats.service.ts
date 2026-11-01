import { Injectable } from '@nestjs/common';
import { CourseStatus, EnrollmentStatus, Role, SubmissionStatus,} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class StatsService {
    constructor(private readonly prisma: PrismaService){}

    async adminStats(){
        const [
            totalUsers,
            totalCourses,
            totalEnrollments,
            totalSubmissions,
            totalReviews,
            roleCounts,
            statusCounts,
        ] = await Promise.all([
            this.prisma.user.count(),
            this.prisma.course.count(),
            this.prisma.enrollment.count(),
            this.prisma.submission.count(),
            this.prisma.review.count(),
            Promise.all(
                Object.values(Role).map(
                    async (role) => 
                    [role, await this.prisma.user.count({ where: { role } })] as const,
                ),
            ),
            Promise.all(
                Object.values(CourseStatus).map(
                    async (status) => 
                    [
                        status,
                        await this.prisma.course.count({ where: { status } }),
                    ] as const,
                ),
            ),
        ])

        return{
            totalUsers,
            totalCourses,
            totalEnrollments,
            totalSubmissions,
            totalReviews,
            userByRole: Object.fromEntries(roleCounts),
            coursesByStatus: Object.fromEntries(statusCounts)
        }
    }

    async instructorStats(instructorId: string){
        const [totalCourses, totalStudents, pendingGrading, rating] = 
         await Promise.all([
            this.prisma.course.count({ where: { instructorId } }),
            this.prisma.enrollment.count({
                where: {
                    course: { instructorId },
                    status: { not: EnrollmentStatus.DROPPED }
                },
            }),
            this.prisma.submission.count({
                where: {
                    status: SubmissionStatus.SUBMITTED,
                    assignment: { course: { instructorId } },
                }
            }),
            this.prisma.review.aggregate({
                where: { course: { instructorId } },
                _avg: { rating: true },
                _count: { _all: true },
            })
         ])

         return{
            totalCourses,
            totalStudents,
            pendingGrading,
            averageRating: rating._avg.rating ? Math.round(rating._avg.rating * 10) / 10 : null,
            totalReviews: rating._count._all, 
         }
    }
}
