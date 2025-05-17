"use client"

import { useState, useEffect } from "react"
import { Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { getBrands } from "@/lib/firebase/brands"
import { getCategories } from "@/lib/firebase/categories"

export default function AdminProductFilters({ onFilterChange }) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategories, setSelectedCategories] = useState([])
  const [selectedBrands, setSelectedBrands] = useState([])
  const [priceRange, setPriceRange] = useState({ min: "", max: "" })
  const [categories, setCategories] = useState([])
  const [brands, setBrands] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [fetchedCategories, fetchedBrands] = await Promise.all([getCategories(), getBrands()])
        setCategories(fetchedCategories)
        setBrands(fetchedBrands)
      } catch (error) {
        console.error("Грешка при зареждане на филтрите:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleSearchChange = (e) => {
    const value = e.target.value
    setSearchTerm(value)

    const timeoutId = setTimeout(() => {
      applyFilters({ search: value })
    }, 300)

    return () => clearTimeout(timeoutId)
  }

  const toggleCategory = (categoryId) => {
    const newSelectedCategories = selectedCategories.includes(categoryId)
      ? selectedCategories.filter((id) => id !== categoryId)
      : [...selectedCategories, categoryId]

    setSelectedCategories(newSelectedCategories)
  }

  const toggleBrand = (brandId) => {
    const newSelectedBrands = selectedBrands.includes(brandId)
      ? selectedBrands.filter((id) => id !== brandId)
      : [...selectedBrands, brandId]

    setSelectedBrands(newSelectedBrands)
  }

  const handlePriceChange = (e) => {
    const { name, value } = e.target
    setPriceRange((prev) => ({ ...prev, [name]: value }))
  }

  const applyFilters = (additionalFilters = {}) => {
    const filters = {
      search: searchTerm,
      categories: selectedCategories,
      brands: selectedBrands,
      priceRange: {
        min: priceRange.min ? Number.parseFloat(priceRange.min) : null,
        max: priceRange.max ? Number.parseFloat(priceRange.max) : null,
      },
      ...additionalFilters,
    }

    if (typeof onFilterChange === "function") {
      onFilterChange(filters)
    }
  }

  const clearFilters = () => {
    setSearchTerm("")
    setSelectedCategories([])
    setSelectedBrands([])
    setPriceRange({ min: "", max: "" })
    applyFilters({ search: "", categories: [], brands: [], priceRange: { min: null, max: null } })
  }

  return (
    <div className="flex items-center gap-2">
      <Input
        placeholder="Търсене на продукти..."
        value={searchTerm}
        onChange={handleSearchChange}
        className="w-[250px]"
      />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <Filter className="mr-2 h-4 w-4" />
            Филтрирай
            {(selectedCategories.length > 0 || selectedBrands.length > 0 || priceRange.min || priceRange.max) && (
              <span className="ml-1 rounded-full bg-primary w-5 h-5 text-xs flex items-center justify-center text-primary-foreground">
                {selectedCategories.length + selectedBrands.length + (priceRange.min || priceRange.max ? 1 : 0)}
              </span>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56">
          <DropdownMenuLabel>Филтрирай продукти</DropdownMenuLabel>
          <DropdownMenuSeparator />

          <div className="p-2">
            <h4 className="mb-2 text-sm font-medium">Ценови диапазон</h4>
            <div className="flex items-center gap-2">
              <Input placeholder="Мин." name="min" value={priceRange.min} onChange={handlePriceChange} className="h-8" />
              <span>-</span>
              <Input placeholder="Макс." name="max" value={priceRange.max} onChange={handlePriceChange} className="h-8" />
            </div>
          </div>

          <DropdownMenuSeparator />
          <DropdownMenuLabel>Категории</DropdownMenuLabel>

          {loading ? (
            <div className="px-2 py-1 text-sm">Зареждане...</div>
          ) : categories.length === 0 ? (
            <div className="px-2 py-1 text-sm">Няма налични категории</div>
          ) : (
            categories.map((category) => (
              <DropdownMenuCheckboxItem
                key={category.id}
                checked={selectedCategories.includes(category.id)}
                onCheckedChange={() => toggleCategory(category.id)}
              >
                {category.name}
              </DropdownMenuCheckboxItem>
            ))
          )}

          <DropdownMenuSeparator />
          <DropdownMenuLabel>Марки</DropdownMenuLabel>

          {loading ? (
            <div className="px-2 py-1 text-sm">Зареждане...</div>
          ) : brands.length === 0 ? (
            <div className="px-2 py-1 text-sm">Няма налични марки</div>
          ) : (
            brands.map((brand) => (
              <DropdownMenuCheckboxItem
                key={brand.id}
                checked={selectedBrands.includes(brand.id)}
                onCheckedChange={() => toggleBrand(brand.id)}
              >
                {brand.name}
              </DropdownMenuCheckboxItem>
            ))
          )}

          <DropdownMenuSeparator />
          <div className="p-2 flex gap-2">
            <Button size="sm" className="w-full" onClick={() => applyFilters()}>
              Приложи
            </Button>
            <Button size="sm" variant="outline" className="w-full" onClick={clearFilters}>
              Изчисти
            </Button>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
