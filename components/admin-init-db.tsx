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
import { RefreshCw } from "lucide-react"

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
  const [dbStatus, setDbStatus] = useState({
    categories: 0,
    brands: 0,
    conditions: 0,
    storageOptions: 0,
    carriers: 0,
    colors: 0,
  })
  const [statusChecked, setStatusChecked] = useState(false)

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

      const categoriesSnapshot = await getDocs(collection(db, "categories"))
      const brandsSnapshot = await getDocs(collection(db, "brands"))
      const conditionsSnapshot = await getDocs(collection(db, "conditions"))
      const storageOptionsSnapshot = await getDocs(collection(db, "storageOptions"))
      const carriersSnapshot = await getDocs(collection(db, "carriers"))
      const colorsSnapshot = await getDocs(collection(db, "colors"))

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
        title: "Статус проверен",
        description: "Базата данни е проверена успешно.",
      })
    } catch (error) {
      console.error("Error checking database status:", error)
      toast({
        title: "Грешка",
        description: "Неуспешна проверка на базата данни.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCheckboxChange = (item: keyof typeof selectedItems) => {
    setSelectedItems({ ...selectedItems, [item]: !selectedItems[item] })
  }

  const initializeDatabase = async () => {
    try {
      setLoading(true)
      let itemsAdded = 0

      if (selectedItems.categories && dbStatus.categories === 0) {
        for (const category of initialPhoneCategories) {
          await addDoc(collection(db, "categories"), { ...category, createdAt: serverTimestamp() })
          itemsAdded++
        }
      }

      if (selectedItems.brands && dbStatus.brands === 0) {
        for (const brand of initialPhoneBrands) {
          await addDoc(collection(db, "brands"), { ...brand, createdAt: serverTimestamp() })
          itemsAdded++
        }
      }

      if (selectedItems.conditions && dbStatus.conditions === 0) {
        await initializeAttributeItems("conditions", initialConditions)
        itemsAdded += initialConditions.length
      }

      if (selectedItems.storageOptions && dbStatus.storageOptions === 0) {
        await initializeAttributeItems("storageOptions", initialStorageOptions)
        itemsAdded += initialStorageOptions.length
      }

      if (selectedItems.carriers && dbStatus.carriers === 0) {
        await initializeAttributeItems("carriers", initialCarriers)
        itemsAdded += initialCarriers.length
      }

      if (selectedItems.colors && dbStatus.colors === 0) {
        await initializeAttributeItems("colors", initialColors)
        itemsAdded += initialColors.length
      }

      toast({
        title: itemsAdded > 0 ? "Успех" : "Без промени",
        description:
          itemsAdded > 0
            ? `Добавени ${itemsAdded} нови елемента в базата данни.`
            : "Няма нужда от добавяне – всичко вече съществува.",
      })

      await checkDatabaseStatus()
    } catch (error) {
      console.error("Error initializing database:", error)
      toast({
        title: "Грешка",
        description: "Неуспешна инициализация на базата данни.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Инициализация на база данни</h2>
        <Button onClick={checkDatabaseStatus} disabled={loading}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Провери статуса
        </Button>
      </div>

      <Alert>
        <AlertTitle>Статус на базата данни</AlertTitle>
        <AlertDescription>
          {statusChecked ? (
            <div className="space-y-2">
              <p>Текущо състояние на базата данни:</p>
              <ul className="list-disc pl-4">
                <li>Категории: {dbStatus.categories} записа</li>
                <li>Марки: {dbStatus.brands} записа</li>
                <li>Състояния: {dbStatus.conditions} записа</li>
                <li>Памет: {dbStatus.storageOptions} записа</li>
                <li>Оператори: {dbStatus.carriers} записа</li>
                <li>Цветове: {dbStatus.colors} записа</li>
              </ul>
            </div>
          ) : (
            <p>Натиснете "Провери статуса", за да видите текущото състояние.</p>
          )}
        </AlertDescription>
      </Alert>

      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="categories"
            checked={selectedItems.categories}
            onCheckedChange={() => handleCheckboxChange("categories")}
            disabled={dbStatus.categories > 0}
          />
          <Label htmlFor="categories">Категории за телефони ({dbStatus.categories} записа)</Label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="brands"
            checked={selectedItems.brands}
            onCheckedChange={() => handleCheckboxChange("brands")}
            disabled={dbStatus.brands > 0}
          />
          <Label htmlFor="brands">Марки за телефони ({dbStatus.brands} записа)</Label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="conditions"
            checked={selectedItems.conditions}
            onCheckedChange={() => handleCheckboxChange("conditions")}
            disabled={dbStatus.conditions > 0}
          />
          <Label htmlFor="conditions">Състояния ({dbStatus.conditions} записа)</Label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="storageOptions"
            checked={selectedItems.storageOptions}
            onCheckedChange={() => handleCheckboxChange("storageOptions")}
            disabled={dbStatus.storageOptions > 0}
          />
          <Label htmlFor="storageOptions">Памет ({dbStatus.storageOptions} записа)</Label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="carriers"
            checked={selectedItems.carriers}
            onCheckedChange={() => handleCheckboxChange("carriers")}
            disabled={dbStatus.carriers > 0}
          />
          <Label htmlFor="carriers">Оператори ({dbStatus.carriers} записа)</Label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="colors"
            checked={selectedItems.colors}
            onCheckedChange={() => handleCheckboxChange("colors")}
            disabled={dbStatus.colors > 0}
          />
          <Label htmlFor="colors">Цветове ({dbStatus.colors} записа)</Label>
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={initializeDatabase} disabled={loading || !statusChecked}>
          Инициализирай избраните елементи
        </Button>
      </div>
    </div>
  )
}
