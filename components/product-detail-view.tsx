"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
    ChevronLeft,
    ChevronRight,
    ShoppingCart,
    Heart,
    Share2,
    Check,
    Star,
    Shield,
    Truck,
    RotateCcw,
    Plus,
    Minus,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useCart } from "@/components/cart-provider"
import { formatCurrency } from "@/lib/utils"
import type { Product } from "@/lib/firebase/products"

interface ProductDetailViewProps {
    product: Product
}

export default function ProductDetailView({ product }: ProductDetailViewProps) {
    const router = useRouter()
    const { addToCart } = useCart()
    const [currentImageIndex, setCurrentImageIndex] = useState(0)
    const [quantity, setQuantity] = useState(1)
    const [isFavorite, setIsFavorite] = useState(false)
    const [activeTab, setActiveTab] = useState("description")

    // Combine main image with additional images
    const allImages = [product.image || "/placeholder.svg", ...(product.additionalImages || [])].filter(Boolean)

    // If no additional images, create duplicates for the gallery
    const displayImages =
        allImages.length > 1 ? allImages : [product.image || "/placeholder.svg", product.image || "/placeholder.svg"]

    const handlePrevImage = () => {
        setCurrentImageIndex((prev) => (prev === 0 ? displayImages.length - 1 : prev - 1))
    }

    const handleNextImage = () => {
        setCurrentImageIndex((prev) => (prev === displayImages.length - 1 ? 0 : prev + 1))
    }

    const handleThumbnailClick = (index: number) => {
        setCurrentImageIndex(index)
    }

    const handleAddToCart = () => {
        addToCart(product, quantity)
    }

    const toggleFavorite = () => {
        setIsFavorite(!isFavorite)
    }

    const handleShare = () => {
        if (navigator.share) {
            navigator
                .share({
                    title: product.name,
                    text: product.description,
                    url: window.location.href,
                })
                .catch(console.error)
        } else {
            navigator.clipboard.writeText(window.location.href)
            alert("Link copied to clipboard!")
        }
    }

    const goBack = () => {
        router.back()
    }


    return (
        <div className="container mx-auto px-4 py-8">
            {/* Breadcrumb */}
            <div className="flex items-center space-x-2 text-sm text-gray-400 mb-8">
                <button onClick={goBack} className="flex items-center hover:text-[#0d9488] transition-colors">
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Back
                </button>
                <span>/</span>
                <a href="/products" className="hover:text-[#0d9488] transition-colors">
                    Products
                </a>
                <span>/</span>
                <span className="text-white">{product.name}</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Product Images */}
                <div className="space-y-6">
                    <div className="relative overflow-hidden rounded-2xl bg-[#1e293b] border border-white/10 aspect-square">
                        <img
                            src={displayImages[currentImageIndex] || "/placeholder.svg"}
                            alt={product.name}
                            className="w-full h-full object-contain p-4"
                        />

                        {displayImages.length > 1 && (
                            <>
                                <button
                                    onClick={handlePrevImage}
                                    className="absolute left-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-black/30 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/50 transition-colors"
                                >
                                    <ChevronLeft className="h-6 w-6" />
                                </button>
                                <button
                                    onClick={handleNextImage}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-black/30 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/50 transition-colors"
                                >
                                    <ChevronRight className="h-6 w-6" />
                                </button>
                            </>
                        )}
                    </div>

                    {/* Thumbnails */}
                    {displayImages.length > 1 && (
                        <div className="flex space-x-4 overflow-x-auto pb-2 scrollbar-hide">
                            {displayImages.map((image, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleThumbnailClick(index)}
                                    className={`relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${currentImageIndex === index
                                        ? "border-[#0d9488] scale-105"
                                        : "border-transparent opacity-70 hover:opacity-100"
                                        }`}
                                >
                                    <img
                                        src={image || "/placeholder.svg"}
                                        alt={`Thumbnail ${index + 1}`}
                                        className="w-full h-full object-cover"
                                    />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Product Details */}
                <div className="space-y-8">
                    <div>
                        {product.brand && <div className="text-[#0d9488] font-medium mb-2">{product.brand}</div>}
                        <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">{product.name}</h1>

                        <div className="flex items-baseline space-x-3 mb-6">
                            <span className="text-3xl font-bold text-white">{formatCurrency(product.price)}</span>
                            {product.discount && product.discount > 0 && (
                                <>
                                    <span className="text-xl text-gray-400 line-through">
                                        {formatCurrency(product.price * (1 + product.discount / 100))}
                                    </span>
                                    <Badge className="bg-[#0d9488] text-white">Save {product.discount}%</Badge>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Specifications */}
                    <div className="grid grid-cols-2 gap-4 bg-[#1e293b]/50 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                        {product.model && (
                            <div>
                                <h3 className="text-sm font-medium text-gray-400">Model</h3>
                                <p className="text-white">{product.model}</p>
                            </div>
                        )}

                        {product.storage && (
                            <div>
                                <h3 className="text-sm font-medium text-gray-400">Storage</h3>
                                <p className="text-white">{product.storage}</p>
                            </div>
                        )}

                        {product.condition && (
                            <div>
                                <h3 className="text-sm font-medium text-gray-400">Condition</h3>
                                <Badge
                                    variant="outline"
                                    className={`
                    ${product.condition === "New" ? "border-green-500 text-green-500" : ""}
                    ${product.condition === "Like New" ? "border-blue-500 text-blue-500" : ""}
                    ${product.condition === "Excellent" ? "border-purple-500 text-purple-500" : ""}
                    ${product.condition === "Good" ? "border-yellow-500 text-yellow-500" : ""}
                    ${product.condition === "Fair" ? "border-orange-500 text-orange-500" : ""}
                  `}
                                >
                                    {product.condition}
                                </Badge>
                            </div>
                        )}

                        {product.carrier && (
                            <div>
                                <h3 className="text-sm font-medium text-gray-400">Carrier</h3>
                                <p className="text-white">{product.carrier}</p>
                            </div>
                        )}

                        {product.color && (
                            <div>
                                <h3 className="text-sm font-medium text-gray-400">Color</h3>
                                <div className="flex items-center">
                                    <div
                                        className="h-4 w-4 rounded-full mr-2 border border-white/20"
                                        style={{
                                            backgroundColor:
                                                product.color.toLowerCase() === "black"
                                                    ? "#000"
                                                    : product.color.toLowerCase() === "white"
                                                        ? "#fff"
                                                        : product.color.toLowerCase() === "red"
                                                            ? "#f44336"
                                                            : product.color.toLowerCase() === "blue"
                                                                ? "#2196f3"
                                                                : product.color.toLowerCase() === "green"
                                                                    ? "#4caf50"
                                                                    : product.color.toLowerCase() === "yellow"
                                                                        ? "#ffeb3b"
                                                                        : product.color.toLowerCase() === "purple"
                                                                            ? "#9c27b0"
                                                                            : product.color.toLowerCase() === "pink"
                                                                                ? "#e91e63"
                                                                                : product.color.toLowerCase() === "gray"
                                                                                    ? "#9e9e9e"
                                                                                    : product.color.toLowerCase() === "gold"
                                                                                        ? "#ffd700"
                                                                                        : product.color.toLowerCase() === "silver"
                                                                                            ? "#c0c0c0"
                                                                                            : "#888",
                                        }}
                                    ></div>
                                    <p className="text-white">{product.color}</p>
                                </div>
                            </div>
                        )}

                        {product.batteryHealth && (
                            <div>
                                <h3 className="text-sm font-medium text-gray-400">Battery Health</h3>
                                <p className="text-white">{product.batteryHealth}</p>
                            </div>
                        )}
                    </div>

                    {/* Add to Cart */}
                    <div className="space-y-6">
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center border border-white/20 rounded-lg">
                                <button
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                    className="h-10 w-10 flex items-center justify-center text-white hover:bg-white/10 rounded-l-lg"
                                >
                                    <Minus className="h-4 w-4" />
                                </button>
                                <span className="h-10 w-12 flex items-center justify-center text-white font-medium">{quantity}</span>
                                <button
                                    onClick={() => setQuantity(quantity + 1)}
                                    className="h-10 w-10 flex items-center justify-center text-white hover:bg-white/10 rounded-r-lg"
                                >
                                    <Plus className="h-4 w-4" />
                                </button>
                            </div>

                            <Button className="flex-1 h-10 bg-[#0d9488] hover:bg-[#0d9488]/80 text-white" onClick={handleAddToCart}>
                                <ShoppingCart className="mr-2 h-4 w-4" />
                                Add to Cart
                            </Button>

                            <Button
                                variant="outline"
                                size="icon"
                                className="h-10 w-10 rounded-lg border-white/20 text-black hover:text-white hover:bg-white/10"
                                onClick={handleShare}
                            >
                                <Share2 className="h-5 w-5" />
                            </Button>
                        </div>

                        {/* Shipping & Returns */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="flex items-center space-x-3 bg-[#1e293b]/30 backdrop-blur-sm p-3 rounded-lg border border-white/10">
                                <div className="h-10 w-10 rounded-full bg-[#0d9488]/10 flex items-center justify-center">
                                    <Truck className="h-5 w-5 text-[#0d9488]" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-medium text-white">Free Shipping</h3>
                                    <p className="text-xs text-gray-400">On orders over $100</p>
                                </div>
                            </div>

                            <div className="flex items-center space-x-3 bg-[#1e293b]/30 backdrop-blur-sm p-3 rounded-lg border border-white/10">
                                <div className="h-10 w-10 rounded-full bg-[#0d9488]/10 flex items-center justify-center">
                                    <Shield className="h-5 w-5 text-[#0d9488]" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-medium text-white">1 Year Warranty</h3>
                                    <p className="text-xs text-gray-400">Full coverage</p>
                                </div>
                            </div>

                            <div className="flex items-center space-x-3 bg-[#1e293b]/30 backdrop-blur-sm p-3 rounded-lg border border-white/10">
                                <div className="h-10 w-10 rounded-full bg-[#0d9488]/10 flex items-center justify-center">
                                    <RotateCcw className="h-5 w-5 text-[#0d9488]" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-medium text-white">30-Day Returns</h3>
                                    <p className="text-xs text-gray-400">Hassle-free returns</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Product Tabs */}
            <div className="mt-16">
                <Tabs defaultValue="description" className="w-full" onValueChange={setActiveTab}>
                    <TabsList className="grid w-full grid-cols-3 bg-[#1e293b]/50 backdrop-blur-sm rounded-lg">
                        <TabsTrigger value="description" className={activeTab === "description" ? "text-[#0d9488]" : "text-white"}>
                            Description
                        </TabsTrigger>
                        <TabsTrigger
                            value="specifications"
                            className={activeTab === "specifications" ? "text-[#0d9488]" : "text-white"}
                        >
                            Specifications
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent
                        value="description"
                        className="mt-6 bg-[#1e293b]/30 backdrop-blur-sm rounded-xl p-6 border border-white/10"
                    >
                        <div className="prose prose-invert max-w-none">
                            <p className="text-gray-300 leading-relaxed">{product.description || "No description available."}</p>
                        </div>
                    </TabsContent>

                    <TabsContent
                        value="specifications"
                        className="mt-6 bg-[#1e293b]/30 backdrop-blur-sm rounded-xl p-6 border border-white/10"
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h3 className="text-lg font-medium text-white mb-4">Technical Specifications</h3>
                                <ul className="space-y-3">
                                    {product.model && (
                                        <li className="flex justify-between">
                                            <span className="text-gray-400">Model</span>
                                            <span className="text-white font-medium">{product.model}</span>
                                        </li>
                                    )}
                                    {product.storage && (
                                        <li className="flex justify-between">
                                            <span className="text-gray-400">Storage</span>
                                            <span className="text-white font-medium">{product.storage}</span>
                                        </li>
                                    )}
                                    {product.color && (
                                        <li className="flex justify-between">
                                            <span className="text-gray-400">Color</span>
                                            <span className="text-white font-medium">{product.color}</span>
                                        </li>
                                    )}
                                    {product.carrier && (
                                        <li className="flex justify-between">
                                            <span className="text-gray-400">Carrier</span>
                                            <span className="text-white font-medium">{product.carrier}</span>
                                        </li>
                                    )}
                                    {product.batteryHealth && (
                                        <li className="flex justify-between">
                                            <span className="text-gray-400">Battery Health</span>
                                            <span className="text-white font-medium">{product.batteryHealth}</span>
                                        </li>
                                    )}
                                    {product.imeiNumber && (
                                        <li className="flex justify-between">
                                            <span className="text-gray-400">IMEI Number</span>
                                            <span className="text-white font-medium">{product.imeiNumber}</span>
                                        </li>
                                    )}
                                </ul>
                            </div>

                            <div>
                                <h3 className="text-lg font-medium text-white mb-4">Features</h3>
                                {product.features && product.features.length > 0 ? (
                                    <ul className="space-y-2">
                                        {product.features.map((feature, index) => (
                                            <li key={index} className="flex items-start">
                                                <Check className="h-5 w-5 text-[#0d9488] mr-2 mt-0.5 flex-shrink-0" />
                                                <span className="text-gray-300">{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-gray-400">No feature details available.</p>
                                )}

                                {product.accessories && product.accessories.length > 0 && (
                                    <div className="mt-6">
                                        <h3 className="text-lg font-medium text-white mb-4">Included Accessories</h3>
                                        <ul className="space-y-2">
                                            {product.accessories.map((accessory, index) => (
                                                <li key={index} className="flex items-start">
                                                    <Check className="h-5 w-5 text-[#0d9488] mr-2 mt-0.5 flex-shrink-0" />
                                                    <span className="text-gray-300">{accessory}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}
