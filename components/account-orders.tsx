"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { Eye, Search, Filter, Package, Loader2, Calendar, Clock } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { formatCurrency } from "@/lib/utils"
import { useAuth } from "@/components/auth-provider"
import { getOrdersByUser } from "@/lib/firebase/orders"
import { useToast } from "@/components/ui/use-toast"

export default function AccountOrders() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [dateFilter, setDateFilter] = useState("all")
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    fetchOrders()
  }, [user])

  const fetchOrders = async () => {
    if (!user?.uid) return

    try {
      setLoading(true)
      const userOrders = await getOrdersByUser(user.uid)
      setOrders(userOrders)
    } catch (err) {
      console.error("Error fetching orders:", err)
      toast({
        title: "Error",
        description: "Failed to load your orders. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "Delivered":
        return "bg-green-500/20 text-green-400 border-green-500/30"
      case "Shipped":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30"
      case "Processing":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
      case "Cancelled":
        return "bg-red-500/20 text-red-400 border-red-500/30"
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30"
    }
  }

  const formatDate = (timestamp) => {
    if (!timestamp) return "N/A"

    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const filteredOrders = orders
    .filter((order) => {
      // Search filter
      const searchMatch =
        searchTerm === "" ||
        order.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase())

      // Status filter
      const statusMatch = statusFilter === "all" || order.status === statusFilter

      // Date filter
      let dateMatch = true
      if (dateFilter !== "all") {
        const orderDate = order.createdAt?.toDate ? order.createdAt.toDate() : new Date(order.createdAt)
        const now = new Date()

        if (dateFilter === "last30") {
          const thirtyDaysAgo = new Date()
          thirtyDaysAgo.setDate(now.getDate() - 30)
          dateMatch = orderDate >= thirtyDaysAgo
        } else if (dateFilter === "last90") {
          const ninetyDaysAgo = new Date()
          ninetyDaysAgo.setDate(now.getDate() - 90)
          dateMatch = orderDate >= ninetyDaysAgo
        } else if (dateFilter === "last365") {
          const yearAgo = new Date()
          yearAgo.setDate(now.getDate() - 365)
          dateMatch = orderDate >= yearAgo
        }
      }

      return searchMatch && statusMatch && dateMatch
    })
    .sort((a, b) => {
      const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt)
      const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt)
      return dateB - dateA // Sort by most recent first
    })

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-12 w-12 animate-spin text-[#0d9488] mb-4" />
        <p className="text-gray-400">Loading your orders...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold">Your Orders</h2>

        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 bg-[#1e293b]/50 border-white/10"
            />
          </div>

          <Button
            variant="outline"
            size="icon"
            className="border-white/10 text-gray-300 hover:bg-white/5"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#1e293b]/50 p-4 rounded-lg border border-white/10"
        >
          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="bg-[#0f172a] border-white/10">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent className="bg-[#0f172a] border-white/10">
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Processing">Processing</SelectItem>
                <SelectItem value="Shipped">Shipped</SelectItem>
                <SelectItem value="Delivered">Delivered</SelectItem>
                <SelectItem value="Cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Time Period</Label>
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="bg-[#0f172a] border-white/10">
                <SelectValue placeholder="Filter by date" />
              </SelectTrigger>
              <SelectContent className="bg-[#0f172a] border-white/10">
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="last30">Last 30 Days</SelectItem>
                <SelectItem value="last90">Last 90 Days</SelectItem>
                <SelectItem value="last365">Last Year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </motion.div>
      )}

      {filteredOrders.length === 0 ? (
        <div className="text-center py-12 bg-[#1e293b]/50 rounded-xl border border-white/10">
          <Package className="h-16 w-16 mx-auto text-gray-500 mb-4" />
          <h3 className="text-xl font-semibold mb-2">No orders found</h3>
          <p className="text-gray-400 mb-6">
            {orders.length === 0 ? "You haven't placed any orders yet." : "No orders match your current filters."}
          </p>
          {orders.length === 0 && (
            <Link href="/products">
              <Button className="bg-[#0d9488] hover:bg-[#0d9488]/80 text-white">Start Shopping</Button>
            </Link>
          )}
          {orders.length > 0 && (
            <Button
              variant="outline"
              className="border-white/10 text-gray-300 hover:bg-white/5"
              onClick={() => {
                setSearchTerm("")
                setStatusFilter("all")
                setDateFilter("all")
              }}
            >
              Clear Filters
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#1e293b]/50 rounded-xl border border-white/10 overflow-hidden hover:border-[#0d9488]/30 transition-colors"
            >
              <div className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-lg">Order #{order.orderNumber || order.id?.substring(0, 8)}</h3>
                      <Badge className={`${getStatusColor(order.status)}`}>{order.status}</Badge>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-400 mt-1">
                      <div className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        {formatDate(order.createdAt)}
                      </div>
                      {order.estimatedDelivery && (
                        <div className="flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          Est. Delivery: {formatDate(order.estimatedDelivery)}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="font-medium">{formatCurrency(order.total)}</div>
                      <div className="text-sm text-gray-400">{order.items?.length || 0} items</div>
                    </div>
                    <Link href={`/account/orders/${order.id}`}>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-[#0d9488]/30 text-[#0d9488] hover:bg-[#0d9488]/10"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                    </Link>
                  </div>
                </div>

                {/* Order Items Preview */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mt-4">
                  {order.items?.slice(0, 4).map((item, index) => (
                    <div key={index} className="flex items-center gap-3 bg-[#0f172a]/80 rounded-lg p-2">
                      <div className="h-12 w-12 rounded-md bg-gray-800 flex-shrink-0 overflow-hidden">
                        {item.image ? (
                          <img
                            src={item.image || "/placeholder.svg"}
                            alt={item.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center text-gray-500">
                            <Package className="h-6 w-6" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">{item.name}</p>
                        <p className="text-xs text-gray-400">
                          Qty: {item.quantity} × {formatCurrency(item.price)}
                        </p>
                      </div>
                    </div>
                  ))}
                  {order.items?.length > 4 && (
                    <div className="flex items-center justify-center bg-[#0f172a]/80 rounded-lg p-2">
                      <p className="text-sm text-gray-400">+{order.items.length - 4} more items</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}

// Helper component for labels
function Label({ children, className = "" }) {
  return <label className={`text-sm font-medium text-gray-300 ${className}`}>{children}</label>
}
