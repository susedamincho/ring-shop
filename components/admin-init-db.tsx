"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { collection, addDoc, getDocs, serverTimestamp } from "firebase/firestore"
import { db } from "@/lib/firebase/config"
import { initializeAttributeItems } from "@/lib/firebase/attributes"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle2, RefreshCw } from "lucide-react"

// Initial categories to seed the database
const initialCategories = [
  {
    name: "Tops",
    slug: "tops",
    description: "T-shirts, hoodies, sweaters, and more",
  },
  {
    name: "Bottoms",
    slug: "bottoms",
    description: "Pants, shorts, skirts, and more",
  },
  {
    name: "Footwear",
    slug: "footwear",
    description: "Sneakers, boots, sandals, and more",
  },
  {
    name: "Accessories",
    slug: "accessories",
    description: "Hats, bags, jewelry, and more",
  },
  {
    name: "Outerwear",
    slug: "outerwear",
    description: "Jackets, coats, and more",
  },
]

// Initial brands to seed the database
const initialBrands = [
  {
    name: "StreetCore",
    slug: "streetcore",
    description: "Urban essentials with a modern twist",
  },
  {
    name: "UrbanEdge",
    slug: "urbanedge",
    description: "Cutting-edge streetwear for the fashion-forward",
  },
  {
    name: "TechWear",
    slug: "techwear",
    description: "Functional clothing with technical fabrics",
  },
  {
    name: "MetroStyle",
    slug: "metrostyle",
    description: "Sophisticated urban fashion",
  },
  {
    name: "CityBlend",
    slug: "cityblend",
    description: "Versatile pieces for city living",
  },
]

// Initial phone brands
const initialPhoneBrands = [
  { name: "Apple", slug: "apple", description: "iPhone and iOS devices" },
  { name: "Samsung", slug: "samsung", description: "Galaxy and Android devices" },
  { name: "Google", slug: "google", description: "Pixel phones and Android devices" },
  { name: "Xiaomi", slug: "xiaomi", description: "Mi and Redmi phones" },
  { name: "OnePlus", slug: "oneplus", description: "OnePlus smartphones" },
]

// Initial phone categories
const initialPhoneCategories = [
  { name: "Smartphones", slug: "smartphones", description: "Modern touchscreen mobile phones" },
  { name: "Feature Phones", slug: "feature-phones", description: "Basic mobile phones with limited features" },
  { name: "Refurbished", slug: "refurbished", description: "Professionally restored phones" },
  { name: "Accessories", slug: "accessories", description: "Phone accessories and add-ons" },
]

// Initial conditions
const initialConditions = [
  { name: "New" },
  { name: "Like New" },
  { name: "Excellent" },
  { name: "Good" },
  { name: "Fair" },
  { name: "Poor" },
]

// Initial storage options
const initialStorageOptions = [
  { name: "16GB" },
  { name: "32GB" },
  { name: "64GB" },
  { name: "128GB" },
  { name: "256GB" },
  { name: "512GB" },
  { name: "1TB" },
]

// Initial carriers
const initialCarriers = [
  { name: "Unlocked" },
  { name: "AT&T" },
  { name: "Verizon" },
  { name: "T-Mobile" },
  { name: "Sprint" },
  { name: "Other" },
]

// Initial colors
const initialColors = [
  { name: "Black" },
  { name: "White" },
  { name: "Silver" },
  { name: "Gold" },
  { name: "Blue" },
  { name: "Red" },
]

