import { GraduationCap } from "lucide-react";
import Link from "next/link";

export default function Footer(){
    return (
    <footer className="mt-16 border-t border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-6 py-8 text-sm text-slate-500 sm:flex-row">
        <p className="flex items-center gap-2 font-semibold text-slate-700">
          <GraduationCap size={18} className="text-blue-600" /> EduFlow
        </p>
        <div className="flex gap-5">
          <Link href="/courses" className="hover:text-blue-600">
            Courses
          </Link>
          <Link href="/login" className="hover:text-blue-600">
            Log in
          </Link>
          <Link href="/register" className="hover:text-blue-600">
            Register
          </Link>
        </div>
        <p>&copy; {new Date().getFullYear()} EduFlow LMS</p>
      </div>
    </footer>
  );
}