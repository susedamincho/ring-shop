import { Suspense } from "react"
import Link from "next/link"
import { ArrowRight, CheckCircle, Star } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { getProducts } from "@/lib/firebase/products"
import { getCategories } from "@/lib/firebase/categories"
import ProductSkeleton from "@/components/product-skeleton"
import CategorySkeleton from "@/components/category-skeleton"
import HeroSkeleton from "@/components/hero-skeleton"
import TestimonialSkeleton from "@/components/testimonial-skeleton"

// Convert Firestore Timestamps to plain number (milliseconds) or string
function toPlainTimestamp(timestamp: any) {
  if (!timestamp || typeof timestamp.toMillis !== "function") {
    return null
  }
  return timestamp.toMillis()
}

export default async function Home() {
  // Fetch data in parallel for better performance
  const [featuredProducts, newProducts, refurbishedProducts, categoriesRaw] = await Promise.all(
    [
      // Featured products for hero section
      getProducts({
        limit: 1,
        featured: true,
      }).catch((error) => {
        console.error("Error fetching featured products:", error)
        return []
      }),

      // New products
      getProducts({
        limit: 4,
        sortBy: "createdAt",
        sortDirection: "desc",
      }).catch((error) => {
        console.error("Error fetching new products:", error)
        return []
      }),

      // Refurbished products
      getProducts({
        limit: 4,
        condition: ["Refurbished", "Like New", "Excellent", "Good"],
        sortBy: "price",
        sortDirection: "asc",
      }).catch((error) => {
        console.error("Error fetching refurbished products:", error)
        return []
      }),

      // Categories for navigation
      getCategories().catch((error) => {
        console.error("Error fetching categories:", error)
        return []
      }),

    ],
  )

  // Process featured product for hero section
  const heroProduct =
    featuredProducts.length > 0
      ? {
        id: featuredProducts[0].id,
        name: featuredProducts[0].name,
        description: featuredProducts[0].description,
        price: featuredProducts[0].price,
        image: featuredProducts[0].image,
        discount: featuredProducts[0].discount && featuredProducts[0].discount > 0 ? featuredProducts[0].discount : 0,
      }
      : null

  // Process categories
  const categories = categoriesRaw
    .filter((c) => c.featured) // <-- the important line
    .map((c) => ({
      ...c,
      createdAt: toPlainTimestamp(c.createdAt),
      image: c.image || null,
    }))

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative isolate overflow-hidden">
        {/* decorative blobs */}
        <div
          className="absolute -z-10 inset-0 bg-gradient-to-br from-[#0f172a] via-[#10273d] to-[#1e293b]"
        />
        <div className="absolute -z-10 top-0 left-1/2 -translate-x-1/2 h-[120%] w-[120%] bg-[radial-gradient(ellipse_at_center,rgba(13,148,136,0.25),transparent_60%)]" />
        {/* grid */}
        <div className="container px-4 md:px-6 mx-auto py-20 lg:py-32 grid lg:grid-cols-12 gap-10 items-center">
          {/* ❶ image (on large screens it’s left, on mobile it drops below text) */}
          <div className="order-2 lg:order-1 lg:col-span-6 flex justify-center lg:justify-start">
            <div className="relative max-w-[380px] w-full aspect-[9/16]">
              {/* background glow */}
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-teal-500/10 to-teal-500/5 blur-[60px]" />
              {/* phone image or placeholder */}
              {heroProduct?.image ? (
                <img
                  src={heroProduct.image}
                  alt={heroProduct.name}
                  className="relative z-10 object-contain w-full h-full drop-shadow-2xl rounded-3xl"
                />
              ) : (
                <div className="relative z-10 flex items-center justify-center h-full w-full rounded-3xl bg-white/5 text-5xl font-bold text-white/30">
                  {heroProduct?.name.charAt(0)}
                </div>
              )}
              {/* price pill */}
              {heroProduct && (
                <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 px-5 py-2 rounded-full backdrop-blur-lg bg-white/20 text-white/90 shadow-lg">
                  <span className="text-lg font-semibold">
                    {heroProduct.price}лв.
                  </span>
                  {heroProduct.discount > 0 && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-[#f97316]">
                      –{heroProduct.discount}%
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* ❷ text / CTA */}
          <div className="order-1 lg:order-2 lg:col-span-6 text-center lg:text-left space-y-6">
            {heroProduct?.discount > 0 && (
              <Badge className="mx-auto lg:mx-0 bg-[#0d9488]/90 text-white">
                Спести {heroProduct.discount}% Днеска
              </Badge>
            )}

            <h1 className="text-4xl md:text-5xl xl:text-6xl font-extrabold leading-tight text-white drop-shadow-md">
              {heroProduct?.name ?? "Your Next Phone"}
            </h1>

            <p className="max-w-xl mx-auto lg:mx-0 text-lg md:text-xl text-gray-300">
              {heroProduct?.description ??
                "Experience cutting‑edge performance wrapped in a stunning design."}
            </p>

            <div className="flex flex-col sm:flex-row sm:justify-center lg:justify-start gap-3 pt-4">
              {heroProduct && (
                <Link href={`/product/${heroProduct.id}`}>
                  <Button size="lg" className="bg-[#0d9488] hover:bg-[#0d9488]/90 text-white">
                  Пазарувайте сега
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              )}
              <Link href="/products">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/40 text-black hover:text-white hover:bg-white/10 backdrop-blur"
                >
                  Вижте всички телефони
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="w-full py-12 md:py-16 bg-white">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="flex flex-col items-center justify-center space-y-4 text-center mb-10">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-[#0f172a]">
              Преглед по категория
              </h2>
              <p className="max-w-[700px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Намерете точно това, което търсите
              </p>
            </div>
          </div>

          <Suspense
            fallback={
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {Array.from({ length: 4 }).map((_, i) => (
                  <CategorySkeleton key={i} />
                ))}
              </div>
            }
          >
            {categories.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {categories.slice(0, 4).map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/category/${cat.slug}`}
                    className="group"
                  >
                    <div className="flex flex-col items-center space-y-4">
                      <div className="relative w-full aspect-square overflow-hidden rounded-2xl bg-gradient-to-br from-[#0f172a]/5 to-[#0f172a]/10 p-6">
                        {cat.image ? (
                          <img
                            src={cat.image}
                            alt={cat.name}
                            className="object-contain w-full h-full group-hover:scale-110 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-[#0f172a]/20">
                            {cat.name.charAt(0)}
                          </div>
                        )}
                      </div>
                      <h3 className="text-xl font-medium text-[#0f172a] group-hover:text-[#0d9488] transition-colors">
                        {cat.name}
                      </h3>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              /* no featured categories */
              <div className="text-center py-8">
                <p className="text-gray-500">
                  В момента няма представени категории.
                </p>
                <Link href="/categories" className="mt-4 inline-block">
                  <Button className="bg-[#0f172a] hover:bg-[#0f172a]/90 text-white">
                   Преглед на всички категории
                  </Button>
                </Link>
              </div>
            )}
          </Suspense>
        </div>
      </section>

      {/* New Arrivals Section */}
      <section className="w-full py-12 md:py-16 bg-[#0f172a] text-white">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="flex flex-col items-center justify-center space-y-4 text-center mb-10">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-white">
               Нови продукти
              </h2>
              <p className="max-w-[700px] text-gray-300 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
               Най-новите и най-добри телефони
              </p>
            </div>
          </div>

          <Suspense
            fallback={
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <ProductSkeleton />
                <ProductSkeleton />
                <ProductSkeleton />
                <ProductSkeleton />
              </div>
            }
          >
            {newProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {newProducts.map((product) => (
                  <Link key={product.id} href={`/product/${product.id}`} className="group">
                    <div className="flex flex-col space-y-3 h-full">
                      <div className="relative aspect-square overflow-hidden rounded-2xl bg-white p-6 shadow-sm">
                        {product.image ? (
                          <img
                            src={product.image || "/placeholder.svg"}
                            alt={product.name}
                            className="object-contain w-full h-full group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-[#0f172a]/10">
                            {product.name?.charAt(0) || "P"}
                          </div>
                        )}
                        <Badge className="absolute top-4 right-4 bg-[#0d9488]">Ново</Badge>
                      </div>
                      <div className="space-y-1 flex-1 flex flex-col">
                        <h3 className="font-medium text-lg group-hover:text-[#0d9488] transition-colors text-white">
                          {product.name}
                        </h3>
                        <p className="text-gray-300 text-sm line-clamp-2 flex-1">
                          {product.description?.substring(0, 60)}...
                        </p>
                        <div className="flex items-center justify-between">
                          <p className="font-semibold text-white">{product.price?.toFixed(2)}лв.</p>
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`h-4 w-4 ${star <= (product.rating || 0) ? "fill-[#f97316] text-[#f97316]" : "text-gray-300"}`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-300">Няма намерени нови продукти. Моля, проверете отново по-късно.</p>
                <Link href="/products" className="mt-4 inline-block">
                  <Button className="bg-white hover:bg-white/90 text-[#0f172a]">Разгледайте всички продукти</Button>
                </Link>
              </div>
            )}
          </Suspense>

          <div className="flex justify-center mt-10">
            <Link href="/products?condition=New">
              <Button size="lg" className="bg-white hover:bg-white/90 text-[#0f172a]">
               Вижте всички нови телефони
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>


      {/* Why Choose Us Section */}
      <section className="w-full py-12 md:py-16 bg-gray-50">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="flex flex-col items-center justify-center space-y-4 text-center mb-10">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-[#0f172a]">Защо да изберете нас</h2>
              <p className="max-w-[700px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
               Ние се ангажираме да предоставим най-доброто изживяване
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center space-y-4 p-6 bg-[#0f172a]/10 rounded-2xl backdrop-blur-sm">
              <div className="w-16 h-16 rounded-full bg-[#0d9488] flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-white"
                >
                  <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                </svg>
              </div>
              <h3 className="text-xl font-medium text-[#0f172a]">Гарантирано качество</h3>
              <p className="text-gray-500 text-center">
              Всички наши ремонтирани телефони се подлагат на строги тестове и се доставят с 12-месечна гаранцияy.
              </p>
            </div>

            <div className="flex flex-col items-center space-y-4 p-6 bg-[#0f172a]/10 rounded-2xl backdrop-blur-sm">
              <div className="w-16 h-16 rounded-full bg-[#0d9488] flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-white"
                >
                  <circle cx="8" cy="21" r="1" />
                  <circle cx="19" cy="21" r="1" />
                  <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
                </svg>
              </div>
              <h3 className="text-xl font-medium text-[#0f172a]">Безплатна доставка</h3>
              <p className="text-gray-500 text-center">
               Насладете се на безплатна и бърза доставка за всички поръчки над 75 лева в цялата страна.
              </p>
            </div>

            <div className="flex flex-col items-center space-y-4 p-6 bg-[#0f172a]/10 rounded-2xl backdrop-blur-sm">
              <div className="w-16 h-16 rounded-full bg-[#0d9488] flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-white"
                >
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
                </svg>
              </div>
              <h3 className="text-xl font-medium text-[#0f172a]">Сигурни плащания</h3>
              <p className="text-gray-500 text-center">
               Пазарувайте с увереност, като използвате нашите сигурни методи на плащане и криптирано плащане.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
