"use client"

import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import AdminCategories from "@/components/admin-categories"

export default function AdminCategoriesPage() {
  const router = useRouter()
  const { user, isAdmin } = useAuth()

  if (!user || !isAdmin) {
    router.push("/login")
    return null
  }

  return (

    <div className="flex flex-col">
      <main className="flex-1 p-6">
        <div className="flex flex-col gap-6">
          <h1 className="text-3xl font-bold">Категории</h1>
          <AdminCategories />
        </div>
      </main>
    </div>
  )
}
