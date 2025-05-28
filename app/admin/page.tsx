"use client"
import { useState, useEffect } from "react"
import { Box, DollarSign, ShoppingCart, Users } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import AdminProducts from "@/components/admin-products"
import AdminOrders from "@/components/admin-orders"
import AdminCustomers from "@/components/admin-customers"
import AdminCategories from "@/components/admin-categories"
import ProtectedRoute from "@/components/protected-route"
import { getDashboardStats } from "@/lib/firebase/analytics"
import { Loader2 } from "lucide-react"

export default function AdminPage() {
  const [selectedTab, setSelectedTab] = useState("products")
  const [stats, setStats] = useState({
    revenue: { total: 0, change: 0 },
    orders: { total: 0, change: 0 },
    products: { total: 0, new: 0 },
    customers: { total: 0, new: 0 },
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true)
        const dashboardStats = await getDashboardStats()
        setStats({
          revenue: {
            total: Number(dashboardStats.revenue.total),
            change: Number(dashboardStats.revenue.change)
          },
          orders: {
            total: Number(dashboardStats.orders.total),
            change: Number(dashboardStats.orders.change)
          },
          products: dashboardStats.products,
          customers: dashboardStats.customers
        })
      } catch (error) {
        console.error("Error fetching dashboard stats:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  return (
    <ProtectedRoute adminOnly>
      <div className="flex flex-col gap-6">
        <h1 className="text-3xl font-bold">Табло за управление</h1>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Общи приходи</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.revenue.total.toFixed(2)} лв.</div>
                <p className="text-xs text-muted-foreground">
                  {stats.revenue.change >= 0 ? "+" : ""}
                  {stats.revenue.change}% from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Поръчки</CardTitle>
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.orders.total}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.orders.change >= 0 ? "+" : ""}
                  {stats.orders.change}% От последния месец
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Артикули</CardTitle>
                <Box className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.products.total}</div>
                <p className="text-xs text-muted-foreground">+{stats.products.new} Нови артикули</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Клиенти</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.customers.total}</div>
                <p className="text-xs text-muted-foreground">+{stats.customers.new} този месец</p>
              </CardContent>
            </Card>
          </div>
        )}

        <Tabs defaultValue={selectedTab} onValueChange={setSelectedTab}>
          <TabsList>
            <TabsTrigger value="products">Артикули</TabsTrigger>
            <TabsTrigger value="categories">Категории</TabsTrigger>
            <TabsTrigger value="orders">Поръчки</TabsTrigger>
            <TabsTrigger value="customers">Клиенти</TabsTrigger>
          </TabsList>
          <TabsContent value="products" className="pt-6">
            <AdminProducts />
          </TabsContent>
          <TabsContent value="categories" className="pt-6">
            <AdminCategories />
          </TabsContent>
          <TabsContent value="orders" className="pt-6">
            <AdminOrders />
          </TabsContent>
          <TabsContent value="customers" className="pt-6">
            <AdminCustomers />
          </TabsContent>
        </Tabs>
      </div>
    </ProtectedRoute>
  )
}
