"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import ProductCard from "@/components/product-card"
import { getProducts, Product } from "@/lib/firebase/products"
import { Loader2 } from "lucide-react"

export default function ProductGrid({ categoryId = null }: { categoryId?: string | null }) {
  const searchParams = useSearchParams()
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch products when component mounts or when search params change
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true)

        // Get search term if it exists
        const search = searchParams.get("search")

        // Fetch products from Firebase
        let fetchedProducts = []

        if (categoryId) {
          // If a category ID is provided, fetch products for that category
          fetchedProducts = await getProducts({
            categoryId,
            search: search || null,
          })
        } else {
          // Otherwise, fetch all products
          fetchedProducts = await getProducts({
            search: search || null,
          })
        }

        setProducts(fetchedProducts)
        // Apply filters to the fetched products
        applyFilters(fetchedProducts)
      } catch (error) {
        console.error("Error fetching products:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [categoryId, searchParams])

  // Apply filters whenever search params or products change
  useEffect(() => {
    if (products.length > 0) {
      applyFilters(products)
    }
  }, [searchParams, products])

  const applyFilters = (productsToFilter: Product[]) => {
    // Get filter values from URL params
    const minPrice = searchParams.get("minPrice") ? Number.parseFloat(searchParams.get("minPrice") || "0") : 0
    const maxPrice = searchParams.get("maxPrice")
      ? Number.parseFloat(searchParams.get("maxPrice") || "0")
      : Number.POSITIVE_INFINITY
    const categoryIds = searchParams.get("categories")?.split(",") || []
    const brandIds = searchParams.get("brands")?.split(",") || []
    const colors = searchParams.get("colors")?.split(",") || []
    const sizes = searchParams.get("sizes")?.split(",") || []

    // Apply all filters to the products
    const filtered = productsToFilter.filter((product) => {
      // Price filter
      if (product.price < minPrice || product.price > maxPrice) {
        return false
      }

      // Category filter
      if (
        categoryIds.length > 0 &&
        (!product.categoryIds || !categoryIds.some((id) => (product.categoryIds || []).includes(id)))
      ) {
        return false
      }

      // Brand filter (fixed: use product.brand)
      if (brandIds.length > 0 && (!product.brand || !brandIds.includes(product.brand))) {
        return false
      }

      // Color filter
      if (colors.length > 0 && (!product.color || !colors.includes(product.color))) {
        return false
      }

      return true
    })

    setFilteredProducts(filtered)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (filteredProducts.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium">No products found</h3>
        <p className="text-muted-foreground mt-2">
          {categoryId
            ? "There are no products in this category matching your filters."
            : "There are no products matching your filters."}
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      {filteredProducts.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}
