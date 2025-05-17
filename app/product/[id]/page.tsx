import { getProductById, getRelatedProducts } from "@/lib/firebase/products"
import ProductDetailView from "@/components/product-detail-view"
import type { Product } from "@/lib/firebase/products"
import type { Metadata } from "next"

interface ProductPageProps {
  params: Promise<{
    id: string
  }>
}

export async function generateMetadata(props: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const params = await props.params;
  const productData = await getProductById(params.id)

  if (!productData) {
    return {
      title: "Product Not Found",
      description: "The requested product could not be found.",
    }
  }

  return {
    title: `${productData.name} | PhoneStore`,
    description: productData.description || `Buy ${productData.name} at the best price`,
    openGraph: {
      images: [productData.image || "/placeholder.svg"],
    },
  }
}

export default async function ProductPage(props: ProductPageProps) {
  const params = await props.params
  const productData = await getProductById(params.id)

  if (!productData) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-md mx-auto bg-[#0f172a]/90 backdrop-blur-md rounded-xl p-8 border border-[#0d9488]/20 shadow-xl">
          <h1 className="text-2xl font-bold text-white mb-4">Продуктът не е намерен</h1>
          <p className="text-gray-300 mb-6">Продуктът, който търсите, не съществува или е премахнат.</p>
          <a
            href="/products"
            className="inline-block bg-[#0d9488] hover:bg-[#0d9488]/80 text-white font-medium px-6 py-3 rounded-lg transition-colors"
          >
            Browse Products
          </a>
        </div>
      </div>
    )
  }

  // Ensure the product data matches our Product interface
  const product: Product = {
    id: productData.id,
    name: productData.name || "",
    description: productData.description || "",
    price: productData.price || 0,
    brand: productData.brand,
    model: productData.model,
    storage: productData.storage,
    condition: productData.condition,
    carrier: productData.carrier,
    color: productData.color,
    imeiNumber: productData.imeiNumber,
    batteryHealth: productData.batteryHealth,
    accessories: productData.accessories,
    categoryIds: productData.categoryIds,
    image: productData.image,
    additionalImages: productData.additionalImages,
    features: productData.features,
    createdAt:
      productData.createdAt instanceof Date
        ? productData.createdAt
        : new Date((productData.createdAt as any)?.toDate?.() || Date.now()),
  }

  // Fetch related products
  const [relatedProducts] = await Promise.all([
    getRelatedProducts(product.categoryIds?.[0] || "", product.id, 4),
  ])

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0f172a] to-[#1e293b]">
      <ProductDetailView product={product} />

      {relatedProducts.length > 0 && (
        <div className="container mx-auto px-4 py-16">
          <div className="relative mb-8">
            <div className="absolute left-0 top-1/2 h-px w-full bg-gradient-to-r from-transparent via-[#0d9488]/30 to-transparent"></div>
            <h2 className="relative inline-block bg-[#0f172a] pr-6 text-2xl font-bold text-white">Може също да харесате</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((product) => (
              <div key={product.id} className="transform transition-transform hover:scale-105">
                <a href={`/product/${product.id}`} className="block">
                  <div className="bg-[#0f172a]/80 backdrop-blur-md rounded-xl overflow-hidden border border-white/10 h-full">
                    <div className="aspect-square overflow-hidden">
                      <img
                        src={product.image || "/placeholder.svg"}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="text-white font-medium line-clamp-1">{product.name}</h3>
                      <p className="text-[#0d9488] font-bold mt-2">{product.price.toFixed(2)} лв.</p>
                    </div>
                  </div>
                </a>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
