import type { Metadata } from "next";
import type { ReactNode } from "react";
import './globals.css';
import { AuthProvider } from "@/context/AuthContext";
import { Inter } from 'next/font/google'
import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';
import SiteChrome from "@/components/SiteChrome";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: { default: 'EduFlow LMS', template: '%s | EduFlow'},
  description: 'Learn, teach and manage courses in one place',
}

export default function RootLayout({ children }: { children: ReactNode }){
  return(
    <html lang="en" data-scroll-behavior="smooth">
      <body className={`${inter.variable} min-h-screen font-sans antialiased`}>
        <AuthProvider>
          <SiteChrome>{children}</SiteChrome>
          <Toaster position="top-right" richColors closeButton />
        </AuthProvider>
      </body>
    </html>
  )
}
