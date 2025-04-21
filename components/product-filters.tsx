"use client"

import { useEffect, useState } from "react"
import {
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation"
import {
  Check,
  ChevronDown,
  ChevronUp,
  Filter,
  Sliders,
  X,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"

import { getCategories, type Category } from "@/lib/firebase/categories"
import { getBrands, type Brand } from "@/lib/firebase/brands"
import {
  getConditions,
  getStorageOptions,
  getCarriers,
  getColors,
  type AttributeItem,
} from "@/lib/firebase/attributes"

import { cn } from "@/lib/utils"

/* ------------------------------------------------------------------ */
/*  props & helpers                                                   */
/* ------------------------------------------------------------------ */

interface ProductFiltersProps {
  categoryId?: string
}
type Price = [number, number]

/* ------------------------------------------------------------------ */
/*  component                                                         */
/* ------------------------------------------------------------------ */

export default function ProductFilters({ categoryId }: ProductFiltersProps) {
  /* ----------------------------------------------------  routing  -- */
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  /* ----------------------------------------------------  state  ---- */
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // fetched data
  const [categories, setCategories] = useState<Category[]>([])
  const [brands, setBrands] = useState<Brand[]>([])
  const [conditions, setConditions] = useState<AttributeItem[]>([])
  const [storageOptions, setStorageOptions] = useState<AttributeItem[]>([])
  const [carriers, setCarriers] = useState<AttributeItem[]>([])
  const [colors, setColors] = useState<AttributeItem[]>([])

  // selected values (from URL or UI)
  const [priceRange, setPriceRange] = useState<Price>([0, 2000])
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedBrands, setSelectedBrands] = useState<string[]>([])
  const [selectedConditions, setSelectedConditions] = useState<string[]>([])
  const [selectedStorage, setSelectedStorage] = useState<string[]>([])
  const [selectedCarriers, setSelectedCarriers] = useState<string[]>([])
  const [selectedColors, setSelectedColors] = useState<string[]>([])

  // ui toggles
  const [mobileOpen, setMobileOpen] = useState(false)
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    price: true,
    category: true,
    brand: true,
    condition: true,
    storage: true,
    carrier: true,
    color: true,
  })

  /* ----------------------------------------------------  helpers -- */
  const toggleSection = (key: string) =>
    setExpanded((p) => ({ ...p, [key]: !p[key] }))

  /* ----------------------------------------------------  read URL -- */
  // brand|condition|… query helpers (lower‑level portion of first file)
  const q = (key: string) => searchParams.get(key)?.split(",") || []
  const minPriceQ = searchParams.get("minPrice")
  const maxPriceQ = searchParams.get("maxPrice")

  /* ----------------------------------------------------  fetch  ---- */
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        const [
          c,
          b,
          cond,
          sto,
          car,
          col,
        ] = await Promise.all([
          getCategories(),
          getBrands(),
          getConditions(),
          getStorageOptions(),
          getCarriers(),
          getColors(),
        ])
        setCategories(c)
        setBrands(b)
        setConditions(cond)
        setStorageOptions(sto)
        setCarriers(car)
        setColors(col)
        setError(null)
      } catch (e) {
        console.error(e)
        setError("Failed to load filters")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [categoryId])

  /* ----------------------------------------------------  init opts from URL  ---- */
  useEffect(() => {
    setSelectedCategories(q("categories"))
    setSelectedBrands(q("brands"))
    setSelectedConditions(q("conditions"))
    setSelectedStorage(q("storage"))
    setSelectedCarriers(q("carriers"))
    setSelectedColors(q("colors"))

    if (minPriceQ || maxPriceQ) {
      setPriceRange([
        minPriceQ ? Number(minPriceQ) : priceRange[0],
        maxPriceQ ? Number(maxPriceQ) : priceRange[1],
      ])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

  /* ----------------------------------------------------  apply filter helpers  ---- */
  const setQueryArray = (key: string, arr: string[]) => {
    const params = new URLSearchParams(searchParams.toString())
    arr.length ? params.set(key, arr.join(",")) : params.delete(key)
    router.push(`${pathname}?${params.toString()}`)
  }

  const toggleItem = (key: string, value: string, current: string[], setter: any) => {
    const next = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value]
    setter(next)
    setQueryArray(key, next)
  }

  const updatePrice = (range: Price) => {
    setPriceRange(range)
    const params = new URLSearchParams(searchParams.toString())
    range[0] > 0 ? params.set("minPrice", range[0].toString()) : params.delete("minPrice")
    range[1] < 2000 ? params.set("maxPrice", range[1].toString()) : params.delete("maxPrice")
    router.push(`${pathname}?${params.toString()}`)
  }

  const clearAll = () => router.push(pathname)

  /* ------------------------------------------------------------------ */
  /*  derived                                                     */
  /* ------------------------------------------------------------------ */
  const activeCount =
    selectedCategories.length +
    selectedBrands.length +
    selectedConditions.length +
    selectedStorage.length +
    selectedCarriers.length +
    selectedColors.length +
    (minPriceQ || maxPriceQ ? 1 : 0)

  const hasActive = activeCount > 0

  /* ------------------------------------------------------------------ */
  /*  loading / error skeletons                                    */
  /* ------------------------------------------------------------------ */
  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-10 bg-gray-200 dark:bg-gray-800 rounded-md" />
        <div className="h-40 bg-gray-200 dark:bg-gray-800 rounded-md" />
        <div className="h-40 bg-gray-200 dark:bg-gray-800 rounded-md" />
      </div>
    )
  }
  if (error)
    return (
      <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400 rounded-md">
        {error}
      </div>
    )

  /* ------------------------------------------------------------------ */
  /*  UI builder helpers (desktop & mobile reuse)                       */
  /* ------------------------------------------------------------------ */
  type SectionProps = {
    id: string
    title: string
    items: string[] | AttributeItem[] | Category[] | Brand[]
    current: string[]
    onToggle: (v: string) => void
    itemLabel?: (v: any) => string
    renderColorDot?: boolean
  }

  const Section = ({
    id,
    title,
    items,
    current,
    onToggle,
    itemLabel = (v: any) => v.name ?? v,
    renderColorDot = false,
  }: SectionProps) => (
    <>
      <div
        className="flex items-center justify-between cursor-pointer"
        onClick={() => toggleSection(id)}
      >
        <h3 className="text-sm font-medium text-white">{title}</h3>
        {expanded[id] ? (
          <ChevronUp className="h-4 w-4 text-gray-400" />
        ) : (
          <ChevronDown className="h-4 w-4 text-gray-400" />
        )}
      </div>

      {expanded[id] && (
        <div
          className={cn(
            "mt-4 space-y-2",
            id === "brand" || id === "category" ? "max-h-48 overflow-y-auto pr-2 custom-scrollbar" : "",
          )}
        >
          {items.map((item: any) => {
            const value = (item.id ?? item) as string
            const label = itemLabel(item)
            const checked = current.includes(value)
            return (
              <div
                key={value}
                className={cn(
                  "flex items-center w-full rounded-md px-2 py-1.5 cursor-pointer transition-colors",
                  checked ? "bg-[#0d9488]/20 text-white" : "hover:bg-gray-800/50 text-gray-300",
                )}
                onClick={() => onToggle(value)}
              >
                <div
                  className={cn(
                    "w-4 h-4 rounded-sm border flex items-center justify-center mr-2",
                    checked ? "bg-[#0d9488] border-[#0d9488]" : "border-gray-600",
                  )}
                >
                  {checked && <Check className="h-3 w-3 text-white" />}
                </div>
                {renderColorDot && (
                  <span
                    className="inline-block w-4 h-4 rounded-full mr-2 border border-gray-600"
                    style={{ backgroundColor: label.toLowerCase() }}
                  ></span>
                )}
                <span className="text-sm">{label}</span>
              </div>
            )
          })}
        </div>
      )}
    </>
  )

  /* ------------------------------------------------------------------ */
  /*  mobile drawer                                                     */
  /* ------------------------------------------------------------------ */
  const MobileDrawer = () => (
    <div className="lg:hidden">
      <Button
        variant="outline"
        className="flex items-center gap-2 bg-white/10 backdrop-blur-md border-gray-200/20 hover:bg-white/20 text-white"
        onClick={() => setMobileOpen(true)}
      >
        <Filter className="h-4 w-4" />
        Filters
        {hasActive && (
          <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#0d9488] text-xs text-white">
            {activeCount}
          </span>
        )}
      </Button>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative ml-auto flex h-full w-full max-w-xs flex-col overflow-y-auto bg-[#0f172a] py-4 pb-12 shadow-xl">
            {/* header */}
            <div className="flex items-center justify-between px-4">
              <h2 className="text-lg font-medium text-white flex items-center gap-2">
                <Sliders className="h-5 w-5 text-[#0d9488]" />
                Filters
              </h2>
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/10"
                onClick={() => setMobileOpen(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* clear‑all */}
            {hasActive && (
              <div className="flex justify-end px-4 mt-2">
                <Button
                  variant="link"
                  className="text-[#0d9488] text-sm p-0 h-auto"
                  onClick={clearAll}
                >
                  Clear all
                </Button>
              </div>
            )}

            {/* body */}
            <div className="mt-4 border-t border-gray-700/50 px-4">
              <div className="py-6 space-y-6">
                {/* price */}
                <div>
                  <div
                    className="flex items-center justify-between cursor-pointer"
                    onClick={() => toggleSection("price")}
                  >
                    <h3 className="text-sm font-medium text-white">Price Range</h3>
                    {expanded.price ? (
                      <ChevronUp className="h-4 w-4 text-gray-400" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-gray-400" />
                    )}
                  </div>
                  {expanded.price && (
                    <div className="mt-4 space-y-4">
                      <Slider
                        defaultValue={priceRange}
                        min={0}
                        max={2000}
                        step={10}
                        value={priceRange}
                        onValueChange={(v) => setPriceRange(v as Price)}
                        onValueCommit={updatePrice}
                        className="mt-6"
                      />
                      <div className="flex items-center justify-between">
                        <div className="rounded-md border text-white border-gray-700/50 bg-gray-800/50 px-3 py-1.5">
                          ${priceRange[0]}
                        </div>
                        <div className="rounded-md border border-gray-700/50 bg-gray-800/50 px-3 py-1.5">
                          ${priceRange[1]}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* category */}
                <Section
                  id="category"
                  title="Category"
                  items={categories}
                  current={selectedCategories}
                  onToggle={(v) =>
                    toggleItem("categories", v, selectedCategories, setSelectedCategories)
                  }
                  itemLabel={(c: Category) => c.name}
                />

                {/* brand */}
                <Section
                  id="brand"
                  title="Brand"
                  items={brands}
                  current={selectedBrands}
                  onToggle={(v) =>
                    toggleItem("brands", v, selectedBrands, setSelectedBrands)
                  }
                  itemLabel={(b: Brand) => b.name}
                />

                {/* condition */}
                <Section
                  id="condition"
                  title="Condition"
                  items={conditions}
                  current={selectedConditions}
                  onToggle={(v) =>
                    toggleItem("conditions", v, selectedConditions, setSelectedConditions)
                  }
                  itemLabel={(i: AttributeItem) => i.name}
                />

                {/* storage */}
                <Section
                  id="storage"
                  title="Storage"
                  items={storageOptions}
                  current={selectedStorage}
                  onToggle={(v) =>
                    toggleItem("storage", v, selectedStorage, setSelectedStorage)
                  }
                  itemLabel={(i: AttributeItem) => i.name}
                />

                {/* carrier */}
                <Section
                  id="carrier"
                  title="Carrier"
                  items={carriers}
                  current={selectedCarriers}
                  onToggle={(v) =>
                    toggleItem("carriers", v, selectedCarriers, setSelectedCarriers)
                  }
                  itemLabel={(i: AttributeItem) => i.name}
                />

                {/* colors */}
                <Section
                  id="color"
                  title="Color"
                  items={colors}
                  current={selectedColors}
                  onToggle={(v) =>
                    toggleItem("colors", v, selectedColors, setSelectedColors)
                  }
                  itemLabel={(i: AttributeItem) => i.name}
                  renderColorDot
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )

  /* ------------------------------------------------------------------ */
  /*  desktop panel                                                     */
  /* ------------------------------------------------------------------ */
  const DesktopPanel = () => (
    <div className="hidden lg:block">
      <div className="bg-[#0f172a]/80 backdrop-blur-lg border border-white/10 rounded-xl p-5 shadow-lg">
        {/* header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-white flex items-center gap-2">
            <Sliders className="h-5 w-5 text-[#0d9488]" />
            Filters
          </h2>
          {hasActive && (
            <Button
              variant="link"
              className="text-[#0d9488] text-sm p-0 h-auto"
              onClick={clearAll}
            >
              Clear all
            </Button>
          )}
        </div>

        {/* active chips */}
        {hasActive && (
          <div className="mb-4 pb-4 border-b border-gray-700/50">
            {/* each chip */}
            <div className="flex flex-wrap gap-2">
              {selectedCategories.map((id) => {
                const cat = categories.find((c) => c.id === id)
                if (!cat) return null
                return (
                  <Chip
                    key={id}
                    label={cat.name}
                    onRemove={() =>
                      toggleItem(
                        "categories",
                        id,
                        selectedCategories,
                        setSelectedCategories,
                      )
                    }
                  />
                )
              })}
              {selectedBrands.map((id) => {
                const brand = brands.find((b) => b.id === id)
                if (!brand) return null
                return (
                  <Chip
                    key={id}
                    label={brand.name}
                    onRemove={() =>
                      toggleItem("brands", id, selectedBrands, setSelectedBrands)
                    }
                  />
                )
              })}
              {selectedConditions.map((c) => (
                <Chip
                  key={c}
                  label={c}
                  onRemove={() =>
                    toggleItem(
                      "conditions",
                      c,
                      selectedConditions,
                      setSelectedConditions,
                    )
                  }
                />
              ))}
              {selectedStorage.map((s) => (
                <Chip
                  key={s}
                  label={s}
                  onRemove={() =>
                    toggleItem("storage", s, selectedStorage, setSelectedStorage)
                  }
                />
              ))}
              {selectedCarriers.map((c) => (
                <Chip
                  key={c}
                  label={c}
                  onRemove={() =>
                    toggleItem(
                      "carriers",
                      c,
                      selectedCarriers,
                      setSelectedCarriers,
                    )
                  }
                />
              ))}
              {selectedColors.map((c) => (
                <Chip
                  key={c}
                  label={c}
                  renderColor
                  onRemove={() =>
                    toggleItem("colors", c, selectedColors, setSelectedColors)
                  }
                />
              ))}
              {(minPriceQ || maxPriceQ) && (
                <Chip
                  label={`$${minPriceQ || 0} – $${maxPriceQ || 2000}`}
                  onRemove={() => {
                    const params = new URLSearchParams(searchParams.toString())
                    params.delete("minPrice")
                    params.delete("maxPrice")
                    router.push(`${pathname}?${params.toString()}`)
                  }}
                />
              )}
            </div>
          </div>
        )}

        {/* sections */}
        {/* price */}
        <div className="py-4 border-b border-gray-700/50">
          <div
            className="flex items-center justify-between cursor-pointer"
            onClick={() => toggleSection("price")}
          >
            <h3 className="text-sm font-medium text-white">Price Range</h3>
            {expanded.price ? (
              <ChevronUp className="h-4 w-4 text-gray-400" />
            ) : (
              <ChevronDown className="h-4 w-4 text-gray-400" />
            )}
          </div>
          {expanded.price && (
            <div className="mt-4 space-y-4">
              <Slider
                defaultValue={priceRange}
                min={0}
                max={2000}
                step={10}
                value={priceRange}
                onValueChange={(v) => setPriceRange(v as Price)}
                onValueCommit={updatePrice}
                className="mt-6"
              />
              <div className="flex items-center justify-between">
                <div className="rounded-md border border-gray-700/50 bg-gray-800/50 px-3 py-1.5">
                  <span className="text-white">${priceRange[0]}</span>
                </div>
                <div className="rounded-md border border-gray-700/50 bg-gray-800/50 px-3 py-1.5">
                  <span className="text-white">${priceRange[1]}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* category */}
        <div className="py-4 border-b border-gray-700/50">
          <Section
            id="category"
            title="Category"
            items={categories}
            current={selectedCategories}
            onToggle={(v) =>
              toggleItem("categories", v, selectedCategories, setSelectedCategories)
            }
            itemLabel={(c: Category) => c.name}
          />
        </div>

        {/* brand */}
        <div className="py-4 border-b border-gray-700/50">
          <Section
            id="brand"
            title="Brand"
            items={brands}
            current={selectedBrands}
            onToggle={(v) =>
              toggleItem("brands", v, selectedBrands, setSelectedBrands)
            }
            itemLabel={(b: Brand) => b.name}
          />
        </div>

        {/* condition */}
        <div className="py-4 border-b border-gray-700/50">
          <Section
            id="condition"
            title="Condition"
            items={conditions}
            current={selectedConditions}
            onToggle={(v) =>
              toggleItem("conditions", v, selectedConditions, setSelectedConditions)
            }
            itemLabel={(i: AttributeItem) => i.name}
          />
        </div>

        {/* storage */}
        <div className="py-4 border-b border-gray-700/50">
          <Section
            id="storage"
            title="Storage"
            items={storageOptions}
            current={selectedStorage}
            onToggle={(v) =>
              toggleItem("storage", v, selectedStorage, setSelectedStorage)
            }
            itemLabel={(i: AttributeItem) => i.name}
          />
        </div>

        {/* carrier */}
        <div className="py-4 border-b border-gray-700/50">
          <Section
            id="carrier"
            title="Carrier"
            items={carriers}
            current={selectedCarriers}
            onToggle={(v) =>
              toggleItem("carriers", v, selectedCarriers, setSelectedCarriers)
            }
            itemLabel={(i: AttributeItem) => i.name}
          />
        </div>

        {/* colors */}
        <div className="py-4">
          <Section
            id="color"
            title="Color"
            items={colors}
            current={selectedColors}
            onToggle={(v) =>
              toggleItem("colors", v, selectedColors, setSelectedColors)
            }
            itemLabel={(i: AttributeItem) => i.name}
            renderColorDot
          />
        </div>
      </div>
    </div>
  )

  /* ------------------------------------------------------------------ */
  /*  chip helper component                                             */
  /* ------------------------------------------------------------------ */
  interface ChipProps {
    label: string
    onRemove: () => void
    renderColor?: boolean
  }
  const Chip = ({ label, onRemove, renderColor }: ChipProps) => (
    <div className="flex items-center bg-[#0d9488]/20 text-[#0d9488] text-xs rounded-full px-2 py-1">
      {renderColor && (
        <span
          className="inline-block w-2 h-2 rounded-full mr-1"
          style={{ backgroundColor: label.toLowerCase() }}
        ></span>
      )}
      {label}
      <button onClick={onRemove} className="ml-1 text-[#0d9488] hover:text-white">
        <X className="h-3 w-3" />
      </button>
    </div>
  )

  /* ------------------------------------------------------------------ */
  /*  render                                                            */
  /* ------------------------------------------------------------------ */
  return (
    <>
      <MobileDrawer />
      <DesktopPanel />
    </>
  )
}
