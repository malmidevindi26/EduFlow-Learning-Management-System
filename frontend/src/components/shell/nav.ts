import { ClipboardCheck, Compass, FolderTree, LayoutDashboard, PlusCircle, Users, type LucideIcon } from 'lucide-react';
import type { Role } from '@/lib/types';

export interface NavItem {
    href: string
    label: string
    icon: LucideIcon
    exact?: boolean
    also?: string[]
}

export const NAV: Record<Role, NavItem[]> = {
    STUDENT: [
      { href: '/dashboard', label: 'My learning', icon: LayoutDashboard, exact: true, also: ['/learn'] },
      { href: '/courses', label: 'Browse courses', icon: Compass },
    ],
  INSTRUCTOR: [
      { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, exact: true, also: ['/instructor/courses/'] },
      { href: '/instructor/courses/new', label: 'New course', icon: PlusCircle },
      { href: '/courses', label: 'Public catalogue', icon: Compass },
    ],
  ADMIN: [
      { href: '/dashboard', label: 'Overview', icon: LayoutDashboard, exact: true },
      { href: '/admin/courses', label: 'Course approvals', icon: ClipboardCheck },
      { href: '/admin/users', label: 'Users', icon: Users },
      { href: '/admin/categories', label: 'Categories', icon: FolderTree },
      { href: '/courses', label: 'Public catalogue', icon: Compass },
  ],
}

export function findActive(items: NavItem[], pathname: string){
    const exact = items.find((i) => pathname === i.href)
    if(exact) return exact.href

    const prefix = items
       .filter((i) => !i.exact && pathname.startsWith(`${i.href}/`))
       .sort((a, b) => b.href.length - a.href.length)[0]
    if (prefix) return prefix.href

    return items.find((i) => i.also?.some((p) => pathname.startsWith(p)))?.href;
}