import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { Role, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import type { JwtUser } from '../auth/types/jwt-user';
import { QueryUsersDto } from './dto/query-users.dto';
import { UpdateUserDto } from './dto/update-user.dto';

const userSelect = {
    id: true,
    email: true,
    name: true,
    role: true,
    isActive: true,
    createdAt: true
} satisfies Prisma.UserSelect

@Injectable()
export class UsersService {
    constructor(private readonly prisma: PrismaService){}

    findByEmail(email: string){
        return this.prisma.user.findUnique({ where: {email}});
    }

    findById(id: string){
        return this.prisma.user.findUnique({ where: { id }})
    }

    create(data: {
        email: string
        passwordHash: string
        name: string
        role: Role
    }){
        return this.prisma.user.create({ data })
    }

    async findAll(query: QueryUsersDto){
        const { search, role, page = 1, limit = 10 } = query

        const where: Prisma.UserWhereInput = {}
        if(role) where.role = role
        if(search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } }
            ]
        }

        const [ items, total ] = await this.prisma.$transaction([
            this.prisma.user.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
                select: userSelect,
            }),
            this.prisma.user.count({where}),
        ])

        return {
            items,
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
        }
    }

    async updateByAdmin(id: string, dto: UpdateUserDto, admin: JwtUser){
        if(id === admin.id){
            throw new BadRequestException(
                'You cannot change your own role or active status'
            )
        }

        const user = await this.prisma.user.findUnique({ where: { id } })
        if(!user) throw new NotFoundException('User not found')
        
        return this.prisma.user.update({
            where: { id },
            data: dto,
            select: userSelect,
        })
    }
}
