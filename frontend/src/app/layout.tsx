import type { Metadata } from "next";
import type { ReactNode } from "react";
import './globals.css';
import { AuthProvider } from "@/context/AuthContext";
import { Inter } from 'next/font/google'
import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'EduFlow LMS',
  description: 'Learning Management System',
}

export default function RootLayout({ children }: { children: ReactNode }){
  return(
    <html lang="en">
      <body className={`${inter.variable} flex min-h-screen flex-col font-sans`}>
        <AuthProvider>
          <Navbar />
          <div className="flex-1">{children}</div>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  )
}
