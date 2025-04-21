"use client"

import AdminAttributes from "@/components/admin-attributes"
import ProtectedRoute from "@/components/protected-route"

export default function AdminAttributesPage() {
  return (
    <ProtectedRoute adminOnly>

      <div className="flex flex-col">
        <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-6">
          <div className="flex flex-1 items-center">
            <h1 className="text-xl font-semibold">Атрибути на телефона</h1>
          </div>
        </header>

        <main className="flex-1 p-6">
          <AdminAttributes />
        </main>
      </div>
    </ProtectedRoute>
  )
}
