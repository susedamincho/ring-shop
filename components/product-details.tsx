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
    // Determine product status based on inventory
    const productStatus =
        (product.inventory ?? 0) > 0
            ? `In stock${(product.inventory ?? 0) < 10 ? " (Low stock)" : " and ready to ship"}`
            : "Out of stock"

    return (
        <>
            <Link href="/products" className="inline-flex items-center gap-1 text-sm font-medium mb-6 hover:underline">
                <ArrowLeft className="h-4 w-4" />
                Back to Phones
            </Link>

            <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
                {/* Product Images */}
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
                                        alt={`${product.name} - View ${i + 1}`}
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
                                        alt={`${product.name} - View ${i + 1}`}
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

                {/* Product Details */}
                <div className="space-y-6">
                    <div>
                        <h1 className="text-3xl font-bold">{product.name}</h1>
                        <div className="flex items-center gap-4 mt-2">

                            {product.brand && <div className="text-sm text-gray-600">Brand: {product.brand}</div>}
                        </div>
                    </div>

                    <div className="text-2xl font-bold">{formatCurrency(product.price)}</div>

                    <div className="space-y-4">
                        {/* Phone Specifications */}
                        <div className="grid grid-cols-2 gap-4">
                            {product.model && (
                                <div>
                                    <h3 className="text-sm font-medium text-gray-500">Model</h3>
                                    <p>{product.model}</p>
                                </div>
                            )}

                            {product.storage && (
                                <div>
                                    <h3 className="text-sm font-medium text-gray-500">Storage</h3>
                                    <p>{product.storage}</p>
                                </div>
                            )}

                            {product.condition && (
                                <div>
                                    <h3 className="text-sm font-medium text-gray-500">Condition</h3>
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
                                    <h3 className="text-sm font-medium text-gray-500">Carrier</h3>
                                    <p>{product.carrier}</p>
                                </div>
                            )}

                            {product.color && (
                                <div>
                                    <h3 className="text-sm font-medium text-gray-500">Color</h3>
                                    <p>{product.color}</p>
                                </div>
                            )}

                            {product.batteryHealth && (
                                <div>
                                    <h3 className="text-sm font-medium text-gray-500">Battery Health</h3>
                                    <p>{product.batteryHealth}</p>
                                </div>
                            )}
                        </div>

                        {product.imeiNumber && (
                            <div>
                                <h3 className="text-sm font-medium text-gray-500">IMEI Number</h3>
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
                        <div className="text-sm text-gray-600">Free shipping on orders over $100</div>
                    </div>

                    <Tabs defaultValue="description">
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="description">Description</TabsTrigger>
                            <TabsTrigger value="features">Specifications</TabsTrigger>
                            <TabsTrigger value="shipping">Shipping</TabsTrigger>
                        </TabsList>
                        <TabsContent value="description" className="pt-4">
                            <p>{product.description || "No description available."}</p>
                        </TabsContent>
                        <TabsContent value="features" className="pt-4">
                            {product.features && product.features.length > 0 ? (
                                <ul className="list-disc pl-5 space-y-1">
                                    {product.features.map((feature, i) => (
                                        <li key={i}>{feature}</li>
                                    ))}
                                </ul>
                            ) : (
                                <p>No specification details available.</p>
                            )}

                            {product.accessories && product.accessories.length > 0 && (
                                <>
                                    <h3 className="font-medium mt-4 mb-2">Included Accessories</h3>
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
                                Orders typically ship within 1-2 business days. Free standard shipping on orders over $100. Express
                                shipping options available at checkout.
                            </p>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </>
    )
} 