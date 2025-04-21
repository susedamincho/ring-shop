import { collection, getDocs, doc, getDoc, addDoc, updateDoc, deleteDoc, query, orderBy } from "firebase/firestore"
import { db } from "./config"

// Generic interface for attribute items
export interface AttributeItem {
  id: string
  name: string
  slug?: string
  createdAt?: any
  updatedAt?: any
}

// Function to get all items from a specific attribute collection
export async function getAttributeItems(attributeType: string): Promise<AttributeItem[]> {
  try {
    const itemsCollection = collection(db, attributeType)
    const q = query(itemsCollection, orderBy("name"))
    const itemsSnapshot = await getDocs(q)
    const items = itemsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as AttributeItem[]

    return items
  } catch (error) {
    console.error(`Error getting ${attributeType}:`, error)
    return []
  }
}

// Function to get a single attribute item by ID
export async function getAttributeItemById(attributeType: string, id: string): Promise<AttributeItem | null> {
  try {
    const itemDoc = doc(db, attributeType, id)
    const itemSnapshot = await getDoc(itemDoc)

    if (itemSnapshot.exists()) {
      return {
        id: itemSnapshot.id,
        ...itemSnapshot.data(),
      } as AttributeItem
    } else {
      return null
    }
  } catch (error) {
    console.error(`Error getting ${attributeType} item:`, error)
    return null
  }
}

// Function to add a new attribute item
export async function addAttributeItem(
  attributeType: string,
  itemData: Omit<AttributeItem, "id" | "createdAt" | "updatedAt">,
): Promise<AttributeItem> {
  try {
    const itemToAdd = {
      ...itemData,
      createdAt: new Date(),
    }

    const docRef = await addDoc(collection(db, attributeType), itemToAdd)
    return {
      id: docRef.id,
      ...itemToAdd,
    } as AttributeItem
  } catch (error) {
    console.error(`Error adding ${attributeType} item:`, error)
    throw error
  }
}

// Function to update an attribute item
export async function updateAttributeItem(
  attributeType: string,
  id: string,
  itemData: Partial<AttributeItem>,
): Promise<AttributeItem> {
  try {
    const itemToUpdate = {
      ...itemData,
      updatedAt: new Date(),
    }

    const itemRef = doc(db, attributeType, id)
    await updateDoc(itemRef, itemToUpdate)

    return {
      id,
      ...itemToUpdate,
    } as AttributeItem
  } catch (error) {
    console.error(`Error updating ${attributeType} item:`, error)
    throw error
  }
}

// Function to delete an attribute item
export async function deleteAttributeItem(attributeType: string, id: string): Promise<boolean> {
  try {
    const itemRef = doc(db, attributeType, id)
    await deleteDoc(itemRef)
    return true
  } catch (error) {
    console.error(`Error deleting ${attributeType} item:`, error)
    throw error
  }
}

// Helper function to initialize attribute items if they don't exist
export async function initializeAttributeItems(
  attributeType: string,
  defaultItems: { name: string; slug?: string }[],
): Promise<AttributeItem[]> {
  try {
    const existingItems = await getAttributeItems(attributeType)

    // If items already exist, return them
    if (existingItems.length > 0) {
      return existingItems
    }

    // Otherwise, create the default items
    const createdItems: AttributeItem[] = []

    for (const item of defaultItems) {
      const itemToAdd = {
        ...item,
        createdAt: new Date(),
      }

      const docRef = await addDoc(collection(db, attributeType), itemToAdd)
      createdItems.push({
        id: docRef.id,
        ...itemToAdd,
      })
    }

    return createdItems
  } catch (error) {
    console.error(`Error initializing ${attributeType} items:`, error)
    return []
  }
}

// Specific functions for each attribute type - now just return the existing items without auto-initialization
export async function getConditions(): Promise<AttributeItem[]> {
  return getAttributeItems("conditions")
}

export async function getStorageOptions(): Promise<AttributeItem[]> {
  return getAttributeItems("storageOptions")
}

export async function getCarriers(): Promise<AttributeItem[]> {
  return getAttributeItems("carriers")
}

export async function getColors(): Promise<AttributeItem[]> {
  return getAttributeItems("colors")
}
