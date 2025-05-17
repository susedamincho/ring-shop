"use client"

import AdminCustomers from "@/components/admin-customers"
import ProtectedRoute from "@/components/protected-route"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useState } from "react"

export default function AdminCustomersPage() {
  const [searchTerm, setSearchTerm] = useState("")

  return (
    <ProtectedRoute adminOnly>

      <div className="flex flex-col">
        <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-6">
          <div className="flex flex-1 items-center justify-between">
            <h1 className="text-xl font-semibold">Клиенти</h1>
            <div className="flex items-center gap-2">
              <Input
                placeholder="Search customers..."
                className="w-[300px]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Button variant="outline">Експорт</Button>
            </div>
          </div>
        </header>

        <main className="flex-1 p-6">
          <AdminCustomers searchTerm={searchTerm} />
        </main>
      </div>
    </ProtectedRoute>
  )
}
