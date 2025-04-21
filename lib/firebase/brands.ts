import {
  collection,
  getDocs,
  doc,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  where,
} from "firebase/firestore"
import { db } from "./config"

export interface Brand {
  id: string
  name: string
  slug: string
  description?: string
  logo?: string
  createdAt?: any
  updatedAt?: any
}

// Get all brands
export async function getBrands(): Promise<Brand[]> {
  try {
    const brandsCollection = collection(db, "brands")
    const q = query(brandsCollection, orderBy("name"))
    const brandsSnapshot = await getDocs(q)
    const brands = brandsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Brand[]

    return brands
  } catch (error) {
    console.error("Error getting brands:", error)
    // Return empty array instead of throwing error
    return []
  }
}

// Get a single brand by ID
export async function getBrandById(id: string): Promise<Brand | null> {
  try {
    const brandDoc = doc(db, "brands", id)
    const brandSnapshot = await getDoc(brandDoc)

    if (brandSnapshot.exists()) {
      return {
        id: brandSnapshot.id,
        ...brandSnapshot.data(),
      } as Brand
    } else {
      return null
    }
  } catch (error) {
    console.error("Error getting brand:", error)
    return null
  }
}

// Add a new brand
export async function addBrand(brandData: Omit<Brand, "id" | "createdAt" | "updatedAt">): Promise<Brand> {
  try {
    const brandToAdd = {
      ...brandData,
      createdAt: new Date(),
    }

    const docRef = await addDoc(collection(db, "brands"), brandToAdd)
    return {
      id: docRef.id,
      ...brandToAdd,
    } as Brand
  } catch (error) {
    console.error("Error adding brand:", error)
    throw error
  }
}

// Update a brand
export async function updateBrand(id: string, brandData: Partial<Brand>): Promise<Brand> {
  try {
    const brandToUpdate = {
      ...brandData,
      updatedAt: new Date(),
    }

    const brandRef = doc(db, "brands", id)
    await updateDoc(brandRef, brandToUpdate)
    return {
      id,
      ...brandToUpdate,
    } as Brand
  } catch (error) {
    console.error("Error updating brand:", error)
    throw error
  }
}

// Delete a brand
export async function deleteBrand(id: string): Promise<boolean> {
  try {
    const brandRef = doc(db, "brands", id)
    await deleteDoc(brandRef)
    return true
  } catch (error) {
    console.error("Error deleting brand:", error)
    throw error
  }
}

// Get products by brand
export async function getProductsByBrand(brandName: string) {
  try {
    const productsCollection = collection(db, "products")
    const q = query(productsCollection, where("brand", "==", brandName))
    const productsSnapshot = await getDocs(q)

    const products = productsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))

    return products
  } catch (error) {
    console.error("Error getting products by brand:", error)
    return []
  }
}
