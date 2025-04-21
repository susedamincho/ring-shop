"use client"

import { useState } from "react"
import AdminOrders from "@/components/admin-orders"
import ProtectedRoute from "@/components/protected-route"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import AdminOrderFilters from "@/components/admin-order-filters"

export default function AdminOrdersPage() {
  const [activeTab, setActiveTab] = useState("all")

  return (
    <ProtectedRoute adminOnly>

      <div className="flex flex-col">
        <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-6">
          <div className="flex flex-1 items-center">
            <h1 className="text-xl font-semibold">Orders</h1>
          </div>
        </header>

        <main className="flex-1 p-6">
          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
            <div className="flex items-center justify-between mb-6">
              <TabsList>
                <TabsTrigger value="all">Поръчки</TabsTrigger>
                <TabsTrigger value="pending">Зареждане</TabsTrigger>
                <TabsTrigger value="processing">Обработка</TabsTrigger>
                <TabsTrigger value="shipped">Изпратено</TabsTrigger>
                <TabsTrigger value="delivered">Доставено</TabsTrigger>
                <TabsTrigger value="cancelled">Отказано</TabsTrigger>
              </TabsList>
              <AdminOrderFilters />
            </div>

            <TabsContent value="all">
              <AdminOrders filter="all" />
            </TabsContent>

            <TabsContent value="pending">
              <AdminOrders filter="Pending" />
            </TabsContent>

            <TabsContent value="processing">
              <AdminOrders filter="Processing" />
            </TabsContent>

            <TabsContent value="shipped">
              <AdminOrders filter="Shipped" />
            </TabsContent>

            <TabsContent value="delivered">
              <AdminOrders filter="Delivered" />
            </TabsContent>

            <TabsContent value="cancelled">
              <AdminOrders filter="Cancelled" />
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </ProtectedRoute>
  )
}
