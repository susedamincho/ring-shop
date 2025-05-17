"use client"

import type React from "react"
import Link from "next/link"
import { Heart, ShoppingCart, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/lib/utils"
import { useCart } from "@/components/cart-provider"
import { Badge } from "@/components/ui/badge"
import { useState } from "react"

type Product = {
  id: string
  name: string
  price: number
  image?: string
  rating?: number
  brand?: string
  model?: string
  storage?: string
  condition?: string
  carrier?: string
  color?: string
  discount?: number
}

interface ProductCardProps {
  product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart()
  const [isHovered, setIsHovered] = useState(false)
  const [isFavorite, setIsFavorite] = useState(false)

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    addToCart(product, 1)
  }

  const toggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsFavorite(!isFavorite)
  }

  // Generate random rating if not provided
  const rating = product.rating || Math.floor(Math.random() * 5) + 1

  return (
    <div
      className="group relative bg-[#0f172a]/80 backdrop-blur-md rounded-xl overflow-hidden border border-white/10 transition-all duration-300 hover:shadow-lg hover:shadow-[#0d9488]/10 hover:border-[#0d9488]/30"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link href={`/product/${product.id}`} className="absolute inset-0 z-10">
        <span className="sr-only">View Product</span>
      </Link>

      <div className="relative overflow-hidden rounded-t-xl bg-gray-900 aspect-square">
        <img
          src={product.image || "/placeholder.svg"}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          onError={(e) => {
            e.currentTarget.src = "/placeholder.svg"
          }}
        />

        {product.discount && product.discount > 0 && (
          <div className="absolute top-3 left-3 bg-[#0d9488] text-white text-xs font-bold px-2 py-1 rounded-full">
            -{product.discount}% OFF
          </div>
        )}

        <button
          className={`absolute top-3 right-3 z-20 p-2 rounded-full transition-all ${isFavorite ? "bg-pink-500 text-white" : "bg-black/40 backdrop-blur-md text-white hover:bg-black/60"
            }`}
          onClick={toggleFavorite}
        >
          <Heart className={`h-4 w-4 ${isFavorite ? "fill-current" : ""}`} />
        </button>

        <div
          className={`absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 transition-opacity duration-300 ${isHovered ? "opacity-100" : ""}`}
        ></div>
      </div>

      <div className="p-4">
        <div className="mb-1 flex items-center justify-between">
          {product.brand && <span className="text-xs text-[#0d9488] font-medium">{product.brand}</span>}

          <div className="flex items-center">
            <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
            <span className="ml-1 text-xs text-gray-300">{rating}.0</span>
          </div>
        </div>

        <h3 className="text-base font-medium text-white line-clamp-2 min-h-[48px] group-hover:text-[#0d9488] transition-colors">
          {product.name}
        </h3>

        <div className="mt-2 flex flex-wrap gap-1">
          {product.condition && (
            <Badge variant="outline" className="text-xs bg-gray-800/50 text-gray-300 border-gray-700 hover:bg-gray-800">
              {product.condition}
            </Badge>
          )}
          {product.storage && (
            <Badge variant="outline" className="text-xs bg-gray-800/50 text-gray-300 border-gray-700 hover:bg-gray-800">
              {product.storage}
            </Badge>
          )}
          {product.carrier && (
            <Badge variant="outline" className="text-xs bg-gray-800/50 text-gray-300 border-gray-700 hover:bg-gray-800">
              {product.carrier}
            </Badge>
          )}
        </div>

        <div className="mt-3 flex items-center justify-between">
          <div>
            {product.discount && product.discount > 0 ? (
              <>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-[#0d9488]">{formatCurrency(product.price)}</span>
                </div>
                <p className="text-xs text-gray-400 line-through">
                  {formatCurrency(product.price * (1 + product.discount / 100))}
                </p>
              </>
            ) : (
              <span className="font-semibold text-white">{formatCurrency(product.price)}</span>
            )}
          </div>
        </div>
      </div>

      <div
        className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#0f172a] to-transparent p-4 transform transition-transform duration-300 ${isHovered ? "translate-y-0" : "translate-y-full"}`}
      >
        <Button size="sm" className="w-full bg-[#0d9488] hover:bg-[#0d9488]/80 text-white" onClick={handleAddToCart}>
          <ShoppingCart className="mr-2 h-4 w-4" />
          Добави в количката
        </Button>
      </div>
    </div>
  )
}
