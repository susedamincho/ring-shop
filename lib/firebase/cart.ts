import { doc, getDoc, setDoc, deleteDoc } from "firebase/firestore"
import { db } from "./config"

// Save cart to user's account
export async function saveCart(userId, cartItems) {
  try {
    await setDoc(doc(db, "carts", userId), {
      userId,
      items: cartItems,
      updatedAt: new Date(),
    })

    return true
  } catch (error) {
    console.error("Error saving cart:", error)
    throw error
  }
}

// Get user's saved cart
export async function getCart(userId) {
  try {
    const cartDoc = await getDoc(doc(db, "carts", userId))

    if (cartDoc.exists()) {
      return cartDoc.data().items || []
    } else {
      return []
    }
  } catch (error) {
    console.error("Error getting cart:", error)
    return []
  }
}

// Clear user's cart
export async function clearCart(userId) {
  try {
    await deleteDoc(doc(db, "carts", userId))
    return true
  } catch (error) {
    console.error("Error clearing cart:", error)
    throw error
  }
}
