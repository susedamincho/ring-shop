// Файл: ProductForm.tsx

"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/components/ui/use-toast"
import { addProduct, updateProduct, getProductById, Product } from "@/lib/firebase/products"
import { getCategories } from "@/lib/firebase/categories"
import { getBrands } from "@/lib/firebase/brands"
import { getConditions, getStorageOptions, getCarriers, getColors } from "@/lib/firebase/attributes"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

const DEFAULT_PLACEHOLDER_IMAGE = "/placeholder.svg"

interface ProductFormData {
  name: string;
  description: string;
  price: string;
  inventory: string;
  brand: string;
  model: string;
  storage: string;
  condition: string;
  carrier: string;
  color: string;
  imeiNumber: string;
  batteryHealth: string;
  categoryIds: string[];
  featured: boolean;
  features: string[];
  accessories: string[];
  additionalImages: string[];
  rating: number;
  image: string;
  discount: number;
}

export default function ProductForm({ productId = null }: { productId?: string | null }) {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(!!productId)
  const [categories, setCategories] = useState<any[]>([])
  const [brands, setBrands] = useState<any[]>([])
  const [conditions, setConditions] = useState<any[]>([])
  const [storageOptions, setStorageOptions] = useState<any[]>([])
  const [carriers, setCarriers] = useState<any[]>([])
  const [colors, setColors] = useState<any[]>([])
  const [error, setError] = useState("")
  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    description: "",
    price: "",
    inventory: "",
    brand: "",
    model: "",
    storage: "",
    condition: "",
    carrier: "",
    color: "",
    imeiNumber: "",
    batteryHealth: "",
    categoryIds: [],
    featured: false,
    features: [],
    accessories: [],
    additionalImages: [],
    rating: 0,
    image: DEFAULT_PLACEHOLDER_IMAGE,
    discount: 0,
  })
  const [imageUrl, setImageUrl] = useState("")
  const [newFeature, setNewFeature] = useState("")
  const [newAccessory, setNewAccessory] = useState("")

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [
          fetchedCategories,
          fetchedBrands,
          fetchedConditions,
          fetchedStorageOptions,
          fetchedCarriers,
          fetchedColors,
          productData,
        ] = await Promise.all([
          getCategories(),
          getBrands(),
          getConditions(),
          getStorageOptions(),
          getCarriers(),
          getColors(),
          productId ? getProductById(productId) : null,
        ])

        setCategories(fetchedCategories)
        setBrands(fetchedBrands)
        setConditions(fetchedConditions)
        setStorageOptions(fetchedStorageOptions)
        setCarriers(fetchedCarriers)
        setColors(fetchedColors)

        if (productData) {
          setFormData({
            name: productData.name || "",
            description: productData.description || "",
            price: productData.price?.toString() || "",
            inventory: productData.inventory?.toString() || "",
            brand: productData.brand || "",
            model: productData.model || "",
            storage: productData.storage || "",
            condition: productData.condition || "",
            carrier: productData.carrier || "",
            color: productData.color || "",
            imeiNumber: productData.imeiNumber || "",
            batteryHealth: productData.batteryHealth || "",
            categoryIds: productData.categoryIds || [] as string[],
            featured: productData.featured || false,
            features: productData.features || [] as string[],
            accessories: productData.accessories || [] as string[],
            additionalImages: productData.additionalImages || [] as string[],
            rating: productData.rating || 0,
            image: productData.image || DEFAULT_PLACEHOLDER_IMAGE,
            discount: productData.discount || 0,
          })
          setImageUrl(productData.image || "")
        }
      } catch (error) {
        console.error("Грешка при зареждане на данните:", error)
        toast({
          title: "Грешка",
          description: "Неуспешно зареждане на данните. Моля, опитайте отново.",
          variant: "destructive",
        })
      } finally {
        setInitialLoading(false)
      }
    }

    fetchData()
  }, [productId, toast])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    })
  }

  const handleCategoryChange = (categoryId: string) => {
    setFormData((prev) => {
      const categoryIds = prev.categoryIds.includes(categoryId)
        ? prev.categoryIds.filter((id) => id !== categoryId)
        : [...prev.categoryIds, categoryId]

      return {
        ...prev,
        categoryIds,
      }
    })
  }

  const handleImageUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value
    setImageUrl(url)
    setFormData({
      ...formData,
      image: url || DEFAULT_PLACEHOLDER_IMAGE,
    })
  }

  const handleAddFeature = () => {
    if (newFeature.trim()) {
      setFormData({
        ...formData,
        features: [...formData.features, newFeature.trim()],
      })
      setNewFeature("")
    }
  }

  const handleRemoveFeature = (index: number) => {
    const updatedFeatures = [...formData.features]
    updatedFeatures.splice(index, 1)
    setFormData({
      ...formData,
      features: updatedFeatures,
    })
  }

  const handleAddAccessory = () => {
    if (newAccessory.trim()) {
      setFormData({
        ...formData,
        accessories: [...formData.accessories, newAccessory.trim()],
      })
      setNewAccessory("")
    }
  }

  const handleRemoveAccessory = (index: number) => {
    const updatedAccessories = [...formData.accessories]
    updatedAccessories.splice(index, 1)
    setFormData({
      ...formData,
      accessories: updatedAccessories,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const productData = {
        ...formData,
        price: Number.parseFloat(formData.price),
        inventory: Number.parseInt(formData.inventory, 10),
      }

      if (productId) {
        await updateProduct(productId, productData, imageUrl)
        toast({
          title: "Продуктът е обновен",
          description: "Телефонът беше успешно обновен.",
        })
      } else {
        await addProduct(productData, imageUrl)
        toast({
          title: "Продуктът е добавен",
          description: "Новият телефон беше успешно добавен.",
        })
      }

      router.push("/admin/products")
    } catch (error: any) {
      console.error("Грешка при записване на продукта:", error)
      setError(error.message || "Неуспешен запис. Опитайте отново.")
      toast({
        title: "Грешка",
        description: "Неуспешен запис. Опитайте отново.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center h-full py-24">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{productId ? "Редактиране на телефон" : "Добави нов телефон"}</CardTitle>
        <CardDescription>
          {productId ? "Обнови детайлите на телефона по-долу." : "Попълни детайлите за новия телефон."}
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertTitle>Грешка</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">Име на телефона</Label>
            <Input id="name" name="name" value={formData.name} onChange={handleInputChange} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Описание</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Цена (лв)</Label>
              <Input
                id="price"
                name="price"
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="inventory">Наличност</Label>
              <Input
                id="inventory"
                name="inventory"
                type="number"
                min="0"
                value={formData.inventory}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="brand">Марка</Label>
              <Select value={formData.brand} onValueChange={(value) => setFormData({ ...formData, brand: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Избери марка" />
                </SelectTrigger>
                <SelectContent>
                  {brands.length === 0 ? (
                    <div className="p-2 text-sm text-muted-foreground">
                      Няма налични марки.
                      <a href="/admin/brands" className="text-primary hover:underline ml-1">
                        Добави марка
                      </a>
                    </div>
                  ) : (
                    brands.map((brand) => (
                      <SelectItem key={brand.id} value={brand.name}>
                        {brand.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="model">Модел</Label>
              <Input
                id="model"
                name="model"
                value={formData.model}
                onChange={handleInputChange}
                placeholder="напр. iPhone 13 Pro"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="condition">Състояние</Label>
              <Select
                value={formData.condition}
                onValueChange={(value) => setFormData({ ...formData, condition: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Избери състояние" />
                </SelectTrigger>
                <SelectContent>
                  {conditions.length === 0 ? (
                    <div className="p-2 text-sm text-muted-foreground">
                      Няма налични състояния.
                      <a href="/admin/attributes" className="text-primary hover:underline ml-1">
                        Добави състояние
                      </a>
                    </div>
                  ) : (
                    conditions.map((condition) => (
                      <SelectItem key={condition.id} value={condition.name}>
                        {condition.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="storage">Памет</Label>
              <Select value={formData.storage} onValueChange={(value) => setFormData({ ...formData, storage: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Избери капацитет" />
                </SelectTrigger>
                <SelectContent>
                  {storageOptions.length === 0 ? (
                    <div className="p-2 text-sm text-muted-foreground">
                      Няма налични опции за памет.
                      <a href="/admin/attributes" className="text-primary hover:underline ml-1">
                        Добави памет
                      </a>
                    </div>
                  ) : (
                    storageOptions.map((storage) => (
                      <SelectItem key={storage.id} value={storage.name}>
                        {storage.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="carrier">Оператор</Label>
              <Select value={formData.carrier} onValueChange={(value) => setFormData({ ...formData, carrier: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Избери оператор" />
                </SelectTrigger>
                <SelectContent>
                  {carriers.length === 0 ? (
                    <div className="p-2 text-sm text-muted-foreground">
                      Няма налични оператори.
                      <a href="/admin/attributes" className="text-primary hover:underline ml-1">
                        Добави оператор
                      </a>
                    </div>
                  ) : (
                    carriers.map((carrier) => (
                      <SelectItem key={carrier.id} value={carrier.name}>
                        {carrier.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="color">Цвят</Label>
              <Select value={formData.color} onValueChange={(value) => setFormData({ ...formData, color: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Избери цвят" />
                </SelectTrigger>
                <SelectContent>
                  {colors.length === 0 ? (
                    <div className="p-2 text-sm text-muted-foreground">
                      Няма налични цветове.
                      <a href="/admin/attributes" className="text-primary hover:underline ml-1">
                        Добави цвят
                      </a>
                    </div>
                  ) : (
                    colors.map((color) => (
                      <SelectItem key={color.id} value={color.name}>
                        {color.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="imeiNumber">IMEI номер</Label>
              <Input
                id="imeiNumber"
                name="imeiNumber"
                value={formData.imeiNumber}
                onChange={handleInputChange}
                placeholder="15-17 цифрен IMEI номер"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="batteryHealth">Здраве на батерията</Label>
              <Input
                id="batteryHealth"
                name="batteryHealth"
                value={formData.batteryHealth}
                onChange={handleInputChange}
                placeholder="напр. 92%"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="imageUrl">URL на основно изображение</Label>
            <Input
              id="imageUrl"
              name="imageUrl"
              type="url"
              value={imageUrl}
              onChange={handleImageUrlChange}
              placeholder="https://example.com/image.jpg"
            />
            <p className="text-xs text-muted-foreground">
              Въведи директен линк към изображението. Ако не е въведен, ще се използва изображение по подразбиране.
            </p>
            {formData.image && (
              <div className="mt-2">
                <img
                  src={formData.image || DEFAULT_PLACEHOLDER_IMAGE}
                  alt="Преглед на продукта"
                  className="h-40 w-40 object-cover rounded-md border"
                  onError={(e) => {
                    e.currentTarget.src = DEFAULT_PLACEHOLDER_IMAGE
                    setFormData({
                      ...formData,
                      image: DEFAULT_PLACEHOLDER_IMAGE,
                    })
                  }}
                />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label>Спецификации</Label>
            <div className="flex gap-2">
              <Input
                value={newFeature}
                onChange={(e) => setNewFeature(e.target.value)}
                placeholder="Добави спецификация"
              />
              <Button type="button" onClick={handleAddFeature}>
                Добави
              </Button>
            </div>
            {formData.features.length > 0 && (
              <div className="mt-2 space-y-2">
                {formData.features.map((feature, index) => (
                  <div key={index} className="flex items-center justify-between bg-muted p-2 rounded-md">
                    <span>{feature}</span>
                    <Button type="button" variant="ghost" size="sm" onClick={() => handleRemoveFeature(index)}>
                      Премахни
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label>Аксесоари</Label>
            <div className="flex gap-2">
              <Input
                value={newAccessory}
                onChange={(e) => setNewAccessory(e.target.value)}
                placeholder="Добави аксесоар"
              />
              <Button type="button" onClick={handleAddAccessory}>
                Добави
              </Button>
            </div>
            {formData.accessories.length > 0 && (
              <div className="mt-2 space-y-2">
                {formData.accessories.map((accessory, index) => (
                  <div key={index} className="flex items-center justify-between bg-muted p-2 rounded-md">
                    <span>{accessory}</span>
                    <Button type="button" variant="ghost" size="sm" onClick={() => handleRemoveAccessory(index)}>
                      Премахни
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label>Категории</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
              {categories.map((category) => (
                <div key={category.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`category-${category.id}`}
                    checked={formData.categoryIds.includes(category.id)}
                    onCheckedChange={() => handleCategoryChange(category.id)}
                  />
                  <Label htmlFor={`category-${category.id}`} className="font-normal">
                    {category.name}
                  </Label>
                </div>
              ))}
            </div>
            {categories.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Няма налични категории.{" "}
                <a href="/admin/categories" className="text-primary hover:underline">
                  Добави категории
                </a>{" "}
                първо.
              </p>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="featured"
              name="featured"
              checked={formData.featured}
              onCheckedChange={(checked) => setFormData({ ...formData, featured: !!checked })}
            />
            <Label htmlFor="featured" className="font-normal">
              Показвай на начална страница
            </Label>
          </div>

          <div className="space-y-2">
            <Label htmlFor="discount">Отстъпка (%)</Label>
            <Input
              id="discount"
              name="discount"
              type="number"
              placeholder="0"
              value={formData.discount}
              onChange={(e) => setFormData({ ...formData, discount: Number(e.target.value) })}
            />
            <p className="text-sm text-muted-foreground">Процентна отстъпка от оригиналната цена (по желание)</p>
          </div>
        </CardContent>

        <CardFooter className="flex justify-between">
          <Button variant="outline" type="button" onClick={() => router.push("/admin/products")}>
            Отказ
          </Button>
          <Button type="submit" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {productId ? "Обнови телефона" : "Добави телефон"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}