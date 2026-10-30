import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
    constructor(private readonly prisma: PrismaService){}

    findAll(){
      return this.prisma.category.findMany({ orderBy: { name: 'asc' } });   
    }

    async create(dto: CreateCategoryDto){
        try{
            return await this.prisma.category.create({ data: dto })
        } catch (e){
            this.handleUnique(e)
            throw e;
        }
    }

    async update(id: string, dto: UpdateCategoryDto){
        await this.ensureExists(id)
        try {
            return await this.prisma.category.update({ where: { id }, data: dto })
        } catch (error) {
            this.handleUnique(error)
            throw error
        }
        
    }

    async remove(id: string){
        await this.ensureExists(id)
        const courseCount = await this.prisma.course.count({
            where: { categoryId: id },
        })
        if (courseCount > 0){
            throw new ConflictException(
                'Connot delete a category that still has courses'
            )
        }
        await this.prisma.category.delete({ where: { id } })
        return { message: 'Category deleted' }
    }

    private async ensureExists(id: string){
        const category = await this.prisma.category.findUnique({ where: { id } })
        if (!category) throw new NotFoundException('Category not found')
        return category;
    }

    private handleUnique(e: unknown){
        if(
            e instanceof Prisma.PrismaClientKnownRequestError && 
            e.code === 'P2002'
        ) {
            throw new ConflictException('Category name already exists')
        }
    }
}
