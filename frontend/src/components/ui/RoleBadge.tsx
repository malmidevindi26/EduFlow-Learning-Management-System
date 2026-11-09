import type { Role } from "@/lib/types";

const STYLE: Record<Role, string> = {
  ADMIN: 'bg-violet-50 text-violet-700',
  INSTRUCTOR: 'bg-blue-50 text-blue-700',
  STUDENT: 'bg-emerald-50 text-emerald-700',
}

export default function RoleBadge({ role }: { role: Role }){
    return(
        <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STYLE[role]}`}>
           {role.charAt(0) + role.slice(1).toLowerCase()}
        </span>
    )
}