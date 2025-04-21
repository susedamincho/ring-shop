import Link from "next/link"
import { getCategories } from "@/lib/firebase/categories"
import { ChevronRight, Grid3X3, Layers } from "lucide-react"

export default async function CategoriesPage() {
  let categories = []
  let error = null

  try {
    categories = await getCategories()
  } catch (err) {
    error = "Failed to load categories. Please try again later."
    console.error("Error loading categories:", err)
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
              <span className="text-white">Категории</span>
            </li>
          </ol>
        </nav>

        {/* Header */}
        <div className="mb-10 relative overflow-hidden rounded-xl bg-[#0f172a]/80 backdrop-blur-lg border border-white/10 p-6">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#0d9488]/80 via-[#0d9488] to-[#0d9488]/80"></div>
          <div className="flex items-center gap-3 mb-2">
            <Layers className="h-6 w-6 text-[#0d9488]" />
            <h1 className="text-3xl font-bold text-white">Всички категории</h1>
          </div>
          <p className="text-gray-300 max-w-3xl">
          Разгледайте нашата пълна колекция от продуктови категории, за да намерите точно това, което търсите.
          </p>
        </div>

        {error ? (
          <div className="text-center py-12 bg-red-500/10 rounded-xl border border-red-500/20">
            <p className="text-lg text-red-500">{error}</p>
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-12 bg-[#0f172a]/80 backdrop-blur-lg border border-white/10 rounded-xl">
            <Grid3X3 className="h-12 w-12 text-gray-500 mx-auto mb-4" />
            <p className="text-lg text-gray-400">Няма намерени категории</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/category/${category.slug}`}
                className="group block bg-[#0f172a]/80 backdrop-blur-lg border border-white/10 rounded-xl overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-[#0d9488]/10 hover:border-[#0d9488]/30"
              >
                <div className="aspect-square w-full overflow-hidden bg-gradient-to-br from-gray-900 to-gray-800 relative">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-6xl font-bold text-[#0d9488]/20 group-hover:text-[#0d9488]/30 transition-colors">
                      {category.name.charAt(0)}
                    </span>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-white group-hover:text-[#0d9488] transition-colors">
                    {category.name}
                  </h3>
                  {category.description && (
                    <p className="mt-2 text-sm text-gray-400 line-clamp-2">{category.description}</p>
                  )}
                  <div className="mt-4 flex items-center text-[#0d9488] text-sm font-medium">
                    <span>Виж артикули</span>
                    <ChevronRight className="h-4 w-4 ml-1 transform group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
