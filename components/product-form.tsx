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
    image: DEFAULT_PLACEHOLDER_IMAGE, // Default image URL
    discount: 0,
  })
  const [imageUrl, setImageUrl] = useState("")
  const [newFeature, setNewFeature] = useState("")
  const [newAccessory, setNewAccessory] = useState("")

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch all necessary data in parallel
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

        // If editing, populate form with product data
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
        console.error("Error fetching data:", error)
        toast({
          title: "Error",
          description: "Failed to load data. Please try again.",
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
          title: "Product updated",
          description: "The phone has been updated successfully.",
        })
      } else {
        await addProduct(productData, imageUrl)
        toast({
          title: "Product added",
          description: "The new phone has been added successfully.",
        })
      }

      router.push("/admin/products")
    } catch (error: any) {
      console.error("Error saving product:", error)
      setError(error.message || "Failed to save product. Please try again.")
      toast({
        title: "Error",
        description: "Failed to save product. Please try again.",
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
        <CardTitle>{productId ? "Edit Phone" : "Add New Phone"}</CardTitle>
        <CardDescription>
          {productId ? "Update the phone details below." : "Fill in the details to list a new phone."}
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">Phone Name</Label>
            <Input id="name" name="name" value={formData.name} onChange={handleInputChange} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
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
              <Label htmlFor="price">Price ($)</Label>
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
              <Label htmlFor="inventory">Inventory</Label>
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
              <Label htmlFor="brand">Brand</Label>
              <Select value={formData.brand} onValueChange={(value) => setFormData({ ...formData, brand: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a brand" />
                </SelectTrigger>
                <SelectContent>
                  {brands.length === 0 ? (
                    <div className="p-2 text-sm text-muted-foreground">
                      No brands available.
                      <a href="/admin/brands" className="text-primary hover:underline ml-1">
                        Add brands
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
              <Label htmlFor="model">Model</Label>
              <Input
                id="model"
                name="model"
                value={formData.model}
                onChange={handleInputChange}
                placeholder="e.g. iPhone 13 Pro"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="condition">Condition</Label>
              <Select
                value={formData.condition}
                onValueChange={(value) => setFormData({ ...formData, condition: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select condition" />
                </SelectTrigger>
                <SelectContent>
                  {conditions.length === 0 ? (
                    <div className="p-2 text-sm text-muted-foreground">
                      No conditions available.
                      <a href="/admin/attributes" className="text-primary hover:underline ml-1">
                        Add conditions
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
              <Label htmlFor="storage">Storage</Label>
              <Select value={formData.storage} onValueChange={(value) => setFormData({ ...formData, storage: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select storage" />
                </SelectTrigger>
                <SelectContent>
                  {storageOptions.length === 0 ? (
                    <div className="p-2 text-sm text-muted-foreground">
                      No storage options available.
                      <a href="/admin/attributes" className="text-primary hover:underline ml-1">
                        Add storage options
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
              <Label htmlFor="carrier">Carrier</Label>
              <Select value={formData.carrier} onValueChange={(value) => setFormData({ ...formData, carrier: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select carrier" />
                </SelectTrigger>
                <SelectContent>
                  {carriers.length === 0 ? (
                    <div className="p-2 text-sm text-muted-foreground">
                      No carriers available.
                      <a href="/admin/attributes" className="text-primary hover:underline ml-1">
                        Add carriers
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
              <Label htmlFor="color">Color</Label>
              <Select value={formData.color} onValueChange={(value) => setFormData({ ...formData, color: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select color" />
                </SelectTrigger>
                <SelectContent>
                  {colors.length === 0 ? (
                    <div className="p-2 text-sm text-muted-foreground">
                      No colors available.
                      <a href="/admin/attributes" className="text-primary hover:underline ml-1">
                        Add colors
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
              <Label htmlFor="imeiNumber">IMEI Number</Label>
              <Input
                id="imeiNumber"
                name="imeiNumber"
                value={formData.imeiNumber}
                onChange={handleInputChange}
                placeholder="15-17 digit IMEI number"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="batteryHealth">Battery Health</Label>
              <Input
                id="batteryHealth"
                name="batteryHealth"
                value={formData.batteryHealth}
                onChange={handleInputChange}
                placeholder="e.g. 92%"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="imageUrl">Product Image URL</Label>
            <Input
              id="imageUrl"
              name="imageUrl"
              type="url"
              value={imageUrl}
              onChange={handleImageUrlChange}
              placeholder="https://example.com/image.jpg"
            />
            <p className="text-xs text-muted-foreground">
              Enter a direct URL to your product image. Leave empty to use a placeholder image.
            </p>
            {formData.image && (
              <div className="mt-2">
                <img
                  src={formData.image || "/placeholder.svg"}
                  alt="Product preview"
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
            <Label>Specifications</Label>
            <div className="flex gap-2">
              <Input
                value={newFeature}
                onChange={(e) => setNewFeature(e.target.value)}
                placeholder="Add a specification"
              />
              <Button type="button" onClick={handleAddFeature}>
                Add
              </Button>
            </div>
            {formData.features.length > 0 && (
              <div className="mt-2 space-y-2">
                {formData.features.map((feature, index) => (
                  <div key={index} className="flex items-center justify-between bg-muted p-2 rounded-md">
                    <span>{feature}</span>
                    <Button type="button" variant="ghost" size="sm" onClick={() => handleRemoveFeature(index)}>
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label>Included Accessories</Label>
            <div className="flex gap-2">
              <Input
                value={newAccessory}
                onChange={(e) => setNewAccessory(e.target.value)}
                placeholder="Add an accessory"
              />
              <Button type="button" onClick={handleAddAccessory}>
                Add
              </Button>
            </div>
            {formData.accessories.length > 0 && (
              <div className="mt-2 space-y-2">
                {formData.accessories.map((accessory, index) => (
                  <div key={index} className="flex items-center justify-between bg-muted p-2 rounded-md">
                    <span>{accessory}</span>
                    <Button type="button" variant="ghost" size="sm" onClick={() => handleRemoveAccessory(index)}>
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label>Categories</Label>
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
                No categories found.{" "}
                <a href="/admin/categories" className="text-primary hover:underline">
                  Add some categories
                </a>{" "}
                first.
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
              Featured product (will be displayed on homepage)
            </Label>
          </div>

          <div className="space-y-2">
            <Label htmlFor="discount">Discount (%)</Label>
            <Input
              id="discount"
              name="discount"
              type="number"
              placeholder="0"
              value={formData.discount}
              onChange={(e) => setFormData({ ...formData, discount: Number(e.target.value) })}
            />
            <p className="text-sm text-muted-foreground">Discount percentage off original price (optional)</p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" type="button" onClick={() => router.push("/admin/products")}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {productId ? "Update Phone" : "Add Phone"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
