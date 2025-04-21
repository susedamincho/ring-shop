"use client"

import { useParams } from "next/navigation"
import ProductForm from "@/components/product-form"
import ProtectedRoute from "@/components/protected-route"

export default function EditProductPage() {
  const params = useParams()
  const productId = typeof params.id === 'string' ? params.id : Array.isArray(params.id) ? params.id[0] : null

  return (
    <ProtectedRoute adminOnly>

      <div className="flex flex-col">
        <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-6">
          <div className="flex flex-1 items-center">
            <h1 className="text-xl font-semibold">Редактиране на продукт</h1>
          </div>
        </header>

        <main className="flex-1 p-6">
          <ProductForm productId={productId} />
        </main>
      </div>
    </ProtectedRoute>
  )
}
