"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/components/auth-provider"
import { saveCart, getCart } from "@/lib/firebase/cart"

type CartItem = {
  id: string
  name: string
  price: number
  quantity: number
  image: string
  size?: string
  color?: string
}

type Product = {
  id: string
  name: string
  price: number
  image?: string
}

type CartContextType = {
  cart: CartItem[]
  addToCart: (product: Product, quantity: number, size?: string, color?: string) => void
  updateQuantity: (item: CartItem, quantity: number) => void
  removeFromCart: (item: CartItem) => void
  clearCart: () => void
  saveCartToAccount: () => Promise<void>
}

const CartContext = createContext<CartContextType>({
  cart: [],
  addToCart: () => {},
  updateQuantity: () => {},
  removeFromCart: () => {},
  clearCart: () => {},
  saveCartToAccount: async () => {},
})

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { toast } = useToast()
  const { user } = useAuth()
  const [cart, setCart] = useState<CartItem[]>([])
  const [initialLoadComplete, setInitialLoadComplete] = useState(false)

  // Load cart from localStorage on initial render for guests
  // or from Firebase for logged in users
  useEffect(() => {
    const loadCart = async () => {
      try {
        if (user?.uid) {
          // Fetch cart from Firebase
          const savedCart = await getCart(user.uid)
          if (savedCart.length > 0) {
            setCart(savedCart)
          } else {
            // If no server cart, check localStorage
            const localCart = localStorage.getItem("cart")
            if (localCart) {
              const parsedCart = JSON.parse(localCart)
              setCart(parsedCart)
              // Save local cart to Firebase
              await saveCart(user.uid, parsedCart)
            }
          }
        } else {
          // For guests, use localStorage only
          const savedCart = localStorage.getItem("cart")
          if (savedCart) {
            try {
              setCart(JSON.parse(savedCart))
            } catch (error) {
              console.error("Failed to parse cart from localStorage:", error)
            }
          }
        }
      } catch (error) {
        console.error("Error loading cart:", error)
      } finally {
        setInitialLoadComplete(true)
      }
    }

    loadCart()
  }, [user?.uid])

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (initialLoadComplete) {
      localStorage.setItem("cart", JSON.stringify(cart))

      // Save to Firebase if user is logged in
      if (user?.uid) {
        saveCart(user.uid, cart).catch((error) => {
          console.error("Error saving cart to Firebase:", error)
        })
      }
    }
  }, [cart, user?.uid, initialLoadComplete])

  const addToCart = (product: Product, quantity = 1, size?: string, color?: string) => {
    setCart((prevCart) => {
      // Check if item already exists in cart
      const existingItemIndex = prevCart.findIndex(
        (item) => item.id === product.id && item.size === size && item.color === color,
      )

      if (existingItemIndex !== -1) {
        // Update quantity of existing item
        const updatedCart = [...prevCart]
        updatedCart[existingItemIndex].quantity += quantity

        toast({
          title: "Cart updated",
          description: `${product.name} quantity updated in your cart.`,
        })

        return updatedCart
      } else {
        // Add new item to cart
        toast({
          title: "Added to cart",
          description: `${product.name} has been added to your cart.`,
        })

        return [
          ...prevCart,
          {
            id: product.id,
            name: product.name,
            price: product.price,
            quantity,
            image: product.image || "/placeholder.svg",
            size,
            color,
          },
        ]
      }
    })
  }

  const updateQuantity = (item: CartItem, quantity: number) => {
    setCart((prevCart) =>
      prevCart.map((cartItem) =>
        cartItem.id === item.id && cartItem.size === item.size && cartItem.color === item.color
          ? { ...cartItem, quantity }
          : cartItem,
      ),
    )
  }

  const removeFromCart = (item: CartItem) => {
    setCart((prevCart) =>
      prevCart.filter(
        (cartItem) => !(cartItem.id === item.id && cartItem.size === item.size && cartItem.color === item.color),
      ),
    )

    toast({
      title: "Item removed",
      description: `${item.name} has been removed from your cart.`,
    })
  }

  const clearCart = () => {
    setCart([])
    if (user?.uid) {
      // Import the clearCart function from lib/cart
      import("@/lib/firebase/cart").then(({ clearCart: clearCartFromDB }) => {
        clearCartFromDB(user.uid).catch((error) => {
          console.error("Error clearing cart from database:", error)
        })
      })
    }
    toast({
      title: "Cart cleared",
      description: "All items have been removed from your cart.",
    })
  }

  const saveCartToAccount = async () => {
    if (!user?.uid) {
      toast({
        title: "Please sign in",
        description: "You need to be signed in to save your cart.",
        variant: "destructive",
      })
      return
    }

    try {
      await saveCart(user.uid, cart)
      toast({
        title: "Cart saved",
        description: "Your cart has been saved to your account.",
      })
    } catch (error) {
      console.error("Error saving cart:", error)
      toast({
        title: "Error",
        description: "Failed to save cart. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        saveCartToAccount,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)
