'use client'

import { useAuth } from "@/context/AuthContext"

export default function DashboardPage(){
    const { user } = useAuth()

    return (
    <div>
      <h1 className="text-2xl font-bold">Welcome, {user?.name}</h1>
      <p className="mt-2 text-gray-600">
        You are logged in as <strong>{user?.role}</strong>.
      </p>
    </div>
   );
}