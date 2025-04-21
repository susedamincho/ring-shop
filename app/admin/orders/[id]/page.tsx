"use client"

import { useParams, useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { ArrowLeft, Loader2 } from "lucide-react"
import { format } from "date-fns"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import ProtectedRoute from "@/components/protected-route"
import { getOrderById, updateOrderStatus } from "@/lib/firebase/orders"
import { formatCurrency } from "@/lib/utils"

/**
 * Helper function for converting a Firestore Timestamp (or other date format)
 * to a JavaScript Date.
 *
 * If the value is an object with a `seconds` property, then we assume it
 * is a Firestore Timestamp and convert it to a Date using the seconds value.
 * Otherwise, the value is passed directly to new Date().
 */
function toValidDate(date: any): Date | null {
  if (!date) return null
  if (typeof date === "object" && "seconds" in date) {
    return new Date(date.seconds * 1000)
  }
  const d = new Date(date)
  return isNaN(d.getTime()) ? null : d
}

/**
 * Formats a date value using date-fns' format.
 * Returns "N/A" if the date value is invalid or not provided.
 */
function formatOrderDate(date: any, dateFormat = "PPP 'at' p"): string {
  const validDate = toValidDate(date)
  return validDate ? format(validDate, dateFormat) : "N/A"
}

export default function OrderDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const orderId = params.id as string

  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true)
        const orderData = await getOrderById(orderId)
        setOrder(orderData)
      } catch (error) {
        console.error("Error fetching order:", error)
        toast({
          title: "Error",
          description: "Failed to load order details. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchOrder()
  }, [orderId, toast])

  const handleStatusChange = async (newStatus: string) => {
    try {
      setUpdating(true)
      await updateOrderStatus(orderId, newStatus)
      setOrder({ ...order, status: newStatus })
      toast({
        title: "Status updated",
        description: `Order status has been updated to ${newStatus}.`,
      })
    } catch (error) {
      console.error("Error updating order status:", error)
      toast({
        title: "Update failed",
        description: "Failed to update order status. Please try again.",
        variant: "destructive",
      })
    } finally {
      setUpdating(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-100 text-yellow-800"
      case "Processing":
        return "bg-blue-100 text-blue-800"
      case "Shipped":
        return "bg-purple-100 text-purple-800"
      case "Delivered":
        return "bg-green-100 text-green-800"
      case "Cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (loading) {
    return (
      <ProtectedRoute adminOnly>
        <div className="flex flex-col items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="mt-2 text-sm text-muted-foreground">Зареждане на поръчка</p>
        </div>
      </ProtectedRoute>
    )
  }

  if (!order) {
    return (
      <ProtectedRoute adminOnly>
        <div className="flex flex-col items-center justify-center">
          <p className="text-muted-foreground">Поръчката не бе намерена</p>
          <Button variant="outline" className="mt-4" onClick={() => router.push("/admin/orders")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Отбратно в поръчки
          </Button>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute adminOnly>

      <div className="flex flex-col">
        <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-6">
          <Button variant="outline" size="sm" onClick={() => router.push("/admin/orders")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Обратно
          </Button>
        </header>

        <main className="flex-1 p-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div>
                  <CardTitle>Статус на поръчката</CardTitle>
                  <CardDescription>
                    Създадена на {order.createdAt ? formatOrderDate(order.createdAt, "PPP") : "N/A"}
                  </CardDescription>
                </div>
                <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="text-sm font-medium">Ъпдейт статус</div>
                    <Select defaultValue={order.status} onValueChange={handleStatusChange} disabled={updating}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Pending">Зреждане</SelectItem>
                        <SelectItem value="Processing">Обработка</SelectItem>
                        <SelectItem value="Shipped">Изпратено</SelectItem>
                        <SelectItem value="Delivered">Доставено</SelectItem>
                        <SelectItem value="Cancelled">Отменено</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm font-medium">Статус на плащането</div>
                    <div className="rounded-md bg-green-50 px-3 py-2 text-sm text-green-700">
                      {order.paymentStatus || "Paid"}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Информация за клиент</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="text-sm font-medium">Клиент</div>
                    <div className="text-sm">
                      {order.shippingAddress?.firstName} {order.shippingAddress?.lastName}
                    </div>
                    <div className="text-sm">{order.shippingAddress?.email}</div>
                    <div className="text-sm">{order.shippingAddress?.phone}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium">Адрес за доставка</div>
                    <div className="text-sm">{order.shippingAddress?.address}</div>
                    <div className="text-sm">
                      {order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.zipCode}
                    </div>
                    <div className="text-sm">{order.shippingAddress?.country}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium">Начин на доставка</div>
                    <div className="text-sm">
                      {order.shippingMethod === "standard" ? "Standard Shipping" : "Express Shipping"}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="items" className="mt-6">
            <TabsList>
              <TabsTrigger value="items">Артикули за поръчка</TabsTrigger>
              <TabsTrigger value="history">История на поръчките</TabsTrigger>
              <TabsTrigger value="notes">Бележки</TabsTrigger>
            </TabsList>
            <TabsContent value="items" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Артикули за поръчка</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Product
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Price
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Quantity
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Total
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {order.items &&
                          order.items.map((item: any, index: number) => (
                            <tr key={index}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="h-10 w-10 flex-shrink-0">
                                    <img
                                      className="h-10 w-10 rounded-md object-cover"
                                      src={item.image || "/placeholder.svg"}
                                      alt={item.name}
                                    />
                                  </div>
                                  <div className="ml-4">
                                    <div className="text-sm font-medium text-gray-900">{item.name}</div>
                                    <div className="text-sm text-gray-500">
                                      {item.size && `Size: ${item.size}`} {item.color && `Color: ${item.color}`}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {formatCurrency(item.price)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.quantity}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {formatCurrency(item.price * item.quantity)}
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="mt-6 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>
                      Междинна сума</span>
                      <span>{formatCurrency(order.subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Доставка</span>
                      <span>{formatCurrency(order.shipping)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Такса</span>
                      <span>{formatCurrency(order.tax)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-medium">
                      <span>Обща стойност</span>
                      <span>{formatCurrency(order.total)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="history">
              <Card>
                <CardHeader>
                  <CardTitle>История на поръчките</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="h-2 w-2 rounded-full bg-green-500"></div>
                      <div>
                        <div className="font-medium">
                        Поръчката е създадена</div>
                        <div className="text-sm text-muted-foreground">{formatOrderDate(order.createdAt)}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                      <div>
                        <div className="font-medium">
                        Плащането е получено</div>
                        <div className="text-sm text-muted-foreground">{formatOrderDate(order.createdAt)}</div>
                      </div>
                    </div>
                    {order.status !== "Pending" && (
                      <div className="flex items-center gap-4">
                        <div className="h-2 w-2 rounded-full bg-purple-500"></div>
                        <div>
                          <div className="font-medium">Статусът е променен на {order.status}</div>
                          <div className="text-sm text-muted-foreground">
                            {order.updatedAt ? formatOrderDate(order.updatedAt) : "N/A"}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="notes">
              <Card>
                <CardHeader>
                  <CardTitle>Бележки за поръчката</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="rounded-md border p-4">
                      <p className="text-sm text-muted-foreground">Няма добавени бележки към тази поръчка.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </ProtectedRoute>
  )
}
