"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Facebook, Instagram, Twitter, Youtube, Mail, Phone, MapPin, ArrowRight } from "lucide-react"
import { getStoreSettings } from "@/lib/firebase/settings"
import { getCategories, Category } from "@/lib/firebase/categories"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function Footer() {
  const [storeInfo, setStoreInfo] = useState({
    storeName: "RingShop",
    storeEmail: "support@RingShop.com",
    storePhone: "1-800-123-4567",
    storeAddress: "123 Tech Street, Digital City, DC 10001",
  })
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)

        // Fetch store settings and categories in parallel
        const [settings, fetchedCategories] = await Promise.all([
          getStoreSettings().catch((error) => {
            console.error("Error fetching store settings:", error)
            return null
          }),
          getCategories().catch((error) => {
            console.error("Error fetching categories:", error)
            return []
          }),
        ])

        if (settings) {
          setStoreInfo({
            storeName: settings.storeName || "RingShop",
            storeEmail: settings.storeEmail || "support@RingShop.com",
            storePhone: settings.storePhone || "1-800-123-4567",
            storeAddress: settings.storeAddress || "123 Tech Street, Digital City, DC 10001",
          })
        }

        setCategories(fetchedCategories)
        setError(null)
      } catch (err) {
        console.error("Error fetching footer data:", err)
        setError("Failed to load footer data")
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  // Format address with line breaks
  const addressParts = storeInfo.storeAddress.split(",")

  return (
    <footer className="bg-[#0f172a] text-white">
      {/* Main Footer Content */}
      <div className="container px-4 md:px-6 py-12 mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          <div className="space-y-4">
            <Link href="/" className="inline-flex items-center space-x-2">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0d9488] to-white/20 flex items-center justify-center text-white font-bold text-lg">
                PS
              </div>
              <span className="text-xl font-bold">{storeInfo.storeName}</span>
            </Link>
            <p className="text-gray-300 text-sm">
            Вашият доверен източник за нови и обновени телефони. Гарантирано качество при всяка покупка.
            </p>
            <div className="flex space-x-4">
              <Link href="#" className="text-gray-400 hover:text-[#0d9488] transition-colors">
                <Facebook className="h-5 w-5" />
                <span className="sr-only">Facebook</span>
              </Link>
              <Link href="#" className="text-gray-400 hover:text-[#0d9488] transition-colors">
                <Instagram className="h-5 w-5" />
                <span className="sr-only">Instagram</span>
              </Link>
              <Link href="#" className="text-gray-400 hover:text-[#0d9488] transition-colors">
                <Twitter className="h-5 w-5" />
                <span className="sr-only">Twitter</span>
              </Link>
              <Link href="#" className="text-gray-400 hover:text-[#0d9488] transition-colors">
                <Youtube className="h-5 w-5" />
                <span className="sr-only">YouTube</span>
              </Link>
            </div>
          </div>
          <div>
            <h3 className="font-semibold mb-4 text-lg">Shop</h3>
            {isLoading ? (
              // Loading state for shop links
              <ul className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <li key={i} className="h-4 bg-white/10 rounded w-24 animate-pulse"></li>
                ))}
              </ul>
            ) : (
              <ul className="space-y-3 text-sm text-gray-300">
                <li>
                  <Link href="/products?condition=New" className="hover:text-[#0d9488] transition-colors">
                   Нови телефони
                  </Link>
                </li>
                <li>
                  <Link
                    href="/products?condition=Refurbished,Like%20New,Excellent,Good"
                    className="hover:text-[#0d9488] transition-colors"
                  >
                    Ремонтирани телефони
                  </Link>
                </li>
                {categories.slice(0, 3).map((category) => (
                  <li key={category.id}>
                    <Link href={`/category/${category.slug}`} className="hover:text-[#0d9488] transition-colors">
                      {category.name}
                    </Link>
                  </li>
                ))}
                <li>
                  <Link href="/products?onSale=true" className="hover:text-[#0d9488] transition-colors">
                   Сделки и оферти
                  </Link>
                </li>
              </ul>
            )}
          </div>
          <div>
            <h3 className="font-semibold mb-4 text-lg">акаунт</h3>
            <ul className="space-y-3 text-sm text-gray-300">
              <li>
                <Link href="/login" className="hover:text-[#0d9488] transition-colors">
                 Вход
                </Link>
              </li>
              <li>
                <Link href="/register" className="hover:text-[#0d9488] transition-colors">
                Създаване на акаунт
                </Link>
              </li>
              <li>
                <Link href="/account" className="hover:text-[#0d9488] transition-colors">
                 Моят акаунт
                </Link>
              </li>
              <li>
                <Link href="/account/orders" className="hover:text-[#0d9488] transition-colors">
                 История на поръчките
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4 text-lg">Свържете се с нас</h3>
            {isLoading ? (
              // Loading state for contact info
              <ul className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <li key={i} className="flex items-start space-x-3">
                    <div className="h-5 w-5 bg-white/10 rounded-full"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-white/10 rounded w-full"></div>
                      <div className="h-4 bg-white/10 rounded w-3/4"></div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <ul className="space-y-3 text-sm text-gray-300">
                <li className="flex items-start space-x-3">
                  <MapPin className="h-5 w-5 text-[#0d9488] mt-0.5" />
                  <span>
                    {addressParts.map((part, index) => (
                      <span key={index}>
                        {part.trim()}
                        {index < addressParts.length - 1 && <br />}
                      </span>
                    ))}
                  </span>
                </li>
                <li className="flex items-center space-x-3">
                  <Phone className="h-5 w-5 text-[#0d9488]" />
                  <span>{storeInfo.storePhone}</span>
                </li>
                <li className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-[#0d9488]" />
                  <span>{storeInfo.storeEmail}</span>
                </li>
                <li className="mt-4">
                  <Link href="/contact" className="inline-flex items-center text-[#0d9488] hover:underline">
                  Свържете се с нас
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </li>
              </ul>
            )}
          </div>
        </div>

        <div className="border-t border-white/10 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-sm text-gray-400">
              <p>
                © {new Date().getFullYear()} {storeInfo.storeName}. Всички права запазени.
              </p>
            </div>
            <div className="flex flex-wrap gap-4 text-sm">
              <Link href="/terms-of-service" className="text-gray-400 hover:text-[#0d9488] transition-colors">
                Условия за ползване
              </Link>
              <Link href="/privacy-policy" className="text-gray-400 hover:text-[#0d9488] transition-colors">
                Политика за поверителност
              </Link>
              <Link href="/shipping-policy" className="text-gray-400 hover:text-[#0d9488] transition-colors">
                Политика за доставка
              </Link>
              <Link href="/refund-policy" className="text-gray-400 hover:text-[#0d9488] transition-colors">
                Политика за възстановяване на средства
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
