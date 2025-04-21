import { notFound } from "next/navigation"
import { Suspense } from "react"
import Link from "next/link"
import { ChevronRight } from "lucide-react"
import ProductFilters from "@/components/product-filters"
import ProductGrid from "@/components/product-grid"
import ProductsLoading from "@/components/products-loading"
import { getCategories } from "@/lib/firebase/categories"

export async function generateStaticParams() {
  try {
    const categories = await getCategories()
    return categories.map((category) => ({
      slug: category.slug,
    }))
  } catch (error) {
    console.error("Error generating static params:", error)
    return []
  }
}

interface CategoryPageProps {
  params: Promise<{
    slug: string
  }>
}

export default async function CategoryPage(props: CategoryPageProps) {
  const params = await props.params
  const slug = params.slug
  let category = null
  let error = null

  try {
    // Fetch all categories
    const categories = await getCategories()

    // Find the current category by slug
    category = categories.find((cat) => cat.slug === slug)
  } catch (err) {
    error = "Failed to load category. Please try again later."
    console.error("Error loading category:", err)
  }

  if (error) {
    return (
      <div className="container px-4 md:px-6 py-8 md:py-12">
        <div className="text-center py-12 bg-red-500/10 rounded-xl border border-red-500/20">
          <p className="text-lg text-red-500">{error}</p>
        </div>
      </div>
    )
  }

  if (!category) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0f172a] to-[#0f172a]/95">
      <div className="container px-4 md:px-6 py-8 md:py-12">
        {/* Breadcrumb */}
        <nav className="flex mb-6 text-sm text-gray-400">
          <ol className="flex items-center space-x-1">
            <li>
              <Link href="/" className="hover:text-[#0d9488]">
                Начало
              </Link>
            </li>
            <li className="flex items-center space-x-1">
              <ChevronRight className="h-4 w-4" />
              <Link href="/categories" className="hover:text-[#0d9488]">
              Категории
              </Link>
            </li>
            <li className="flex items-center space-x-1">
              <ChevronRight className="h-4 w-4" />
              <span className="text-white">{category.name}</span>
            </li>
          </ol>
        </nav>

        {/* Category Header */}
        <div className="mb-8 relative overflow-hidden rounded-xl bg-[#0f172a]/80 backdrop-blur-lg border border-white/10 p-6">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#0d9488]/80 via-[#0d9488] to-[#0d9488]/80"></div>
          <h1 className="text-3xl font-bold text-white mb-2">{category.name}</h1>
          {category.description ? <p className="text-gray-300 max-w-3xl">{category.description}</p> : null}
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <aside className="w-full lg:w-64 shrink-0">
            <Suspense fallback={<ProductsLoading />}>
              <ProductFilters categoryId={category.id} />
            </Suspense>
          </aside>

          {/* Main Content */}
          <div className="flex-1">
            <Suspense fallback={<ProductsLoading />}>
              <ProductGrid categoryId={category.id} />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  )
}
