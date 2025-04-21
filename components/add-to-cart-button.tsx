"use client"

import { useState } from "react"
import { ShoppingCart } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useCart } from "@/components/cart-provider"

interface AddToCartButtonProps {
  product: any
}

export default function AddToCartButton({ product }: AddToCartButtonProps) {
  const { addToCart } = useCart()
  const [quantity, setQuantity] = useState(1)
  const [size, setSize] = useState(product.sizes?.[0] || null)
  const [color, setColor] = useState(product.colors?.[0] || null)

  const handleAddToCart = () => {
    addToCart(product, quantity, size, color)
  }

  return (
    <Button className="w-full" size="lg" onClick={handleAddToCart}>
      <ShoppingCart className="mr-2 h-4 w-4" />
      Add to Cart
    </Button>
  )
}
