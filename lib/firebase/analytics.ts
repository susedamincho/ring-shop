import { collection, getDocs } from "firebase/firestore"
import { db } from "./config"

// Get sales data for charts
export async function getSalesData(period = "monthly") {
  try {
    const ordersCollection = collection(db, "orders")
    const ordersSnapshot = await getDocs(ordersCollection)

    // Calculate date range based on period
    const now = new Date()
    const startDate = new Date()

    if (period === "weekly") {
      startDate.setDate(now.getDate() - 7)
    } else if (period === "monthly") {
      startDate.setMonth(now.getMonth() - 12) // Get last 12 months
    } else if (period === "yearly") {
      startDate.setFullYear(now.getFullYear() - 5) // Get last 5 years
    }

    // Process orders
    const orders = ordersSnapshot.docs
      .map((doc) => {
        const data = doc.data()
        return {
          id: doc.id,
          createdAt: data.createdAt?.toDate() || new Date(),
          total: Number.parseFloat(data.total) || 0,
          status: data.status,
        }
      })
      .filter((order) => order.createdAt >= startDate)

    // Group by time period
    if (period === "weekly") {
      // Group by day of week
      const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
      const dailyData = new Array(7).fill(0).map((_, index) => ({
        day: dayNames[index],
        revenue: 0,
        orders: 0,
      }))

      orders.forEach((order) => {
        const dayIndex = order.createdAt.getDay()
        dailyData[dayIndex].revenue += order.total
        dailyData[dayIndex].orders += 1
      })

      return dailyData
    } else if (period === "monthly") {
      // Group by month
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
      const monthlyData = new Array(12).fill(0).map((_, index) => ({
        month: monthNames[index],
        revenue: 0,
        orders: 0,
      }))

      orders.forEach((order) => {
        const monthIndex = order.createdAt.getMonth()
        monthlyData[monthIndex].revenue += order.total
        monthlyData[monthIndex].orders += 1
      })

      return monthlyData
    } else {
      // Group by year
      const yearlyData = {}

      orders.forEach((order) => {
        const year = order.createdAt.getFullYear()
        if (!yearlyData[year]) {
          yearlyData[year] = { year, revenue: 0, orders: 0 }
        }
        yearlyData[year].revenue += order.total
        yearlyData[year].orders += 1
      })

      return Object.values(yearlyData).sort((a, b) => a.year - b.year)
    }
  } catch (error) {
    console.error("Error getting sales data:", error)
    return []
  }
}

// Get product performance data for admin
export async function getProductPerformance() {
  try {
    const productsCollection = collection(db, "products")
    const productsSnapshot = await getDocs(productsCollection)

    const ordersCollection = collection(db, "orders")
    const ordersSnapshot = await getDocs(ordersCollection)

    // Calculate sales per product
    const productSales = {}

    ordersSnapshot.docs.forEach((doc) => {
      const orderData = doc.data()
      if (orderData.items && Array.isArray(orderData.items)) {
        orderData.items.forEach((item) => {
          if (!productSales[item.id]) {
            productSales[item.id] = {
              productId: item.id,
              name: item.name,
              sales: 0,
              quantity: 0,
            }
          }
          productSales[item.id].sales += item.price * item.quantity
          productSales[item.id].quantity += item.quantity
        })
      }
    })

    // Add inventory data
    productsSnapshot.docs.forEach((doc) => {
      const productData = doc.data()
      const productId = doc.id

      if (productSales[productId]) {
        productSales[productId].inventory = productData.inventory || 0
        productSales[productId].category = productData.category || "Uncategorized"
      } else {
        productSales[productId] = {
          productId,
          name: productData.name,
          sales: 0,
          quantity: 0,
          inventory: productData.inventory || 0,
          category: productData.category || "Uncategorized",
        }
      }
    })

    return Object.values(productSales)
  } catch (error) {
    console.error("Error getting product performance:", error)
    return []
  }
}

