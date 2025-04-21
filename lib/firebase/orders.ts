import { collection, getDocs, doc, getDoc, addDoc, updateDoc, query, where, orderBy } from "firebase/firestore"
import { db } from "./config"

// Get all orders
export async function getOrders() {
  try {
    const ordersCollection = collection(db, "orders")
    const q = query(ordersCollection, orderBy("createdAt", "desc"))
    const ordersSnapshot = await getDocs(q)
    const orders = ordersSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))
    return orders
  } catch (error) {
    console.error("Error getting orders:", error)
    throw error
  }
}

// Get orders by user ID
export async function getOrdersByUser(userId) {
  try {
    const ordersCollection = collection(db, "orders")
    const q = query(ordersCollection, where("userId", "==", userId), orderBy("createdAt", "desc"))
    const ordersSnapshot = await getDocs(q)
    const orders = ordersSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))
    return orders
  } catch (error) {
    console.error("Error getting user orders:", error)
    throw error
  }
}

// Get a single order by ID
export async function getOrderById(id) {
  try {
    const orderDoc = doc(db, "orders", id)
    const orderSnapshot = await getDoc(orderDoc)

    if (orderSnapshot.exists()) {
      return {
        id: orderSnapshot.id,
        ...orderSnapshot.data(),
      }
    } else {
      return null
    }
  } catch (error) {
    console.error("Error getting order:", error)
    throw error
  }
}

// Create a new order
export async function createOrder(orderData) {
  try {
    const orderToAdd = {
      ...orderData,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const docRef = await addDoc(collection(db, "orders"), orderToAdd)
    return {
      id: docRef.id,
      ...orderToAdd,
    }
  } catch (error) {
    console.error("Error creating order:", error)
    throw error
  }
}

// Update an order's status
export async function updateOrderStatus(id, status) {
  try {
    const orderRef = doc(db, "orders", id)
    await updateDoc(orderRef, {
      status,
      updatedAt: new Date(),
    })

    return {
      id,
      status,
      updatedAt: new Date(),
    }
  } catch (error) {
    console.error("Error updating order status:", error)
    throw error
  }
}
