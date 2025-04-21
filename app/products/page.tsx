import { Suspense } from "react"
import ProductFilters from "@/components/product-filters"
import ProductGrid from "@/components/product-grid"
import ProductsLoading from "@/components/products-loading"
import { ChevronRight } from "lucide-react"

export default function ProductsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0f172a] to-[#1e293b] text-white">
      <div className="container px-4 md:px-6 py-8 md:py-12">
        {/* Breadcrumb */}
        <div className="flex items-center text-sm text-gray-300 mb-6">
          <a href="/" className="hover:text-teal-400 transition-colors">
            Home
          </a>
          <ChevronRight className="h-4 w-4 mx-2 text-gray-500" />
          <span className="text-teal-400 font-medium">Products</span>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <aside className="w-full md:w-72 shrink-0">
            <div className="sticky top-24 bg-[#1e293b]/80 backdrop-blur-sm rounded-xl p-6 border border-gray-800 shadow-xl">
              <h1 className="text-2xl font-bold mb-6 text-white flex items-center">
                <span className="inline-block w-1.5 h-6 bg-teal-500 rounded-full mr-3"></span>
                Filters
              </h1>
              <Suspense fallback={<ProductsLoading />}>
                <ProductFilters />
              </Suspense>
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1">
            <div className="bg-[#1e293b]/80 backdrop-blur-sm rounded-xl p-6 border border-gray-800 shadow-xl mb-6">
              <h1 className="text-3xl font-bold text-white flex items-center">
                <span className="inline-block w-2 h-8 bg-teal-500 rounded-full mr-4"></span>
                Discover Our Products
              </h1>
              <p className="text-gray-300 mt-2">
               Разгледайте нашата подбрана колекция от първокласни продукти, проектирани за качество и стил.
              </p>
            </div>

            <div className="bg-[#1e293b]/80 backdrop-blur-sm rounded-xl p-6 border border-gray-800 shadow-xl">
              <Suspense fallback={<ProductsLoading />}>
                <ProductGrid />
              </Suspense>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
