import { collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc, query, where } from "firebase/firestore"
import { db } from "./config"

// Get all payment methods for a user
export async function getPaymentMethods(userId) {
  try {
    const paymentMethodsCollection = collection(db, "users", userId, "paymentMethods")
    const paymentMethodsSnapshot = await getDocs(paymentMethodsCollection)

    const paymentMethods = paymentMethodsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))

    return paymentMethods
  } catch (error) {
    console.error("Error getting payment methods:", error)
    throw error
  }
}

// Get a single payment method
export async function getPaymentMethod(userId, paymentMethodId) {
  try {
    const paymentMethodDoc = doc(db, "users", userId, "paymentMethods", paymentMethodId)
    const paymentMethodSnapshot = await getDoc(paymentMethodDoc)

    if (paymentMethodSnapshot.exists()) {
      return {
        id: paymentMethodSnapshot.id,
        ...paymentMethodSnapshot.data(),
      }
    } else {
      return null
    }
  } catch (error) {
    console.error("Error getting payment method:", error)
    throw error
  }
}

// Add a new payment method
export async function addPaymentMethod(userId, paymentMethodData) {
  try {
    // Mask the card number except for the last 4 digits
    const lastFour = paymentMethodData.cardNumber.slice(-4)
    const maskedCardNumber = `**** **** **** ${lastFour}`

    const paymentMethodToAdd = {
      ...paymentMethodData,
      cardNumber: maskedCardNumber,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    // If this is the first payment method or isDefault is true, make it the default
    if (paymentMethodData.isDefault) {
      // First, remove default status from all other cards
      const existingMethods = await getPaymentMethods(userId)
      for (const method of existingMethods) {
        if (method.isDefault) {
          await updateDoc(doc(db, "users", userId, "paymentMethods", method.id), {
            isDefault: false,
            updatedAt: new Date(),
          })
        }
      }
    } else if ((await getPaymentMethods(userId)).length === 0) {
      // If this is the first card, make it default regardless
      paymentMethodToAdd.isDefault = true
    }

    const paymentMethodsCollection = collection(db, "users", userId, "paymentMethods")
    const docRef = await addDoc(paymentMethodsCollection, paymentMethodToAdd)

    return {
      id: docRef.id,
      ...paymentMethodToAdd,
    }
  } catch (error) {
    console.error("Error adding payment method:", error)
    throw error
  }
}

// Update a payment method
export async function updatePaymentMethod(userId, paymentMethodId, paymentMethodData) {
  try {
    const paymentMethodRef = doc(db, "users", userId, "paymentMethods", paymentMethodId)

    const updateData = {
      ...paymentMethodData,
      updatedAt: new Date(),
    }

    // If setting this card as default, remove default from other cards
    if (paymentMethodData.isDefault) {
      const existingMethods = await getPaymentMethods(userId)
      for (const method of existingMethods) {
        if (method.id !== paymentMethodId && method.isDefault) {
          await updateDoc(doc(db, "users", userId, "paymentMethods", method.id), {
            isDefault: false,
            updatedAt: new Date(),
          })
        }
      }
    }

    await updateDoc(paymentMethodRef, updateData)

    return {
      id: paymentMethodId,
      ...updateData,
    }
  } catch (error) {
    console.error("Error updating payment method:", error)
    throw error
  }
}

// Delete a payment method
export async function deletePaymentMethod(userId, paymentMethodId) {
  try {
    const paymentMethodRef = doc(db, "users", userId, "paymentMethods", paymentMethodId)

    // Check if this is the default card
    const paymentMethodSnapshot = await getDoc(paymentMethodRef)
    const isDefault = paymentMethodSnapshot.data()?.isDefault

    await deleteDoc(paymentMethodRef)

    // If this was the default card, make another card the default if available
    if (isDefault) {
      const remainingMethods = await getPaymentMethods(userId)
      if (remainingMethods.length > 0) {
        await updateDoc(doc(db, "users", userId, "paymentMethods", remainingMethods[0].id), {
          isDefault: true,
          updatedAt: new Date(),
        })
      }
    }

    return { success: true }
  } catch (error) {
    console.error("Error deleting payment method:", error)
    throw error
  }
}

// Get default payment method
export async function getDefaultPaymentMethod(userId) {
  try {
    const paymentMethodsCollection = collection(db, "users", userId, "paymentMethods")
    const q = query(paymentMethodsCollection, where("isDefault", "==", true))
    const querySnapshot = await getDocs(q)

    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0]
      return {
        id: doc.id,
        ...doc.data(),
      }
    }

    // If no default is set, return the first payment method if available
    const allMethods = await getPaymentMethods(userId)
    return allMethods.length > 0 ? allMethods[0] : null
  } catch (error) {
    console.error("Error getting default payment method:", error)
    throw error
  }
}
