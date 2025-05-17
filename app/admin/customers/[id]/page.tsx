// CustomerDetailsPage.tsx

"use client"

import { useParams, useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { ArrowLeft, Mail, Phone, MapPin, Package, Calendar } from "lucide-react"
import { format } from "date-fns"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import ProtectedRoute from "@/components/protected-route"
import { getUserProfile } from "@/lib/firebase/users"
import { getOrdersByUser } from "@/lib/firebase/orders"
import { formatCurrency, formatShortDate } from "@/lib/utils"
import { Loader2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export default function CustomerDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const userId = params.id as string

  const [customer, setCustomer] = useState<any>(null)
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const convertTimestamp = (timestamp: any): Date | null => {
    if (!timestamp || typeof timestamp !== "object") return null
    if ("seconds" in timestamp) return new Date(timestamp.seconds * 1000)
    return null
  }

  useEffect(() => {
    const fetchCustomerData = async () => {
      try {
        setLoading(true)
        const [customerData, customerOrders] = await Promise.all([getUserProfile(userId), getOrdersByUser(userId)])

        const convertedCustomer = customerData ? {
          ...customerData,
          createdAt: convertTimestamp(customerData.createdAt),
          lastLogin: convertTimestamp(customerData.lastLogin),
        } : null

        const convertedOrders = customerOrders.map((order: any) => ({
          ...order,
          createdAt: convertTimestamp(order.createdAt),
          updatedAt: convertTimestamp(order.updatedAt),
        }))

        setCustomer(convertedCustomer)
        setOrders(convertedOrders)
      } catch (error) {
        console.error("Грешка при зареждане на клиента:", error)
        toast({
          title: "Грешка",
          description: "Неуспешно зареждане на данните за клиента.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchCustomerData()
  }, [userId, toast])

  if (loading) {
    return (
      <ProtectedRoute adminOnly>
        <div className="flex flex-col items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="mt-2 text-sm text-muted-foreground">Зареждане на информация за клиента...</p>
        </div>
      </ProtectedRoute>
    )
  }

  if (!customer) {
    return (
      <ProtectedRoute adminOnly>
        <div className="flex flex-col items-center justify-center">
          <p className="text-muted-foreground">Клиентът не е намерен</p>
          <Button variant="outline" className="mt-4" onClick={() => router.push("/admin/customers")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Назад към клиенти
          </Button>
        </div>
      </ProtectedRoute>
    )
  }

  const totalSpent = orders.reduce((sum, order) => sum + (order.total || 0), 0)
  const averageOrderValue = orders.length > 0 ? totalSpent / orders.length : 0
  const firstOrderDate = orders.length > 0
    ? new Date(Math.min(...orders.map((o) => o.createdAt?.getTime() ?? Date.now())))
    : null

  return (
    <ProtectedRoute adminOnly>
      <div className="flex flex-col">
        <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-6">
          <Button variant="outline" size="sm" onClick={() => router.push("/admin/customers")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Назад
          </Button>
          <div className="flex flex-1 items-center">
            <h1 className="text-xl font-semibold">Детайли за клиента</h1>
          </div>
        </header>

        <main className="flex-1 p-6">
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="md:col-span-1">
              <CardHeader>
                <CardTitle>Профил на клиента</CardTitle>
                <CardDescription>
                  Член от {customer.createdAt ? format(customer.createdAt, "MMMM yyyy") : "Няма данни"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-lg">
                      {customer.name ? customer.name.charAt(0).toUpperCase() : "U"}
                    </div>
                    <div className="ml-4">
                      <div className="font-medium">{customer.name || "Неизвестен"}</div>
                      <div className="text-sm text-muted-foreground">
                        {customer.isAdmin ? "Администратор" : "Клиент"}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center text-sm">
                      <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
                      {customer.email}
                    </div>
                    {customer.phone && (
                      <div className="flex items-center text-sm">
                        <Phone className="mr-2 h-4 w-4 text-muted-foreground" />
                        {customer.phone}
                      </div>
                    )}
                    {customer.address && (
                      <div className="flex items-center text-sm">
                        <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                        {customer.address}
                      </div>
                    )}
                    <div className="flex items-center text-sm">
                      <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                      Последно влизане: {customer.lastLogin ? format(customer.lastLogin, "PPP p") : "Никога"}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Обобщение</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <div className="text-sm text-muted-foreground">Общо поръчки</div>
                    <div className="text-2xl font-bold">{orders.length}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Обща сума</div>
                    <div className="text-2xl font-bold">{formatCurrency(totalSpent)}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Средна поръчка</div>
                    <div className="text-2xl font-bold">{formatCurrency(averageOrderValue)}</div>
                  </div>
                </div>

                <div className="mt-6">
                  <div className="text-sm font-medium">Потребител от</div>
                  <div>{customer.createdAt ? format(customer.createdAt, "PPP") : "Няма информация"}</div>
                </div>

                <div className="mt-6">
                  <div className="text-sm font-medium">Първа поръчка</div>
                  <div>{firstOrderDate ? format(firstOrderDate, "PPP") : "Няма поръчки"}</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}
