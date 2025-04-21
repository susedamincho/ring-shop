import {
  collection,
  getDocs,
  doc,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  limit,
  orderBy,
} from "firebase/firestore"
import { db } from "./config"

// Interface for product filtering options
interface ProductFilterOptions {
  search?: string | null
  categoryId?: string | null
  brandId?: string | null
  minPrice?: number | null
  maxPrice?: number | null
  condition?: string[] | null
  storage?: string[] | null
  carrier?: string[] | null
  color?: string[] | null
  sortBy?: string
  sortDirection?: "asc" | "desc"
  limit?: number
  featured?: boolean
}

export interface Product {
  id: string
  name: string
  description: string
  price: number
  inventory?: number
  brand?: string
  model?: string
  storage?: string
  condition?: string
  carrier?: string
  color?: string
  imeiNumber?: string
  batteryHealth?: string
  accessories?: string[]
  categoryIds?: string[]
  image?: string
  additionalImages?: string[]
  rating?: number
  createdAt?: Date
  featured?: boolean
  features?: string[]
  discount?: number
}

// Get products with filtering
export async function getProducts(options: ProductFilterOptions = {}): Promise<Product[]> {
  try {
    const {
      search = null,
      categoryId = null,
      brandId = null,
      minPrice = null,
      maxPrice = null,
      condition = null,
      storage = null,
      carrier = null,
      color = null,
      sortBy = "createdAt",
      sortDirection = "desc",
      limit: queryLimit = 100,
      featured = null,
    } = options

    // Start building the query
    const productsQuery = collection(db, "products")
    const constraints = []

    // Add sorting
    constraints.push(orderBy(sortBy, sortDirection))

    // Add limit
    constraints.push(limit(queryLimit))

    // Apply server-side filters where possible
    if (brandId) {
      constraints.unshift(where("brandId", "==", brandId))
    }

    // Add featured filter if specified
    if (featured !== null) {
      constraints.unshift(where("featured", "==", featured))
    }

    // Apply the constraints to the query
    // Always use query() to ensure consistent types
    const finalQuery = constraints.length > 0 ? query(productsQuery, ...constraints) : query(productsQuery)

    // Execute the query
    const productsSnapshot = await getDocs(finalQuery)

    // Get all products
    let products = productsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Product[]

    // Apply client-side filtering for more complex filters
    if (search) {
      const searchLower = search.toLowerCase()
      products = products.filter(
        (product) =>
          product.name?.toLowerCase().includes(searchLower) ||
          product.description?.toLowerCase().includes(searchLower) ||
          product.model?.toLowerCase().includes(searchLower) ||
          product.brand?.toLowerCase().includes(searchLower),
      )
    }

    if (categoryId) {
      products = products.filter((product) => product.categoryIds && product.categoryIds.includes(categoryId))
    }

    if (minPrice !== null) {
      products = products.filter((product) => product.price >= minPrice)
    }

    if (maxPrice !== null) {
      products = products.filter((product) => product.price <= maxPrice)
    }

    if (condition && condition.length > 0) {
      products = products.filter((product) => product.condition && condition.includes(product.condition))
    }

    if (storage && storage.length > 0) {
      products = products.filter((product) => product.storage && storage.includes(product.storage))
    }

    if (carrier && carrier.length > 0) {
      products = products.filter((product) => product.carrier && carrier.includes(product.carrier))
    }

    if (color && color.length > 0) {
      products = products.filter((product) => product.color && color.includes(product.color))
    }

    return products
  } catch (error) {
    console.error("Error getting products:", error)
    throw error
  }
}

// Get products by category
export async function getProductsByCategory(categoryId: string) {
  try {
    return getProducts({ categoryId })
  } catch (error) {
    console.error("Error getting products by category:", error)
    throw error
  }
}

// Get a single product by ID
export async function getProductById(id: string): Promise<Product | null> {
  try {
    const productDoc = doc(db, "products", id)
    const productSnapshot = await getDoc(productDoc)

    if (productSnapshot.exists()) {
      const data = productSnapshot.data()
      return {
        id: productSnapshot.id,
        name: data.name || "",
        description: data.description || "",
        price: data.price || 0,
        brand: data.brand,
        model: data.model,
        storage: data.storage,
        condition: data.condition,
        carrier: data.carrier,
        color: data.color,
        imeiNumber: data.imeiNumber,
        batteryHealth: data.batteryHealth,
        accessories: data.accessories,
        categoryIds: data.categoryIds,
        image: data.image,
        additionalImages: data.additionalImages,
        rating: data.rating,
        createdAt: data.createdAt instanceof Date ? data.createdAt : new Date(data.createdAt?.toDate?.() || Date.now()),
        featured: data.featured,
        features: data.features,
        discount: data.discount,
      }
    } else {
      return null
    }
  } catch (error) {
    console.error("Error getting product:", error)
    throw error
  }
}

// Add a new product
export async function addProduct(productData: Omit<Partial<Product>, "id">, imageUrl: string | null = null) {
  try {
    // Add product to Firestore
    const productToAdd = {
      ...productData,
      ...(imageUrl && { image: imageUrl }),
      createdAt: new Date(),
    }

    const docRef = await addDoc(collection(db, "products"), productToAdd)
    return {
      ...productToAdd,
      id: docRef.id,
    }
  } catch (error) {
    console.error("Error adding product:", error)
    throw error
  }
}

// Update a product
export async function updateProduct(
  id: string,
  productData: Omit<Partial<Product>, "id">,
  imageUrl: string | null = null,
) {
  try {
    // Get the existing product first
    const existingProduct = await getProductById(id)
    if (!existingProduct) {
      throw new Error(`Product with ID ${id} not found`)
    }

    // Update product in Firestore
    const productToUpdate = {
      ...productData,
      ...(imageUrl ? { image: imageUrl } : {}), // Only update image if a new URL is provided
      updatedAt: new Date(),
    }

    const productRef = doc(db, "products", id)
    await updateDoc(productRef, productToUpdate)

    return {
      ...productToUpdate,
      id,
    }
  } catch (error) {
    console.error("Error updating product:", error)
    throw error
  }
}

// Delete a product
export async function deleteProduct(id: string) {
  try {
    const productRef = doc(db, "products", id)
    await deleteDoc(productRef)
    return true
  } catch (error) {
    console.error("Error deleting product:", error)
    throw error
  }
}

export async function getFeaturedProducts(count = 4) {
  try {
    const productsCollection = collection(db, "products")
    const q = query(productsCollection, where("featured", "==", true), limit(count))
    const productsSnapshot = await getDocs(q)

    const products = productsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))

    return products
  } catch (error) {
    console.error("Error getting featured products:", error)
    return []
  }
}

// Get related products
export async function getRelatedProducts(categoryId: string, currentProductId: string, count = 4) {
  try {
    const productsCollection = collection(db, "products")
    const q = query(
      productsCollection,
      where("categoryIds", "array-contains", categoryId),
      where("__name__", "!=", currentProductId),
      limit(count),
    )

    const productsSnapshot = await getDocs(q)

    const products = productsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))

    return products
  } catch (error) {
    console.error("Error getting related products:", error)
    return []
  }
}
