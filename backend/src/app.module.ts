import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule} from '@nestjs/config'
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { CategoriesModule } from './categories/categories.module';
import { CoursesModule } from './courses/courses.module';
import { LessonsModule } from './lessons/lessons.module';
import { EnrollmentsModule } from './enrollments/enrollments.module';
import { AssignmentsModule } from './assignments/assignments.module';
import { ReviewsModule } from './reviews/reviews.module';
import { StatsModule } from './stats/stats.module';

@Module({
  imports: [ ConfigModule.forRoot({ isGlobal: true}) ,PrismaModule, UsersModule, AuthModule, CategoriesModule, CoursesModule, LessonsModule, EnrollmentsModule, AssignmentsModule, ReviewsModule, StatsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
