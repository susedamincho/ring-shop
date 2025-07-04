"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  BarChart3,
  LayoutDashboard,
  Package,
  Settings,
  ShoppingCart,
  Users,
  Tag,
  LogOut,
  Home,
  Briefcase,
  Smartphone,
  Sliders,
  Database,
} from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"

export default function AdminSidebar() {
  const pathname = usePathname()
  const { signOut } = useAuth()

  const isActive = (path: string) => {
    if (path === "/admin" && pathname === "/admin") {
      return true
    }
    return path !== "/admin" && pathname.startsWith(path)
  }

  const navItems = [
    { path: "/admin", label: "Табло", icon: LayoutDashboard },
    { path: "/admin/products", label: "Продукти", icon: Smartphone },
    { path: "/admin/categories", label: "Категории", icon: Tag },
    { path: "/admin/brands", label: "Марки", icon: Briefcase },
    { path: "/admin/attributes", label: "Атрибути", icon: Sliders },
    { path: "/admin/orders", label: "Поръчки", icon: ShoppingCart },
    { path: "/admin/customers", label: "Клиенти", icon: Users },
    { path: "/admin/database", label: "База данни", icon: Database },
    { path: "/admin/settings", label: "Настройки", icon: Settings },
  ]

  return (
    <div className="hidden border-r bg-muted/40 lg:block">
      <div className="flex h-full max-h-screen flex-col gap-2">
        <div className="flex h-16 items-center border-b px-6">
          <Link href="/admin" className="flex items-center gap-2 font-semibold">
            <Package className="h-6 w-6" />
            <span className="">Админ панел</span>
          </Link>
        </div>
        <div className="flex-1 overflow-auto py-2">
          <nav className="grid items-start px-4 text-sm font-medium">
            {navItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary ${
                  isActive(item.path) ? "bg-muted text-primary" : "text-muted-foreground"
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="mt-auto border-t p-4">
          <div className="grid gap-2">
            <Link href="/">
              <Button variant="outline" className="w-full justify-start">
                <Home className="mr-2 h-4 w-4" />
                Назад към магазина
              </Button>
            </Link>
            <Button variant="outline" className="w-full justify-start" onClick={signOut}>
              <LogOut className="mr-2 h-4 w-4" />
              Изход
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
