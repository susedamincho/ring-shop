"use client"

import { useCart } from "@/components/cart-provider"
import { formatCurrency } from "@/lib/utils"
import { Separator } from "@/components/ui/separator"
import { useSettings } from "@/components/settings-provider"

export default function CheckoutSummary() {
  const { cart } = useCart()
  const { settings } = useSettings()

  const subtotal = cart.reduce((total, item) => total + item.price * item.quantity, 0)
  const shipping = subtotal >= settings.freeShippingThreshold ? 0 : 10
  const tax = subtotal * (settings.taxRate / 100)
  const total = subtotal + shipping + tax

  return (
    <div className="rounded-lg border shadow-sm">
      <div className="p-6">
        <h2 className="text-lg font-semibold mb-4">Обобщение на поръчката</h2>

        <div className="space-y-4">
          <div className="space-y-2">
            {cart.map((item) => (
              <div key={`${item.id}-${item.size}-${item.color}`} className="flex justify-between text-sm">
                <span>
                  {item.name} × {item.quantity}
                </span>
                <span>{formatCurrency(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>

          <Separator />

          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Междинна сума</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>

            <div className="flex justify-between relative">
              <span>Доставка</span>
              <span>{shipping === 0 ? "Безплатно" : formatCurrency(shipping)}</span>
              {shipping === 0 && (
                <span className="absolute right-8 text-xs text-green-600">
                  Безплатна доставка при поръчки над {formatCurrency(settings.freeShippingThreshold)}
                </span>
              )}
            </div>

            <div className="flex justify-between">
              <span>ДДС ({settings.taxRate}%)</span>
              <span>{formatCurrency(tax)}</span>
            </div>
          </div>

          <Separator />

          <div className="flex justify-between font-semibold">
            <span>Общо</span>
            <span>{formatCurrency(total)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
