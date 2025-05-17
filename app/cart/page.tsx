"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { Minus, Plus, ShoppingCart, Trash } from 'lucide-react'

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useCart } from "@/components/cart-provider"
import { formatCurrency } from "@/lib/utils"
import { useSettings } from "@/components/settings-provider"

export default function CartPage() {
  const router = useRouter()
  const { cart, updateQuantity, removeFromCart, clearCart } = useCart()
  const { settings } = useSettings()

  const subtotal = cart.reduce((total, item) => total + item.price * item.quantity, 0)
  const shipping = subtotal >= settings.freeShippingThreshold ? 0 : 10
  const tax = subtotal * (settings.taxRate / 100)
  const total = subtotal + shipping + tax

  const handleCheckout = () => {
    router.push("/checkout")
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0f172a] to-[#1e293b] text-white">
      <div className="container px-4 md:px-6 py-8 md:py-12">
        <h1 className="text-3xl font-bold mb-6">Вашата количка</h1>

        {cart.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <ShoppingCart className="h-16 w-16 text-gray-400 mb-4" />
            <h2 className="text-2xl font-semibold mb-2">Количката е празна</h2>
            <p className="text-gray-500 mb-6">Изглежда, че няма нищо добавено в количката</p>
            <Link href="/products">
              <Button size="lg" className="bg-[#0d9488] hover:bg-[#0d9488]/90 text-white">
                Продължи пазаруването
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="rounded-lg border shadow-sm bg-[#1e293b]/80 backdrop-blur-sm border-white/10">
                <div className="p-6">
                  <div className="flow-root">
                    <ul className="divide-y divide-white/10">
                      {cart.map((item) => (
                        <li key={`${item.id}-${item.size}-${item.color}`} className="py-6 flex">
                          <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-white/10">
                            <img
                              src={item.image || "/placeholder.svg"}
                              alt={item.name}
                              className="h-full w-full object-cover object-center"
                            />
                          </div>

                          <div className="ml-4 flex flex-1 flex-col">
                            <div>
                              <div className="flex justify-between text-base font-medium">
                                <h3>
                                  <Link href={`/product/${item.id}`} className="hover:underline text-white">
                                    {item.name}
                                  </Link>
                                </h3>
                                <p className="ml-4 text-white">{formatCurrency(item.price * item.quantity)}</p>
                              </div>
                              <p className="mt-1 text-sm text-gray-500">
                                {item.color && `Color: ${item.color}`} {item.size && `Size: ${item.size}`}
                              </p>
                            </div>

                            <div className="flex flex-1 items-end justify-between text-sm">
                              <div className="flex items-center space-x-2">
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-8 w-8 border-white/10 text-white hover:bg-white/10 hover:text-white"
                                  onClick={() => updateQuantity(item, Math.max(1, item.quantity - 1))}
                                >
                                  <Minus className="h-4 w-4" />
                                </Button>
                                <span className="px-2 text-white">{item.quantity}</span>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-8 w-8 border-white/10 text-white hover:bg-white/10 hover:text-white"
                                  onClick={() => updateQuantity(item, item.quantity + 1)}
                                >
                                  <Plus className="h-4 w-4" />
                                </Button>
                              </div>

                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-500 hover:text-red-700"
                                onClick={() => removeFromCart(item)}
                              >
                                <Trash className="h-4 w-4 mr-1" />
                                Премахни
                              </Button>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="border-t border-white/10 px-6 py-4">
                  <Button variant="outline" className="bg-black/30 w-full border-white/10 text-white hover:bg-white/10" onClick={() => clearCart()}>
                  Изчистване на количката
                  </Button>
                </div>
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="rounded-lg border shadow-sm bg-[#1e293b]/80 backdrop-blur-sm border-white/10">
                <div className="p-6">
                  <h2 className="text-lg font-semibold mb-4">Обобщение на поръчката</h2>

                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Междинна сума</span>
                      <span className="text-white">{formatCurrency(subtotal)}</span>
                    </div>

                    <div className="flex justify-between">
                      <span>Доставка</span>
                      <span className="text-white">{shipping === 0 ? "Free" : formatCurrency(shipping)}</span>
                    </div>
                    {shipping === 0 && (
                      <div className="text-xs text-green-600">
                        Безплатна доставка над {settings.freeShippingThreshold} лв.
                      </div>
                    )}

                    <div className="flex justify-between">
                      <span>Такса ({settings.taxRate}%)</span>
                      <span className="text-white">{formatCurrency(tax)}</span>
                    </div>

                    <Separator className="bg-white/10" />

                    <div className="flex justify-between font-semibold">
                      <span>Общо</span>
                      <span className="text-white">{formatCurrency(total)}</span>
                    </div>
                  </div>

                  <Button className="w-full mt-6 bg-[#0d9488] hover:bg-[#0d9488]/90 text-white" size="lg" onClick={handleCheckout}>
                    Продължете към плащане
                  </Button>

                  <div className="mt-4 text-center">
                    <Link href="/products" className="text-sm text-gray-500 hover:underline">
                      Или продължете с пазаруването
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