export default function AdminInitDb() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("clothing")
  const [dbStatus, setDbStatus] = useState({
    categories: 0,
    brands: 0,
    conditions: 0,
    storageOptions: 0,
    carriers: 0,
    colors: 0,
  })
  const [statusChecked, setStatusChecked] = useState(false)

  // Selected items to initialize
  const [selectedItems, setSelectedItems] = useState({
    categories: true,
    brands: true,
    conditions: false,
    storageOptions: false,
    carriers: false,
    colors: false,
  })

  const checkDatabaseStatus = async () => {
    try {
      setLoading(true)
      setStatusChecked(false)

      // Check if categories already exist
      const categoriesCollection = collection(db, "categories")
      const categoriesSnapshot = await getDocs(categoriesCollection)

      // Check if brands already exist
      const brandsCollection = collection(db, "brands")
      const brandsSnapshot = await getDocs(brandsCollection)

      // Check if attributes already exist
      const conditionsCollection = collection(db, "conditions")
      const conditionsSnapshot = await getDocs(conditionsCollection)

      const storageOptionsCollection = collection(db, "storageOptions")
      const storageOptionsSnapshot = await getDocs(storageOptionsCollection)

      const carriersCollection = collection(db, "carriers")
      const carriersSnapshot = await getDocs(carriersCollection)

      const colorsCollection = collection(db, "colors")
      const colorsSnapshot = await getDocs(colorsCollection)

      setDbStatus({
        categories: categoriesSnapshot.size,
        brands: brandsSnapshot.size,
        conditions: conditionsSnapshot.size,
        storageOptions: storageOptionsSnapshot.size,
        carriers: carriersSnapshot.size,
        colors: colorsSnapshot.size,
      })

      setStatusChecked(true)
      toast({
        title: "Status Check Complete",
        description: "Database status has been updated.",
      })
    } catch (error) {
      console.error("Error checking database status:", error)
      toast({
        title: "Error",
        description: "Failed to check database status. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCheckboxChange = (item: keyof typeof selectedItems) => {
    setSelectedItems({
      ...selectedItems,
      [item]: !selectedItems[item],
    })
  }

  const initializeDatabase = async () => {
    try {
      setLoading(true)

      let itemsAdded = 0

      // Add categories if selected and needed
      if (selectedItems.categories && dbStatus.categories === 0) {
        const categoriesCollection = collection(db, "categories")
        const categoriesToAdd = activeTab === "clothing" ? initialCategories : initialPhoneCategories

        for (const category of categoriesToAdd) {
          await addDoc(categoriesCollection, {
            ...category,
            createdAt: serverTimestamp(),
          })
          itemsAdded++
        }
      }

      // Add brands if selected and needed
      if (selectedItems.brands && dbStatus.brands === 0) {
        const brandsCollection = collection(db, "brands")
        const brandsToAdd = activeTab === "clothing" ? initialBrands : initialPhoneBrands

        for (const brand of brandsToAdd) {
          await addDoc(brandsCollection, {
            ...brand,
            createdAt: serverTimestamp(),
          })
          itemsAdded++
        }
      }

      // Add conditions if selected and needed
      if (selectedItems.conditions && dbStatus.conditions === 0) {
        await initializeAttributeItems("conditions", initialConditions)
        itemsAdded += initialConditions.length
      }

      // Add storage options if selected and needed
      if (selectedItems.storageOptions && dbStatus.storageOptions === 0) {
        await initializeAttributeItems("storageOptions", initialStorageOptions)
        itemsAdded += initialStorageOptions.length
      }

      // Add carriers if selected and needed
      if (selectedItems.carriers && dbStatus.carriers === 0) {
        await initializeAttributeItems("carriers", initialCarriers)
        itemsAdded += initialCarriers.length
      }

      // Add colors if selected and needed
      if (selectedItems.colors && dbStatus.colors === 0) {
        await initializeAttributeItems("colors", initialColors)
        itemsAdded += initialColors.length
      }

      if (itemsAdded > 0) {
        toast({
          title: "Success",
          description: `Successfully added ${itemsAdded} items to the database.`,
        })
      } else {
        toast({
          title: "No Changes Made",
          description: "No new items were added to the database.",
        })
      }

      // Refresh status after initialization
      await checkDatabaseStatus()
    } catch (error) {
      console.error("Error initializing database:", error)
      toast({
        title: "Error",
        description: "Failed to initialize database. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Database Initialization</h2>
        <Button onClick={checkDatabaseStatus} disabled={loading}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Check Status
        </Button>
      </div>

      <Alert>
        <AlertTitle>Database Status</AlertTitle>
        <AlertDescription>
          {statusChecked ? (
            <div className="space-y-2">
              <p>Current database status:</p>
              <ul className="list-disc pl-4">
                <li>Categories: {dbStatus.categories} items</li>
                <li>Brands: {dbStatus.brands} items</li>
                <li>Conditions: {dbStatus.conditions} items</li>
                <li>Storage Options: {dbStatus.storageOptions} items</li>
                <li>Carriers: {dbStatus.carriers} items</li>
                <li>Colors: {dbStatus.colors} items</li>
              </ul>
            </div>
          ) : (
            <p>Click "Check Status" to see current database status.</p>
          )}
        </AlertDescription>
      </Alert>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="clothing">Clothing</TabsTrigger>
          <TabsTrigger value="phones">Phones</TabsTrigger>
        </TabsList>

        <TabsContent value="clothing" className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="categories"
                checked={selectedItems.categories}
                onCheckedChange={() => handleCheckboxChange("categories")}
                disabled={dbStatus.categories > 0}
              />
              <Label htmlFor="categories">Categories ({dbStatus.categories} items)</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="brands"
                checked={selectedItems.brands}
                onCheckedChange={() => handleCheckboxChange("brands")}
                disabled={dbStatus.brands > 0}
              />
              <Label htmlFor="brands">Brands ({dbStatus.brands} items)</Label>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="phones" className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="categories"
                checked={selectedItems.categories}
                onCheckedChange={() => handleCheckboxChange("categories")}
                disabled={dbStatus.categories > 0}
              />
              <Label htmlFor="categories">Phone Categories ({dbStatus.categories} items)</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="brands"
                checked={selectedItems.brands}
                onCheckedChange={() => handleCheckboxChange("brands")}
                disabled={dbStatus.brands > 0}
              />
              <Label htmlFor="brands">Phone Brands ({dbStatus.brands} items)</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="conditions"
                checked={selectedItems.conditions}
                onCheckedChange={() => handleCheckboxChange("conditions")}
                disabled={dbStatus.conditions > 0}
              />
              <Label htmlFor="conditions">Conditions ({dbStatus.conditions} items)</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="storageOptions"
                checked={selectedItems.storageOptions}
                onCheckedChange={() => handleCheckboxChange("storageOptions")}
                disabled={dbStatus.storageOptions > 0}
              />
              <Label htmlFor="storageOptions">Storage Options ({dbStatus.storageOptions} items)</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="carriers"
                checked={selectedItems.carriers}
                onCheckedChange={() => handleCheckboxChange("carriers")}
                disabled={dbStatus.carriers > 0}
              />
              <Label htmlFor="carriers">Carriers ({dbStatus.carriers} items)</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="colors"
                checked={selectedItems.colors}
                onCheckedChange={() => handleCheckboxChange("colors")}
                disabled={dbStatus.colors > 0}
              />
              <Label htmlFor="colors">Colors ({dbStatus.colors} items)</Label>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end">
        <Button onClick={initializeDatabase} disabled={loading || !statusChecked}>
          Initialize Selected Items
        </Button>
      </div>
    </div>
  )
}
