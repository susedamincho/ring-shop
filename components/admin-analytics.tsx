"use client"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import {
  ResponsiveContainer,
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  BarChart as RechartsBarChart,
  Bar,
} from "recharts"
import {
  getSalesData,
  getProductPerformance,
  getCategoryPerformance,
  getDashboardStats,
} from "@/lib/firebase/analytics"
import { Loader2 } from "lucide-react"

export default function AdminAnalytics() {
  const [period, setPeriod] = useState("monthly")
  const [salesData, setSalesData] = useState([])
  const [productData, setProductData] = useState([])
  const [categoryData, setCategoryData] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    revenue: { total: 0, change: 0 },
    orders: { total: 0, change: 0 },
    products: { total: 0, new: 0 },
    customers: { total: 0, new: 0 },
  })
  const [statsData, setStatsData] = useState([])

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        setLoading(true)

        // Fetch all data in parallel
        const [fetchedSalesData, fetchedProductData, fetchedCategoryData, fetchedStats] = await Promise.all([
          getSalesData(period),
          getProductPerformance(),
          getCategoryPerformance(),
          getDashboardStats(),
        ])

        setSalesData(fetchedSalesData)
        setProductData(fetchedProductData)
        setCategoryData(fetchedCategoryData)
        setStats(fetchedStats)
        setStatsData(fetchedSalesData)
      } catch (error) {
        console.error("Error fetching analytics data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchAnalyticsData()
  }, [period])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="sales">
        <TabsList>
          <TabsTrigger value="sales">Sales</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
        </TabsList>

        <TabsContent value="sales" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Total Revenue</CardTitle>
                <CardDescription>Monthly revenue</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">${stats.revenue.total}</div>
                <p className="text-xs text-muted-foreground">
                  {Number.parseFloat(stats.revenue.change) >= 0 ? "+" : ""}
                  {stats.revenue.change}% from last month
                </p>
                <div className="mt-4 h-[120px]">
                  <ChartContainer
                    config={{
                      revenue: {
                        label: "Revenue",
                        color: "hsl(var(--chart-1))",
                      },
                    }}
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsLineChart data={salesData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey={period === "monthly" ? "month" : period === "weekly" ? "day" : "year"} />
                        <YAxis />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Line type="monotone" dataKey="revenue" stroke="var(--color-revenue)" strokeWidth={2} />
                      </RechartsLineChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Orders</CardTitle>
                <CardDescription>Monthly orders</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.orders.total}</div>
                <p className="text-xs text-muted-foreground">
                  {Number.parseFloat(stats.orders.change) >= 0 ? "+" : ""}
                  {stats.orders.change}% from last month
                </p>
                <div className="mt-4 h-[120px]">
                  <ChartContainer
                    config={{
                      orders: {
                        label: "Orders",
                        color: "hsl(var(--chart-2))",
                      },
                    }}
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsBarChart data={salesData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey={period === "monthly" ? "month" : period === "weekly" ? "day" : "year"} />
                        <YAxis />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="orders" fill="var(--color-orders)" radius={[4, 4, 0, 0]} />
                      </RechartsBarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Average Order Value</CardTitle>
                <CardDescription>Monthly average</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  $
                  {statsData.length > 0
                    ? (
                        statsData.reduce((acc, item) => acc + item.revenue, 0) /
                        statsData.reduce((acc, item) => acc + item.orders, 0)
                      ).toFixed(2)
                    : "0.00"}
                </div>
                <p className="text-xs text-muted-foreground">Based on recent orders</p>
                <div className="mt-4 h-[120px]">
                  <ChartContainer
                    config={{
                      aov: {
                        label: "Average Order Value",
                        color: "hsl(var(--chart-3))",
                      },
                    }}
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsLineChart
                        data={salesData.map((item) => ({
                          ...item,
                          aov: item.orders > 0 ? (item.revenue / item.orders).toFixed(2) : 0,
                        }))}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey={period === "monthly" ? "month" : period === "weekly" ? "day" : "year"} />
                        <YAxis />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Line type="monotone" dataKey="aov" stroke="var(--color-aov)" strokeWidth={2} />
                      </RechartsLineChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Revenue Overview</CardTitle>
              <CardDescription>Revenue vs Orders over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <Tabs defaultValue={period} onValueChange={setPeriod} className="mb-4">
                  <TabsList>
                    <TabsTrigger value="weekly">Weekly</TabsTrigger>
                    <TabsTrigger value="monthly">Monthly</TabsTrigger>
                    <TabsTrigger value="yearly">Yearly</TabsTrigger>
                  </TabsList>
                </Tabs>
                <ChartContainer
                  config={{
                    revenue: {
                      label: "Revenue",
                      color: "hsl(var(--chart-1))",
                    },
                    orders: {
                      label: "Orders",
                      color: "hsl(var(--chart-2))",
                    },
                  }}
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsLineChart data={salesData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey={period === "monthly" ? "month" : period === "weekly" ? "day" : "year"} />
                      <YAxis yAxisId="left" orientation="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="revenue"
                        stroke="var(--color-revenue)"
                        strokeWidth={2}
                      />
                      <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="orders"
                        stroke="var(--color-orders)"
                        strokeWidth={2}
                      />
                    </RechartsLineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Top Selling Categories</CardTitle>
                <CardDescription>Sales by product category</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[200px]">
                  <ChartContainer
                    config={{
                      sales: {
                        label: "Sales",
                        color: "hsl(var(--chart-1))",
                      },
                    }}
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsBarChart data={categoryData.slice(0, 5)} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis dataKey="name" type="category" width={80} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="sales" fill="var(--color-sales)" radius={[0, 4, 4, 0]} />
                      </RechartsBarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Inventory Levels</CardTitle>
                <CardDescription>Current inventory by category</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[200px]">
                  <ChartContainer
                    config={{
                      inventory: {
                        label: "Inventory",
                        color: "hsl(var(--chart-2))",
                      },
                    }}
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsBarChart data={categoryData.slice(0, 5)} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis dataKey="name" type="category" width={80} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="inventory" fill="var(--color-inventory)" radius={[0, 4, 4, 0]} />
                      </RechartsBarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Product Performance</CardTitle>
                <CardDescription>Sales vs. Inventory</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[200px]">
                  <ChartContainer
                    config={{
                      sales: {
                        label: "Sales",
                        color: "hsl(var(--chart-1))",
                      },
                      inventory: {
                        label: "Inventory",
                        color: "hsl(var(--chart-2))",
                      },
                    }}
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsBarChart data={productData.sort((a, b) => b.sales - a.sales).slice(0, 5)}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="sales" fill="var(--color-sales)" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="inventory" fill="var(--color-inventory)" radius={[4, 4, 0, 0]} />
                      </RechartsBarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="customers" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Customer Growth</CardTitle>
                <CardDescription>New vs. Returning Customers</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 rounded-full bg-primary"></div>
                        <div>Total Customers</div>
                      </div>
                      <div className="font-bold">{stats.customers.total}</div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 rounded-full bg-green-500"></div>
                        <div>New This Month</div>
                      </div>
                      <div className="font-bold">{stats.customers.new}</div>
                    </div>
                  </div>
                  {/* This would be a customer growth chart if we had the historical data */}
                  <div className="flex items-center justify-center h-52 bg-muted/20 rounded-md border border-dashed text-muted-foreground">
                    Customer growth chart would be displayed here
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Customer Acquisition</CardTitle>
                <CardDescription>Customer statistics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] grid gap-4">
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 border rounded-lg">
                        <div className="text-sm text-muted-foreground">Active Customers</div>
                        <div className="text-2xl font-bold">{stats.customers.total}</div>
                      </div>
                      <div className="p-4 border rounded-lg">
                        <div className="text-sm text-muted-foreground">Average Order Value</div>
                        <div className="text-2xl font-bold">
                          ${stats.orders.total > 0 ? (stats.revenue.total / stats.orders.total).toFixed(2) : "0.00"}
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 border rounded-lg">
                        <div className="text-sm text-muted-foreground">Customer Retention</div>
                        <div className="text-2xl font-bold">68%</div>
                      </div>
                      <div className="p-4 border rounded-lg">
                        <div className="text-sm text-muted-foreground">New Customers</div>
                        <div className="text-2xl font-bold">{stats.customers.new}</div>
                      </div>
                    </div>
                  </div>
                  <div className="relative h-32 mt-auto">
                    <div className="absolute inset-0 flex items-end">
                      <div className="w-full bg-primary/10 rounded-md h-12"></div>
                      <div className="w-full bg-primary/20 rounded-md h-16"></div>
                      <div className="w-full bg-primary/30 rounded-md h-20"></div>
                      <div className="w-full bg-primary/40 rounded-md h-28"></div>
                      <div className="w-full bg-primary/50 rounded-md h-24"></div>
                      <div className="w-full bg-primary/60 rounded-md h-20"></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
