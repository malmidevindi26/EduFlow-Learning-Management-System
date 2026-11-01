import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import type { JwtUser } from '../auth/types/jwt-user';
import { StatsService } from './stats.service';


@ApiTags('stats')
@ApiBearerAuth()
@Controller('stats')
export class StatsController {
    constructor(private readonly stats: StatsService){}

    @Roles(Role.ADMIN)
    @Get('admin/stats')
    adminStats(){
        return this.stats.adminStats()
    }

    @Roles(Role.INSTRUCTOR)
    @Get('instructor/stats')
    instructorStats(@CurrentUser() user: JwtUser){
        return this.stats.instructorStats(user.id)
    }
}
