"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getFeaturedProducts } from "@/lib/firebase/products"
import { Loader2 } from "lucide-react"

export default function FeaturedCollection() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        setLoading(true)
        const featuredProducts = await getFeaturedProducts(4)
        setProducts(featuredProducts)
      } catch (error) {
        console.error("Error fetching featured products:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchFeaturedProducts()
  }, [])

  if (loading) {
    return (
      <section className="w-full py-12 md:py-24 bg-black text-white">
        <div className="container px-4 md:px-6 flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-white" />
        </div>
      </section>
    )
  }

  if (products.length === 0) {
    return null // Don't show if no featured products
  }

  return (
    <section className="w-full py-12 md:py-24 bg-black text-white">
      <div className="container px-4 md:px-6">
        <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
          <div className="flex flex-col justify-center space-y-4">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">URBAN TECH COLLECTION</h2>
              <p className="max-w-[600px] text-gray-300 md:text-xl">
                Innovative streetwear that combines urban style with technical performance. Limited edition pieces that
                push the boundaries of fashion.
              </p>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              <Link href="/products">
                <Button size="lg" className="bg-white text-black hover:bg-gray-200">
                  Shop Collection
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
          <div className="flex justify-center lg:justify-end">
            <div className="grid grid-cols-2 gap-4 md:gap-8">
              {products.slice(0, 4).map((product, index) => (
                <Link
                  key={product.id}
                  href={`/product/${product.id}`}
                  className="relative aspect-square overflow-hidden rounded-xl"
                >
                  <img
                    src={product.image || "/placeholder.svg?height=400&width=400"}
                    alt={product.name}
                    className="object-cover w-full h-full transition-transform hover:scale-105"
                    onError={(e) => {
                      e.currentTarget.src = "/placeholder.svg?height=400&width=400"
                    }}
                  />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
