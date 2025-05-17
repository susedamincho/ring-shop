"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Eye, MoreHorizontal, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { getOrders, updateOrderStatus } from "@/lib/firebase/orders"
import { formatCurrency, formatShortDate } from "@/lib/utils"

export default function AdminOrders({ filter = "all" }) {
  const router = useRouter()
  const { toast } = useToast()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchOrders()
  }, [filter])

  const convertTimestamp = (timestamp) => {
    if (!timestamp || typeof timestamp !== "object") return timestamp
    if ("seconds" in timestamp) {
      return new Date(timestamp.seconds * 1000)
    }
    return timestamp
  }

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const fetchedOrders = await getOrders()
      const convertedOrders = fetchedOrders.map((order) => ({
        ...order,
        createdAt: convertTimestamp(order.createdAt),
        updatedAt: convertTimestamp(order.updatedAt),
      }))

      let filteredOrders = convertedOrders
      if (filter !== "all") {
        filteredOrders = convertedOrders.filter((order) => order.status === filter)
      }

      setOrders(filteredOrders)
    } catch (error) {
      console.error("Грешка при зареждане на поръчките:", error)
      toast({
        title: "Грешка",
        description: "Неуспешно зареждане на поръчките. Опитайте отново.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus)
      setOrders(orders.map((order) => (order.id === orderId ? { ...order, status: newStatus } : order)))

      toast({
        title: "Статусът е обновен",
        description: `Поръчката ${orderId} е обновена до "${newStatus}".`,
      })
    } catch (error) {
      console.error("Грешка при обновяване на статус:", error)
      toast({
        title: "Грешка",
        description: "Неуспешно обновяване на статуса. Опитайте отново.",
        variant: "destructive",
      })
    }
  }

  const handleViewOrder = (orderId) => {
    router.push(`/admin/orders/${orderId}`)
  }

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{orders.length} поръчки</p>
        <Button variant="outline" onClick={() => fetchOrders()}>
          Обнови
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID на поръчка</TableHead>
              <TableHead>Клиент</TableHead>
              <TableHead>Дата</TableHead>
              <TableHead>Артикули</TableHead>
              <TableHead>Общо</TableHead>
              <TableHead>Статус</TableHead>
              <TableHead className="text-right">Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  Няма намерени поръчки.
                </TableCell>
              </TableRow>
            ) : (
              orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.orderNumber || order.id}</TableCell>
                  <TableCell>
                    {order.shippingAddress?.firstName} {order.shippingAddress?.lastName}
                  </TableCell>
                  <TableCell>{formatShortDate(order.createdAt)}</TableCell>
                  <TableCell>{order.items?.length || 0}</TableCell>
                  <TableCell>{formatCurrency(order.total)}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        order.status === "Delivered"
                          ? "default"
                          : order.status === "Shipped"
                          ? "secondary"
                          : order.status === "Processing"
                          ? "outline"
                          : order.status === "Pending"
                          ? "destructive"
                          : "outline"
                      }
                    >
                      {{
                        Pending: "Изчакваща",
                        Processing: "Обработва се",
                        Shipped: "Изпратена",
                        Delivered: "Доставена",
                        Cancelled: "Отменена",
                      }[order.status] || order.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Действия</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Действия</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handleViewOrder(order.id)}>
                          <Eye className="mr-2 h-4 w-4" />
                          Преглед
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuLabel>Промяна на статус</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handleUpdateStatus(order.id, "Pending")}>
                          Изчакваща
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleUpdateStatus(order.id, "Processing")}>
                          Обработва се
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleUpdateStatus(order.id, "Shipped")}>
                          Изпратена
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleUpdateStatus(order.id, "Delivered")}>
                          Доставена
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleUpdateStatus(order.id, "Cancelled")}>
                          Отменена
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
