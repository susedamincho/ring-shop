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

  // Define type for Firebase user data
  interface UserData {
    uid: string;
    email?: string;
    name?: string;
    createdAt?: { seconds: number; nanoseconds: number };
    lastLogin?: { seconds: number; nanoseconds: number };
    isAdmin?: boolean;
    [key: string]: any; // For other possible fields
  }

  // Helper: Convert a Firestore timestamp to a Date object.
  const convertTimestamp = (timestamp: any): Date | null => {
    if (!timestamp || typeof timestamp !== "object") return null
    if ("seconds" in timestamp) {
      return new Date(timestamp.seconds * 1000)
    }
    return null
  }

  const [customer, setCustomer] = useState<any>(null)
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCustomerData = async () => {
      try {
        setLoading(true)
        const [customerData, customerOrders] = await Promise.all([getUserProfile(userId), getOrdersByUser(userId)])

        // Convert customer timestamps if available.
        const convertedCustomer = customerData ? {
          ...customerData,
          createdAt: convertTimestamp((customerData as UserData).createdAt),
          lastLogin: convertTimestamp((customerData as UserData).lastLogin),
        } : null;

        // Convert order timestamps for each order.
        const convertedOrders = customerOrders.map((order: any) => ({
          ...order,
          createdAt: convertTimestamp(order.createdAt),
          updatedAt: convertTimestamp(order.updatedAt),
        }))

        setCustomer(convertedCustomer)
        setOrders(convertedOrders)
      } catch (error) {
        console.error("Error fetching customer data:", error)
        toast({
          title: "Error",
          description: "Failed to load customer details. Please try again.",
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
          <p className="mt-2 text-sm text-muted-foreground">Loading customer details...</p>
        </div>
      </ProtectedRoute>
    )
  }

  if (!customer) {
    return (
      <ProtectedRoute adminOnly>
        <div className="flex flex-col items-center justify-center">
          <p className="text-muted-foreground">Customer not found</p>
          <Button variant="outline" className="mt-4" onClick={() => router.push("/admin/customers")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Customers
          </Button>
        </div>
      </ProtectedRoute>
    )
  }

  // Calculate customer metrics
  const totalSpent = orders.reduce((sum, order) => sum + (order.total || 0), 0)
  const averageOrderValue = orders.length > 0 ? totalSpent / orders.length : 0
  const firstOrderDate =
    orders.length > 0
      ? new Date(Math.min(...orders.map((o) => (o.createdAt ? o.createdAt.getTime() : Date.now()))))
      : null

  return (
    <ProtectedRoute adminOnly>

      <div className="flex flex-col">
        <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-6">
          <Button variant="outline" size="sm" onClick={() => router.push("/admin/customers")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div className="flex flex-1 items-center">
            <h1 className="text-xl font-semibold">Customer Details</h1>
          </div>
        </header>

        <main className="flex-1 p-6">
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="md:col-span-1">
              <CardHeader>
                <CardTitle>Customer Profile</CardTitle>
                <CardDescription>
                  Member since {customer.createdAt ? format(customer.createdAt, "MMMM yyyy") : "N/A"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-lg">
                      {customer.name ? customer.name.charAt(0).toUpperCase() : "U"}
                    </div>
                    <div className="ml-4">
                      <div className="font-medium">{customer.name || "Unknown"}</div>
                      <div className="text-sm text-muted-foreground">
                        {customer.isAdmin ? "Admin User" : "Customer"}
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
                      Last login: Last login: {customer.lastLogin ? format(customer.lastLogin, "PPP p") : "Never"}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Customer Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">Total Orders</div>
                    <div className="text-2xl font-bold">{orders.length}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">Total Spent</div>
                    <div className="text-2xl font-bold">{formatCurrency(totalSpent)}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">Average Order</div>
                    <div className="text-2xl font-bold">{formatCurrency(averageOrderValue)}</div>
                  </div>
                </div>

                <div className="mt-6 space-y-2">
                  <div className="text-sm font-medium">Customer Since</div>
                  <div>{customer.createdAt ? format(customer.createdAt, "PPP") : "N/A"}</div>
                </div>

                <div className="mt-6 space-y-2">
                  <div className="text-sm font-medium">First Order</div>
                  <div>{firstOrderDate ? format(firstOrderDate, "PPP") : "No orders yet"}</div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="orders" className="mt-6">
            <TabsList>
              <TabsTrigger value="orders">Order History</TabsTrigger>
              <TabsTrigger value="addresses">Addresses</TabsTrigger>
              <TabsTrigger value="notes">Notes</TabsTrigger>
            </TabsList>
            <TabsContent value="orders" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Order History</CardTitle>
                </CardHeader>
                <CardContent>
                  {orders.length === 0 ? (
                    <div className="text-center py-6">
                      <Package className="mx-auto h-8 w-8 text-muted-foreground" />
                      <p className="mt-2 text-sm text-muted-foreground">This customer has no orders yet.</p>
                    </div>
                  ) : (
                    <div className="rounded-md border">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th
                              scope="col"
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              Order ID
                            </th>
                            <th
                              scope="col"
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              Date
                            </th>
                            <th
                              scope="col"
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              Status
                            </th>
                            <th
                              scope="col"
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              Total
                            </th>
                            <th
                              scope="col"
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {orders.map((order) => (
                            <tr key={order.id}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {order.orderNumber || order.id}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {order.createdAt ? formatShortDate(order.createdAt) : "N/A"}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <Badge
                                  variant={
                                    order.status === "Delivered"
                                      ? "default"
                                      : order.status === "Shipped"
                                        ? "secondary"
                                        : order.status === "Cancelled"
                                          ? "destructive"
                                          : "outline"
                                  }
                                >
                                  {order.status}
                                </Badge>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {formatCurrency(order.total)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => router.push(`/admin/orders/${order.id}`)}
                                >
                                  View
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="addresses">
              <Card>
                <CardHeader>
                  <CardTitle>Saved Addresses</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-6">
                    <MapPin className="mx-auto h-8 w-8 text-muted-foreground" />
                    <p className="mt-2 text-sm text-muted-foreground">No saved addresses found.</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="notes">
              <Card>
                <CardHeader>
                  <CardTitle>Customer Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-6">
                    <p className="text-sm text-muted-foreground">No notes have been added for this customer.</p>
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
