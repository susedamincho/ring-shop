import { collection, getDocs, doc, getDoc, addDoc, updateDoc, deleteDoc, query, orderBy } from "firebase/firestore"
import { db } from "./config"

export interface Category {
  id: string
  name: string
  slug: string
  description?: string
  createdAt?: any
  updatedAt?: any
  image?: string
  featured?: boolean
}

// Get all categories
export async function getCategories(): Promise<Category[]> {
  try {
    const categoriesCollection = collection(db, "categories")
    const q = query(categoriesCollection, orderBy("name"))
    const categoriesSnapshot = await getDocs(q)
    const categories = categoriesSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Category[]

    return categories
  } catch (error) {
    console.error("Error getting categories:", error)
    // Return empty array instead of throwing error
    return []
  }
}

// Get a single category by ID
export async function getCategoryById(id: string): Promise<Category | null> {
  try {
    const categoryDoc = doc(db, "categories", id)
    const categorySnapshot = await getDoc(categoryDoc)

    if (categorySnapshot.exists()) {
      return {
        id: categorySnapshot.id,
        ...categorySnapshot.data(),
      } as Category
    } else {
      return null
    }
  } catch (error) {
    console.error("Error getting category:", error)
    return null
  }
}

// Add a new category
export async function addCategory(categoryData: Omit<Category, "id" | "createdAt" | "updatedAt">): Promise<Category> {
  try {
    const categoryToAdd = {
      ...categoryData,
      createdAt: new Date(),
    }

    const docRef = await addDoc(collection(db, "categories"), categoryToAdd)
    return {
      id: docRef.id,
      ...categoryToAdd,
    } as Category
  } catch (error) {
    console.error("Error adding category:", error)
    throw error
  }
}

// Update a category
export async function updateCategory(id: string, categoryData: Partial<Category>): Promise<Category> {
  try {
    const categoryToUpdate = {
      ...categoryData,
      updatedAt: new Date(),
    }

    const categoryRef = doc(db, "categories", id)
    await updateDoc(categoryRef, categoryToUpdate)
    return {
      id,
      ...categoryToUpdate,
    } as Category
  } catch (error) {
    console.error("Error updating category:", error)
    throw error
  }
}

// Delete a category
export async function deleteCategory(id: string): Promise<boolean> {
  try {
    const categoryRef = doc(db, "categories", id)
    await deleteDoc(categoryRef)
    return true
  } catch (error) {
    console.error("Error deleting category:", error)
    throw error
  }
}

// Get products by category ID
export async function getProductsByCategory(categoryId: string) {
  try {
    // First get all products
    const productsCollection = collection(db, "products")
    const productsSnapshot = await getDocs(productsCollection)

    // Filter products that have the category ID in their categories array
    const products = productsSnapshot.docs
      .map((doc) => ({
        id: doc.id,
        ...(doc.data() as { categoryIds?: string[] }),
      }))
      .filter((product) => product.categoryIds && product.categoryIds.includes(categoryId))

    return products
  } catch (error) {
    console.error("Error getting products by category:", error)
    return []
  }
}
