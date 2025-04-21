"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import AdminProducts from "@/components/admin-products"
import ProtectedRoute from "@/components/protected-route"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import AdminProductFilters from "@/components/admin-product-filters"

export default function AdminProductsPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("all")
  const [filters, setFilters] = useState({})

  const handleAddProduct = () => {
    router.push("/admin/products/new")
  }

  const handleFilterChange = (newFilters: Record<string, any>) => {
    setFilters(newFilters)
  }

  return (
    <ProtectedRoute adminOnly>

      <div className="flex flex-col">
        <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-6">
          <div className="flex flex-1 items-center justify-between">
            <h1 className="text-xl font-semibold">Продукти</h1>
            <Button onClick={handleAddProduct}>
              <Plus className="mr-2 h-4 w-4" />
              Добавете артикул
            </Button>
          </div>
        </header>

        <main className="flex-1 p-6">
          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
            <div className="flex items-center justify-between mb-6">
              <TabsList>
                <TabsTrigger value="all">Всички артикули</TabsTrigger>
                <TabsTrigger value="active">
                Активен</TabsTrigger>
                <TabsTrigger value="out-of-stock">Извън наличност</TabsTrigger>
                <TabsTrigger value="featured">
                Представено</TabsTrigger>
              </TabsList>
              <AdminProductFilters onFilterChange={handleFilterChange} />
            </div>

            <TabsContent value="all">
              <AdminProducts filter="all" />
            </TabsContent>

            <TabsContent value="active">
              <AdminProducts filter="active" />
            </TabsContent>

            <TabsContent value="out-of-stock">
              <AdminProducts filter="out-of-stock" />
            </TabsContent>

            <TabsContent value="featured">
              <AdminProducts filter="featured" />
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </ProtectedRoute>
  )
}
