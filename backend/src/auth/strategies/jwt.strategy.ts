import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { UsersService } from "../../users/users.service";
import type { JwtUser } from "../types/jwt-user";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy){
    constructor(
        config: ConfigService,
        private readonly user: UsersService,
    ){
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: config.getOrThrow<string>('JWT_SECRET')
        })
    }

    async validate(payload: { sub:string }): Promise<JwtUser>{
        const user = await this.user.findById(payload.sub)
        if (!user || !user.isActive){
            throw new UnauthorizedException()
        }

        return { id: user.id, email: user.email, name: user.name, role: user.role }
    }
}