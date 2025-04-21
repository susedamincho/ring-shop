import { collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc, query, where } from "firebase/firestore"
import { db } from "./config"

// Get all addresses for a user
export async function getUserAddresses(userId) {
  try {
    const addressesCollection = collection(db, "addresses")
    const q = query(addressesCollection, where("userId", "==", userId))
    const addressesSnapshot = await getDocs(q)

    const addresses = addressesSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))

    return addresses
  } catch (error) {
    console.error("Error getting addresses:", error)
    return []
  }
}

// Get a single address by ID
export async function getAddressById(id) {
  try {
    const addressDoc = doc(db, "addresses", id)
    const addressSnapshot = await getDoc(addressDoc)

    if (addressSnapshot.exists()) {
      return {
        id: addressSnapshot.id,
        ...addressSnapshot.data(),
      }
    } else {
      return null
    }
  } catch (error) {
    console.error("Error getting address:", error)
    throw error
  }
}

// Add a new address
export async function addAddress(addressData) {
  try {
    // If this is set as default, unset any other default addresses
    if (addressData.isDefault) {
      await unsetDefaultAddresses(addressData.userId)
    }

    const addressToAdd = {
      ...addressData,
      createdAt: new Date(),
    }

    const docRef = await addDoc(collection(db, "addresses"), addressToAdd)
    return {
      id: docRef.id,
      ...addressToAdd,
    }
  } catch (error) {
    console.error("Error adding address:", error)
    throw error
  }
}

// Update an address
export async function updateAddress(id, addressData) {
  try {
    // If this is set as default, unset any other default addresses
    if (addressData.isDefault) {
      await unsetDefaultAddresses(addressData.userId)
    }

    const addressRef = doc(db, "addresses", id)
    await updateDoc(addressRef, {
      ...addressData,
      updatedAt: new Date(),
    })

    return {
      id,
      ...addressData,
      updatedAt: new Date(),
    }
  } catch (error) {
    console.error("Error updating address:", error)
    throw error
  }
}

// Delete an address
export async function deleteAddress(id) {
  try {
    await deleteDoc(doc(db, "addresses", id))
    return true
  } catch (error) {
    console.error("Error deleting address:", error)
    throw error
  }
}

// Get default address for a user
export async function getDefaultAddress(userId) {
  try {
    const addressesCollection = collection(db, "addresses")
    const q = query(addressesCollection, where("userId", "==", userId), where("isDefault", "==", true))
    const addressesSnapshot = await getDocs(q)

    if (!addressesSnapshot.empty) {
      const doc = addressesSnapshot.docs[0]
      return {
        id: doc.id,
        ...doc.data(),
      }
    }

    return null
  } catch (error) {
    console.error("Error getting default address:", error)
    return null
  }
}

// Unset default for all addresses of a user
async function unsetDefaultAddresses(userId) {
  try {
    const addressesCollection = collection(db, "addresses")
    const q = query(addressesCollection, where("userId", "==", userId), where("isDefault", "==", true))
    const addressesSnapshot = await getDocs(q)

    const updatePromises = addressesSnapshot.docs.map((doc) => updateDoc(doc.ref, { isDefault: false }))

    await Promise.all(updatePromises)
    return true
  } catch (error) {
    console.error("Error unsetting default addresses:", error)
    throw error
  }
}
