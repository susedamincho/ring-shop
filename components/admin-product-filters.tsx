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

  // Fetch categories and brands on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [fetchedCategories, fetchedBrands] = await Promise.all([getCategories(), getBrands()])
        setCategories(fetchedCategories)
        setBrands(fetchedBrands)
      } catch (error) {
        console.error("Error fetching filter data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Update search term and notify parent component
  const handleSearchChange = (e) => {
    const value = e.target.value
    setSearchTerm(value)

    // Debounce search to avoid too many updates
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
    // Combine all filters
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

    // Call the provided onFilterChange function
    if (typeof onFilterChange === "function") {
      onFilterChange(filters)
    }
  }

  const clearFilters = () => {
    setSearchTerm("")
    setSelectedCategories([])
    setSelectedBrands([])
    setPriceRange({ min: "", max: "" })

    // Apply cleared filters
    applyFilters({ search: "", categories: [], brands: [], priceRange: { min: null, max: null } })
  }

  return (
    <div className="flex items-center gap-2">
      <Input placeholder="Search products..." value={searchTerm} onChange={handleSearchChange} className="w-[250px]" />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <Filter className="mr-2 h-4 w-4" />
            Filter
            {(selectedCategories.length > 0 || selectedBrands.length > 0 || priceRange.min || priceRange.max) && (
              <span className="ml-1 rounded-full bg-primary w-5 h-5 text-xs flex items-center justify-center text-primary-foreground">
                {selectedCategories.length + selectedBrands.length + (priceRange.min || priceRange.max ? 1 : 0)}
              </span>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56">
          <DropdownMenuLabel>Filter Products</DropdownMenuLabel>
          <DropdownMenuSeparator />

          <div className="p-2">
            <h4 className="mb-2 text-sm font-medium">Price Range</h4>
            <div className="flex items-center gap-2">
              <Input placeholder="Min" name="min" value={priceRange.min} onChange={handlePriceChange} className="h-8" />
              <span>-</span>
              <Input placeholder="Max" name="max" value={priceRange.max} onChange={handlePriceChange} className="h-8" />
            </div>
          </div>

          <DropdownMenuSeparator />
          <DropdownMenuLabel>Categories</DropdownMenuLabel>

          {loading ? (
            <div className="px-2 py-1 text-sm">Loading categories...</div>
          ) : categories.length === 0 ? (
            <div className="px-2 py-1 text-sm">No categories available</div>
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
          <DropdownMenuLabel>Brands</DropdownMenuLabel>

          {loading ? (
            <div className="px-2 py-1 text-sm">Loading brands...</div>
          ) : brands.length === 0 ? (
            <div className="px-2 py-1 text-sm">No brands available</div>
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
              Apply
            </Button>
            <Button size="sm" variant="outline" className="w-full" onClick={clearFilters}>
              Clear
            </Button>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
