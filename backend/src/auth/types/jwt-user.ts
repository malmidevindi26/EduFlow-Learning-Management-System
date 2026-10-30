import { Role } from "@prisma/client";

export interface JwtUser{
    id: string
    email: string
    name: string
    role: Role
}