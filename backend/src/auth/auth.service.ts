import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Role } from '@prisma/client';
import * as bcrypt from 'bcrypt'
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
    constructor(
        private readonly users: UsersService,
        private readonly jwt: JwtService,
    ) {}

    async register(dto: RegisterDto){
        const email = dto.email.toLowerCase()

        const existing = await this.users.findByEmail(email)
        if(existing){
            throw new ConflictException('Email is already registerd')
        }

        const passwordHash = await bcrypt.hash(dto.password, 10)
        const user = await this.users.create({
            email,
            passwordHash,
            name: dto.name,
            role: dto.role === 'INSTRUCTOR' ? Role.INSTRUCTOR : Role.STUDENT,
        })

        return this.buildAuthResponse(user)
    }

    async login(dto: LoginDto){
        const user = await this.users.findByEmail(dto.email.toLowerCase())

        if(!user || !user.isActive){
            throw new UnauthorizedException('Invalid email or password')
        }

        const matches = await bcrypt.compare(dto.password, user.passwordHash)
        if(!matches){
            throw new UnauthorizedException('Invalid email or password')
        }

        return this.buildAuthResponse(user)
    }

    private async buildAuthResponse(user: {
        id: string
        email: string
        name: string
        role: Role
    }){
        const accessToken = await this.jwt.signAsync({
            sub: user.id,
            email: user.email,
            role: user.role
        })

        return {
            accessToken,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
            }
        }
    }
}
