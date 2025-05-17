"use client"

import Link from "next/link"
import { Minus, Plus, ShoppingCart, Trash, ArrowRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { useCart } from "@/components/cart-provider"
import { formatCurrency } from "@/lib/utils"

export default function CartSheet() {
  const { cart, updateQuantity, removeFromCart } = useCart()

  const subtotal = cart.reduce((total, item) => total + item.price * item.quantity, 0)

  if (cart.length === 0) {
    return (
      <div className="flex h-full flex-col bg-[#0f172a] text-white">
        <SheetHeader className="border-b border-[#0d9488]/20 px-6 py-4">
          <SheetTitle className="text-xl font-bold text-white">Вашата количка</SheetTitle>
        </SheetHeader>
        <div className="flex flex-1 flex-col items-center justify-center space-y-6 p-6">
          <div className="rounded-full bg-[#0d9488]/10 p-6">
            <ShoppingCart className="h-12 w-12 text-[#0d9488]" />
          </div>
          <div className="text-center">
            <h3 className="text-xl font-semibold">Количката е празна</h3>
            <p className="mt-2 text-gray-400">Добавете продукти, за да ги видите тук.</p>
          </div>
          <Link href="/products">
            <Button className="mt-4 bg-[#0d9488] hover:bg-[#0d9488]/90 text-white">Продължи с пазаруването</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col bg-[#0f172a] text-white">
      <SheetHeader className="border-b border-[#0d9488]/20 px-6 py-4">
        <SheetTitle className="text-xl font-bold text-white">Вашата количка ({cart.length})</SheetTitle>
      </SheetHeader>
      <ScrollArea className="flex-1">
        <div className="space-y-4 p-6">
          {cart.map((item) => (
            <div
              key={`${item.id}-${item.size}-${item.color}`}
              className="group relative flex gap-4 rounded-xl border border-[#0d9488]/20 bg-[#1e293b] p-4 transition-all hover:border-[#0d9488]/50"
            >
              <div className="h-20 w-20 overflow-hidden rounded-lg border border-[#0d9488]/20">
                <img src={item.image || "/placeholder.svg"} alt={item.name} className="h-full w-full object-cover" />
              </div>
              <div className="flex flex-1 flex-col justify-between">
                <div>
                  <h4 className="font-medium">{item.name}</h4>
                  <p className="text-sm text-gray-400">
                    {item.size && `Размер: ${item.size}`} {item.color && `Цвят: ${item.color}`}
                  </p>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <div className="flex items-center rounded-lg border border-[#0d9488]/30 bg-[#0f172a]">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-none rounded-l-lg text-[#0d9488] hover:bg-[#0d9488]/10 hover:text-white"
                      onClick={() => updateQuantity(item, Math.max(1, item.quantity - 1))}
                    >
                      <Minus className="h-3 w-3" />
                      <span className="sr-only">Намали количество</span>
                    </Button>
                    <span className="flex h-8 min-w-8 items-center justify-center text-sm font-medium">
                      {item.quantity}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-none rounded-r-lg text-[#0d9488] hover:bg-[#0d9488]/10 hover:text-white"
                      onClick={() => updateQuantity(item, item.quantity + 1)}
                    >
                      <Plus className="h-3 w-3" />
                      <span className="sr-only">Увеличи количество</span>
                    </Button>
                  </div>
                  <span className="font-medium">{formatCurrency(item.price * item.quantity)}</span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-2 h-7 w-7 rounded-full bg-[#0f172a]/80 text-gray-400 opacity-0 transition-opacity group-hover:opacity-100 hover:text-red-400"
                onClick={() => removeFromCart(item)}
              >
                <Trash className="h-4 w-4" />
                <span className="sr-only">Премахни продукт</span>
              </Button>
            </div>
          ))}
        </div>
      </ScrollArea>
      <div className="border-t border-[#0d9488]/20 p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-gray-400">Междинна сума</span>
            <span className="text-xl font-bold">{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex items-center justify-between text-sm text-gray-400">
            <span>Доставка</span>
            <span>Изчислява се при плащане</span>
          </div>
          <div className="h-px w-full bg-[#0d9488]/20"></div>
          <div className="flex flex-col gap-3">
            <Link href="/cart" className="w-full">
              <Button variant="outline" className="bg-black/30 hover:text-[#0d9488] w-full border-[#0d9488]/50 text-white hover:bg-[#0d9488]/10">
                Виж количката
              </Button>
            </Link>
            <Link href="/checkout" className="w-full">
              <Button className="w-full bg-[#0d9488] text-white hover:bg-[#0d9488]/90">
                Плащане <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
