"use client"

import { useState, useEffect } from "react"
import ProductCard from "@/components/product-card"
import { getRelatedProducts } from "@/lib/firebase/products"
import { Loader2 } from "lucide-react"

interface RelatedProductsProps {
  category: string
  currentProductId: string
  categoryId?: string
}

export default function RelatedProducts({ category, currentProductId, categoryId }: RelatedProductsProps) {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRelatedProducts = async () => {
      try {
        setLoading(true)
        if (categoryId) {
          const relatedProducts = await getRelatedProducts(categoryId, currentProductId, 4)
          setProducts(relatedProducts)
        } else {
          setProducts([])
        }
      } catch (error) {
        console.error("Error fetching related products:", error)
        setProducts([])
      } finally {
        setLoading(false)
      }
    }

    fetchRelatedProducts()
  }, [categoryId, currentProductId])

  if (loading) {
    return (
      <section className="mt-16">
        <h2 className="text-2xl font-bold mb-6">You May Also Like</h2>
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </section>
    )
  }

  if (products.length === 0) {
    return null // Don't show the section if no related products
  }

  return (
    <section className="mt-16">
      <h2 className="text-2xl font-bold mb-6">You May Also Like</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  )
}
