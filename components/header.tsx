"use client"

import type React from "react"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, Search, ShoppingBag, User, X, LogOut, Package, Bell } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useCart } from "@/components/cart-provider"
import { useAuth } from "@/components/auth-provider"
import MobileNav from "@/components/mobile-nav"
import CartSheet from "@/components/cart-sheet"
import { getCategories, type Category } from "@/lib/firebase/categories"
import { getStoreSettings } from "@/lib/firebase/settings"
import { Badge } from "@/components/ui/badge"

interface NavItem {
  label: string
  href: string
}

export default function Header() {
  const pathname = usePathname()
  const { cart } = useCart()
  const { user, isAdmin, signOut } = useAuth()

  const [searchOpen, setSearchOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [storeInfo, setStoreInfo] = useState<any>(null)
  const [scrolled, setScrolled] = useState(false)

  const cartItemCount = cart.reduce((t, i) => t + i.quantity, 0)

  /* ------------------------------------------------------------------
   * Fetch data once at mount
   * -----------------------------------------------------------------*/
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        const [fetchedCategories, settings] = await Promise.all([getCategories(), getStoreSettings()])
        setCategories(fetchedCategories)
        setStoreInfo(settings)
        setError(null)
      } catch (err) {
        console.error("Error fetching header data:", err)
        setError("Failed to load navigation data. Please try refreshing the page.")
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()

    /* sticky‑header shading on scroll */
    const handleScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  /* ------------------------------------------------------------------
   * Build nav list – only categories that have featured === true
   * Memoised so we don’t recalc on every rerender
   * -----------------------------------------------------------------*/
  const navItems: NavItem[] = useMemo(() => {
    // show defaults while loading or on error
    const defaults: NavItem[] = [
      { label: "New Phones", href: "/products?condition=New" },
      {
        label: "Refurbished",
        href: "/products?condition=Refurbished,Like%20New,Excellent,Good",
      },
      { label: "Accessories", href: "/categories" },
      { label: "Deals", href: "/products?onSale=true" },
    ]

    if (isLoading || error) return defaults

    const featured = categories.filter((c) => c.featured)
    if (!featured.length) return defaults

    /* map <Category> → <NavItem> */
    const items = featured.map((cat) => ({
      label: cat.name,
      href: `/category/${cat.slug}`,
    }))

    // optional extra links
    items.push({ label: "Всички категории", href: "/categories" })

    return items
  }, [categories, isLoading, error])

  /* ------------------------------------------------------------------*/

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchTerm.trim()) {
      window.location.href = `/products?search=${encodeURIComponent(searchTerm)}`
    }
  }

  return (
    <header
      className={`sticky top-0 z-50 w-full text-white transition-all duration-300 ${scrolled ? "bg-[#0f172a]/90 backdrop-blur-md shadow-sm" : "bg-[#0f172a]"
        }`}
    >
      <div className="container px-4 md:px-6 mx-auto">
        <div className="flex h-16 items-center justify-between">
          {/* ------------------------------------------------------------------
           *  Left:  Logo + nav
           * -----------------------------------------------------------------*/}
          <div className="flex items-center">
            {/* mobile drawer trigger */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] sm:w-[400px]">
                <MobileNav navItems={navItems} categories={categories} />
              </SheetContent>
            </Sheet>

            {/* logo */}
            <Link href="/" className="mr-6 flex items-center space-x-2">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0d9488] to-[#0f172a] flex items-center justify-center text-white font-bold text-lg">
                RS
              </div>
              <span className="text-xl font-bold hidden sm:inline-block">{storeInfo?.storeName || "PhoneStore"}</span>
            </Link>

            {/* desktop nav */}
            <nav className="hidden md:flex items-center space-x-8 text-sm font-medium">
              {isLoading ? (
                /* skeletons */
                <>
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
                  ))}
                </>
              ) : (
                navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`transition-colors hover:text-[#0d9488] ${pathname === item.href ? "text-[#0d9488] font-semibold" : ""
                      }`}
                  >
                    {item.label}
                  </Link>
                ))
              )}
            </nav>
          </div>

          {/* ------------------------------------------------------------------
           *  Right:  search + account + cart
           * -----------------------------------------------------------------*/}
          <div className="flex items-center space-x-4">
            {/* search */}
            {searchOpen ? (
              <form onSubmit={handleSearch} className="relative">
                <Input
                  type="search"
                  placeholder="Search products..."
                  className="w-[200px] md:w-[300px] rounded-full pr-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  autoFocus
                />
                <Button type="submit" variant="ghost" size="icon" className="absolute right-0 top-0 h-full">
                  <Search className="h-4 w-4" />
                  <span className="sr-only">Search</span>
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-8 top-0 h-full"
                  onClick={() => setSearchOpen(false)}
                >
                  <X className="h-4 w-4" />
                  <span className="sr-only">Close search</span>
                </Button>
              </form>
            ) : (
              <Button variant="ghost" size="icon" onClick={() => setSearchOpen(true)}>
                <Search className="h-5 w-5" />
                <span className="sr-only">Търсене</span>
              </Button>
            )}

            {/* account dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <User className="h-5 w-5" />
                  <span className="sr-only">акаунт</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-64 rounded-xl border border-[#0d9488]/20 bg-[#0f172a] text-white p-0 shadow-lg"
              >
                {user ? (
                  <>
                    <div className="p-4 border-b border-[#0d9488]/20">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#0d9488] to-[#0f172a] flex items-center justify-center">
                          <User className="h-5 w-5" />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-medium">{user.name}</span>
                          <span className="text-xs text-gray-400">{user.email}</span>
                        </div>
                      </div>
                    </div>
                    <div className="p-2">
                      <Link
                        href="/account"
                        className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm hover:bg-[#0d9488]/10 transition-colors"
                      >
                        <User className="h-4 w-4 text-[#0d9488]" />
                        <span>Account</span>
                      </Link>
                      <Link
                        href="/account/orders"
                        className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm hover:bg-[#0d9488]/10 transition-colors"
                      >
                        <Package className="h-4 w-4 text-[#0d9488]" />
                        <span>Orders</span>
                      </Link>
                      <Link
                        href="/notifications"
                        className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm hover:bg-[#0d9488]/10 transition-colors"
                      >
                        <Bell className="h-4 w-4 text-[#0d9488]" />
                        <span>Notifications</span>
                      </Link>
                      {isAdmin && (
                        <Link
                          href="/admin"
                          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm hover:bg-[#0d9488]/10 transition-colors"
                        >
                          <Package className="h-4 w-4 text-[#0d9488]" />
                          <span>Admin Dashboard</span>
                        </Link>
                      )}
                    </div>
                    <div className="border-t border-[#0d9488]/20 p-2">
                      <button
                        onClick={signOut}
                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Излезте</span>
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="p-3 space-y-2">
                    <Link
                      href="/login"
                      className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#0d9488] px-3 py-2 text-sm font-medium text-white hover:bg-[#0d9488]/90 transition-colors"
                    >
                      Вход
                    </Link>
                    <Link
                      href="/register"
                      className="flex w-full items-center justify-center gap-2 rounded-lg border border-[#0d9488]/50 bg-transparent px-3 py-2 text-sm font-medium text-white hover:bg-[#0d9488]/10 transition-colors"
                    >
                     Създаване на акаунт
                    </Link>
                  </div>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* cart */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <ShoppingBag className="h-5 w-5" />
                  {cartItemCount > 0 && (
                    <Badge className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#0d9488] text-[10px] font-medium text-white p-0 min-w-0">
                      {cartItemCount}
                    </Badge>
                  )}
                  <span className="sr-only">Отворете количката</span>
                </Button>
              </SheetTrigger>
              <SheetContent className="w-full m-0 p-0 sm:max-w-md">
                <CartSheet />
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  )
}
