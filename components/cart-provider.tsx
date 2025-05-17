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

  useEffect(() => {
    const loadCart = async () => {
      try {
        if (user?.uid) {
          const savedCart = await getCart(user.uid)
          if (savedCart.length > 0) {
            setCart(savedCart)
          } else {
            const localCart = localStorage.getItem("cart")
            if (localCart) {
              const parsedCart = JSON.parse(localCart)
              setCart(parsedCart)
              await saveCart(user.uid, parsedCart)
            }
          }
        } else {
          const savedCart = localStorage.getItem("cart")
          if (savedCart) {
            try {
              setCart(JSON.parse(savedCart))
            } catch (error) {
              console.error("Грешка при парсване на количката от localStorage:", error)
            }
          }
        }
      } catch (error) {
        console.error("Грешка при зареждане на количката:", error)
      } finally {
        setInitialLoadComplete(true)
      }
    }

    loadCart()
  }, [user?.uid])

  useEffect(() => {
    if (initialLoadComplete) {
      localStorage.setItem("cart", JSON.stringify(cart))

      if (user?.uid) {
        saveCart(user.uid, cart).catch((error) => {
          console.error("Грешка при запазване на количката във Firebase:", error)
        })
      }
    }
  }, [cart, user?.uid, initialLoadComplete])

  const addToCart = (product: Product, quantity = 1, size?: string, color?: string) => {
    setCart((prevCart) => {
      const existingItemIndex = prevCart.findIndex(
        (item) => item.id === product.id && item.size === size && item.color === color,
      )

      if (existingItemIndex !== -1) {
        const updatedCart = [...prevCart]
        updatedCart[existingItemIndex].quantity += quantity

        toast({
          title: "Количката е обновена",
          description: `${product.name} беше обновен(а) в количката.`,
        })

        return updatedCart
      } else {
        toast({
          title: "Добавено в количката",
          description: `${product.name} беше добавен(а) в количката.`,
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
      title: "Премахнат от количката",
      description: `${item.name} беше премахнат(а) от количката.`,
    })
  }

  const clearCart = () => {
    setCart([])
    if (user?.uid) {
      import("@/lib/firebase/cart").then(({ clearCart: clearCartFromDB }) => {
        clearCartFromDB(user.uid).catch((error) => {
          console.error("Грешка при изчистване на количката от базата:", error)
        })
      })
    }
    toast({
      title: "Количката е изчистена",
      description: "Всички артикули бяха премахнати от количката.",
    })
  }

  const saveCartToAccount = async () => {
    if (!user?.uid) {
      toast({
        title: "Влезте в акаунта си",
        description: "Трябва да сте влезли, за да запазите количката.",
        variant: "destructive",
      })
      return
    }

    try {
      await saveCart(user.uid, cart)
      toast({
        title: "Количката е запазена",
        description: "Количката ви беше запазена към акаунта.",
      })
    } catch (error) {
      console.error("Грешка при запазване на количката:", error)
      toast({
        title: "Грешка",
        description: "Неуспешно запазване на количката. Опитайте отново.",
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
