import Link from "next/link";

export default function HomePage(){
  return(
    <main className="mx-auto flex max-w-xl flex-col items-center gap-6 px-6 py-24 text-center">
      <h1 className="text-4xl font-bold">EduFlow</h1>
      <p className="text-gray-600">Learn, teach and manage courses in one place.</p>
      <div className="flex gap-3">
        <Link href="/login" className="rounded-lg bg-blue-600 px-5 py-2 text-white hover:bg-blue-700">
          Log in
        </Link>
        <Link href="/register" className="rounded-lg border border-gray-300 px-5 py-2 hover:bg-gray-100">
          Register
        </Link>
      </div>
    </main>
  )
}