// Get category performance data
export async function getCategoryPerformance() {
  try {
    const productsCollection = collection(db, "products")
    const productsSnapshot = await getDocs(productsCollection)

    const categoriesCollection = collection(db, "categories")
    const categoriesSnapshot = await getDocs(categoriesCollection)

    // Create category mapping
    const categoryMap = {}
    categoriesSnapshot.docs.forEach((doc) => {
      categoryMap[doc.id] = {
        id: doc.id,
        name: doc.data().name,
        sales: 0,
        inventory: 0,
      }
    })

    // Process products
    productsSnapshot.docs.forEach((doc) => {
      const productData = doc.data()
      if (productData.categoryIds && Array.isArray(productData.categoryIds)) {
        productData.categoryIds.forEach((categoryId) => {
          if (categoryMap[categoryId]) {
            categoryMap[categoryId].inventory += productData.inventory || 0
          }
        })
      }
    })

    // Get orders to calculate sales
    const ordersCollection = collection(db, "orders")
    const ordersSnapshot = await getDocs(ordersCollection)

    ordersSnapshot.docs.forEach((doc) => {
      const orderData = doc.data()
      if (orderData.items && Array.isArray(orderData.items)) {
        orderData.items.forEach((item) => {
          // For simplicity, we'll assign sales evenly across categories
          // In a real app, you'd need to fetch the product to get its categories
          const product = productsSnapshot.docs.find((doc) => doc.id === item.id)
          if (product) {
            const productData = product.data()
            if (productData.categoryIds && Array.isArray(productData.categoryIds)) {
              productData.categoryIds.forEach((categoryId) => {
                if (categoryMap[categoryId]) {
                  categoryMap[categoryId].sales += (item.price * item.quantity) / productData.categoryIds.length
                }
              })
            }
          }
        })
      }
    })

    return Object.values(categoryMap)
  } catch (error) {
    console.error("Error getting category performance:", error)
    return []
  }
}

// Get dashboard stats
export async function getDashboardStats() {
  try {
    // Get orders data
    const ordersCollection = collection(db, "orders")
    const ordersSnapshot = await getDocs(ordersCollection)

    let totalRevenue = 0
    const orderCount = ordersSnapshot.size

    const now = new Date()
    const lastMonth = new Date()
    lastMonth.setMonth(now.getMonth() - 1)

    let lastMonthRevenue = 0
    let lastMonthOrders = 0

    ordersSnapshot.docs.forEach((doc) => {
      const orderData = doc.data()
      const orderDate = orderData.createdAt?.toDate()
      const orderTotal = Number.parseFloat(orderData.total) || 0

      totalRevenue += orderTotal

      if (orderDate && orderDate >= lastMonth) {
        lastMonthRevenue += orderTotal
        lastMonthOrders++
      }
    })

    // Calculate revenue change percentage
    const prevMonth = new Date(lastMonth)
    prevMonth.setMonth(lastMonth.getMonth() - 1)

    let prevMonthRevenue = 0
    let prevMonthOrders = 0

    ordersSnapshot.docs.forEach((doc) => {
      const orderData = doc.data()
      const orderDate = orderData.createdAt?.toDate()

      if (orderDate && orderDate >= prevMonth && orderDate < lastMonth) {
        prevMonthRevenue += Number.parseFloat(orderData.total) || 0
        prevMonthOrders++
      }
    })

    const revenueChange = prevMonthRevenue > 0 ? ((lastMonthRevenue - prevMonthRevenue) / prevMonthRevenue) * 100 : 100

    const orderChange = prevMonthOrders > 0 ? ((lastMonthOrders - prevMonthOrders) / prevMonthOrders) * 100 : 100

    // Get products count
    const productsCollection = collection(db, "products")
    const productsSnapshot = await getDocs(productsCollection)
    const productCount = productsSnapshot.size

    // Get new product count
    let newProductCount = 0
    productsSnapshot.docs.forEach((doc) => {
      const productData = doc.data()
      const createdAt = productData.createdAt?.toDate()

      if (createdAt && createdAt >= lastMonth) {
        newProductCount++
      }
    })

    // Get customer count
    const usersCollection = collection(db, "users")
    const usersSnapshot = await getDocs(usersCollection)
    const customerCount = usersSnapshot.size

    // Get new customer count
    let newCustomerCount = 0
    usersSnapshot.docs.forEach((doc) => {
      const userData = doc.data()
      const createdAt = userData.createdAt?.toDate()

      if (createdAt && createdAt >= lastMonth) {
        newCustomerCount++
      }
    })

    return {
      revenue: {
        total: totalRevenue.toFixed(2),
        change: revenueChange.toFixed(1),
      },
      orders: {
        total: orderCount,
        change: orderChange.toFixed(1),
      },
      products: {
        total: productCount,
        new: newProductCount,
      },
      customers: {
        total: customerCount,
        new: newCustomerCount,
      },
    }
  } catch (error) {
    console.error("Error getting dashboard stats:", error)
    return {
      revenue: { total: 0, change: 0 },
      orders: { total: 0, change: 0 },
      products: { total: 0, new: 0 },
      customers: { total: 0, new: 0 },
    }
  }
}
