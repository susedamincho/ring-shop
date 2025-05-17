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

  // Извличане на продукти при зареждане или промяна в параметрите
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true)

        const search = searchParams.get("search")

        let fetchedProducts = []

        if (categoryId) {
          fetchedProducts = await getProducts({
            categoryId,
            search: search || null,
          })
        } else {
          fetchedProducts = await getProducts({
            search: search || null,
          })
        }

        setProducts(fetchedProducts)
        applyFilters(fetchedProducts)
      } catch (error) {
        console.error("Грешка при зареждане на продуктите:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [categoryId, searchParams])

  // Приложение на филтрите при промени
  useEffect(() => {
    if (products.length > 0) {
      applyFilters(products)
    }
  }, [searchParams, products])

  const applyFilters = (productsToFilter: Product[]) => {
    const minPrice = searchParams.get("minPrice") ? Number.parseFloat(searchParams.get("minPrice") || "0") : 0
    const maxPrice = searchParams.get("maxPrice")
      ? Number.parseFloat(searchParams.get("maxPrice") || "0")
      : Number.POSITIVE_INFINITY
    const categoryIds = searchParams.get("categories")?.split(",") || []
    const brandIds = searchParams.get("brands")?.split(",") || []
    const colors = searchParams.get("colors")?.split(",") || []
    const sizes = searchParams.get("sizes")?.split(",") || []

    const filtered = productsToFilter.filter((product) => {
      if (product.price < minPrice || product.price > maxPrice) {
        return false
      }

      if (
        categoryIds.length > 0 &&
        (!product.categoryIds || !categoryIds.some((id) => (product.categoryIds || []).includes(id)))
      ) {
        return false
      }

      if (brandIds.length > 0 && (!product.brand || !brandIds.includes(product.brand))) {
        return false
      }

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
        <h3 className="text-lg font-medium">Няма открити продукти</h3>
        <p className="text-muted-foreground mt-2">
          {categoryId
            ? "Няма продукти в тази категория, които отговарят на зададените филтри."
            : "Няма продукти, които отговарят на зададените филтри."}
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
