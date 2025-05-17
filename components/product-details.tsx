// Файл: ProductDetails.tsx

"use client"

import Link from "next/link"
import { ArrowLeft, Check, Star } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import AddToCartButton from "@/components/add-to-cart-button"
import { formatCurrency } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Product } from "@/lib/firebase/products"

interface ProductDetailsProps {
    product: Product
}

export default function ProductDetails({ product }: ProductDetailsProps) {
    // Определи статуса на продукта на база наличността
    const productStatus =
        (product.inventory ?? 0) > 0
            ? `В наличност${(product.inventory ?? 0) < 10 ? " (Ограничени бройки)" : " и готов за доставка"}`
            : "Изчерпан"

    return (
        <>
            <Link href="/products" className="inline-flex items-center gap-1 text-sm font-medium mb-6 hover:underline">
                <ArrowLeft className="h-4 w-4" />
                Обратно към телефони
            </Link>

            <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
                {/* Снимки на продукта */}
                <div className="space-y-4">
                    <div className="overflow-hidden rounded-lg bg-gray-100">
                        <img
                            src={product.image || "/placeholder.svg"}
                            alt={product.name}
                            className="w-full object-cover aspect-square"
                            onError={(e) => {
                                e.currentTarget.src = "/placeholder.svg"
                            }}
                        />
                    </div>
                    {product.additionalImages && product.additionalImages.length > 0 ? (
                        <div className="grid grid-cols-4 gap-4">
                            {product.additionalImages.map((image, i) => (
                                <div key={i} className="overflow-hidden rounded-lg bg-gray-100">
                                    <img
                                        src={image || "/placeholder.svg"}
                                        alt={`${product.name} - Изглед ${i + 1}`}
                                        className="w-full object-cover aspect-square"
                                        onError={(e) => {
                                            e.currentTarget.src = "/placeholder.svg"
                                        }}
                                    />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-4 gap-4">
                            {[...Array(4)].map((_, i) => (
                                <div key={i} className="overflow-hidden rounded-lg bg-gray-100">
                                    <img
                                        src={product.image || "/placeholder.svg"}
                                        alt={`${product.name} - Изглед ${i + 1}`}
                                        className="w-full object-cover aspect-square"
                                        onError={(e) => {
                                            e.currentTarget.src = "/placeholder.svg"
                                        }}
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Детайли за продукта */}
                <div className="space-y-6">
                    <div>
                        <h1 className="text-3xl font-bold">{product.name}</h1>
                        <div className="flex items-center gap-4 mt-2">
                            {product.brand && <div className="text-sm text-gray-600">Марка: {product.brand}</div>}
                        </div>
                    </div>

                    <div className="text-2xl font-bold">{formatCurrency(product.price)}</div>

                    <div className="space-y-4">
                        {/* Спецификации */}
                        <div className="grid grid-cols-2 gap-4">
                            {product.model && (
                                <div>
                                    <h3 className="text-sm font-medium text-gray-500">Модел</h3>
                                    <p>{product.model}</p>
                                </div>
                            )}

                            {product.storage && (
                                <div>
                                    <h3 className="text-sm font-medium text-gray-500">Памет</h3>
                                    <p>{product.storage}</p>
                                </div>
                            )}

                            {product.condition && (
                                <div>
                                    <h3 className="text-sm font-medium text-gray-500">Състояние</h3>
                                    <Badge
                                        variant={
                                            product.condition === "New" || product.condition === "Like New"
                                                ? "default"
                                                : product.condition === "Excellent" || product.condition === "Good"
                                                    ? "secondary"
                                                    : "outline"
                                        }
                                    >
                                        {product.condition}
                                    </Badge>
                                </div>
                            )}

                            {product.carrier && (
                                <div>
                                    <h3 className="text-sm font-medium text-gray-500">Оператор</h3>
                                    <p>{product.carrier}</p>
                                </div>
                            )}

                            {product.color && (
                                <div>
                                    <h3 className="text-sm font-medium text-gray-500">Цвят</h3>
                                    <p>{product.color}</p>
                                </div>
                            )}

                            {product.batteryHealth && (
                                <div>
                                    <h3 className="text-sm font-medium text-gray-500">Състояние на батерията</h3>
                                    <p>{product.batteryHealth}</p>
                                </div>
                            )}
                        </div>

                        {product.imeiNumber && (
                            <div>
                                <h3 className="text-sm font-medium text-gray-500">IMEI номер</h3>
                                <p>{product.imeiNumber}</p>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-4">
                        <AddToCartButton product={product} />
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-green-600">
                            <Check className="h-4 w-4" />
                            {productStatus}
                        </div>
                        <div className="text-sm text-gray-600">Безплатна доставка при поръчки над 100 лв</div>
                    </div>

                    <Tabs defaultValue="description">
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="description">Описание</TabsTrigger>
                            <TabsTrigger value="features">Характеристики</TabsTrigger>
                            <TabsTrigger value="shipping">Доставка</TabsTrigger>
                        </TabsList>
                        <TabsContent value="description" className="pt-4">
                            <p>{product.description || "Няма налично описание."}</p>
                        </TabsContent>
                        <TabsContent value="features" className="pt-4">
                            {product.features && product.features.length > 0 ? (
                                <ul className="list-disc pl-5 space-y-1">
                                    {product.features.map((feature, i) => (
                                        <li key={i}>{feature}</li>
                                    ))}
                                </ul>
                            ) : (
                                <p>Няма налични спецификации.</p>
                            )}

                            {product.accessories && product.accessories.length > 0 && (
                                <>
                                    <h3 className="font-medium mt-4 mb-2">Включени аксесоари</h3>
                                    <ul className="list-disc pl-5 space-y-1">
                                        {product.accessories.map((accessory, i) => (
                                            <li key={i}>{accessory}</li>
                                        ))}
                                    </ul>
                                </>
                            )}
                        </TabsContent>
                        <TabsContent value="shipping" className="pt-4">
                            <p>
                                Поръчките обикновено се изпращат в рамките на 1–2 работни дни.
                                Безплатна стандартна доставка при поръчки над 100 лв.
                                Опции за експресна доставка са налични при поръчка.
                            </p>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </>
    )
}
