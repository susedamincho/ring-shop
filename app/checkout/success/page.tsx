import Link from "next/link"
import { Check, ShoppingBag } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function CheckoutSuccessPage() {
  // In a complete implementation, you would fetch the order details
  // from the database using a server action or API route

  return (
    <div className="container px-4 md:px-6 py-8 md:py-12">
      <div className="mx-auto max-w-md text-center">
        <div className="flex justify-center mb-6">
          <div className="rounded-full bg-green-100 p-3">
            <Check className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <h1 className="text-3xl font-bold mb-2">Order Confirmed!</h1>
        <p className="text-gray-500 mb-6">
        Благодарим ви за покупката. Вашата поръчка е потвърдена и скоро ще бъде изпратена.
        </p>

        <div className="rounded-lg border p-6 mb-6 text-left">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="font-medium">Order Number:</span>
              <span>#{getRandomOrderNumber()}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Date:</span>
              <span>{new Date().toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Email:</span>
              <span>Вашият имейл е получил потвърждение</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Начин на плащане:</span>
              <span>Кредитна карта</span>
            </div>
          </div>
        </div>

        <p className="text-sm text-gray-500 mb-6">
        Изпратен е имейл за потвърждение с всички подробности за вашата поръчка.
        </p>

        <div className="flex flex-col space-y-3">
          <Link href="/account/orders">
            <Button variant="outline" className="w-full">
            Вижте подробности за поръчката
            </Button>
          </Link>
          <Link href="/products">
            <Button className="w-full">
              <ShoppingBag className="mr-2 h-4 w-4" />
              Продължете с пазаруването
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

// Helper function to generate a random order number for display
function getRandomOrderNumber() {
  return `ORD-${Math.floor(100000 + Math.random() * 900000)}`
}
