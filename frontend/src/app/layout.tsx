import type { Metadata } from "next";
import type { ReactNode } from "react";
import './globals.css';
import { AuthProvider } from "@/context/AuthContext";

export const metadata: Metadata = {
  title: 'EduFlow LMS',
  description: 'Learning Management System',
}

export default function RootLayout({ children }: { children: ReactNode }){
  return(
    <html lang="en">
       <body className="min-h-screen bg-gray-50 text-gray-900">
          <AuthProvider>{children}</AuthProvider>
       </body>
    </html>
  )
}