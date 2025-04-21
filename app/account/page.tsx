"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { User, Package, CreditCard, MapPin, Bell, Settings, LogOut, ChevronRight, Shield, Heart } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/components/auth-provider"
import ProtectedRoute from "@/components/protected-route"
import AccountProfile from "@/components/account-profile"
import AccountOrders from "@/components/account-orders"
import AccountAddresses from "@/components/account-addresses"
import AccountPaymentMethods from "@/components/account-payment-methods"

export default function AccountPage() {
  const router = useRouter()
  const { user, signOut } = useAuth()
  const [activeTab, setActiveTab] = useState("profile")
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)

    return () => {
      window.removeEventListener("resize", checkMobile)
    }
  }, [])

  const menuItems = [
    { id: "profile", label: "Profile", icon: User },
    { id: "orders", label: "Orders", icon: Package },
    { id: "addresses", label: "Addresses", icon: MapPin },
    { id: "payment", label: "Payment Methods", icon: CreditCard },
  ]

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-b from-[#0f172a] to-[#1e293b] text-white">
        <div className="container px-4 md:px-6 py-8 md:py-12">
          {/* Account Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Моя акаунт</h1>
            <p className="text-gray-400">Добре дошли отново, {user?.name || "User"}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            {/* Sidebar Navigation - Desktop */}
            <div className="hidden md:block md:col-span-3 lg:col-span-2">
              <div className="bg-[#0f172a]/80 backdrop-blur-sm rounded-xl border border-white/10 shadow-xl overflow-hidden">
                <div className="p-4 border-b border-white/10">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0d9488] to-[#0f172a] flex items-center justify-center">
                      <User className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium truncate">{user?.name || "User"}</p>
                      <p className="text-xs text-gray-400 truncate">{user?.email || "user@example.com"}</p>
                    </div>
                  </div>
                </div>

                <nav className="p-2">
                  {menuItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${activeTab === item.id ? "bg-[#0d9488]/20 text-[#0d9488]" : "text-gray-300 hover:bg-white/5"
                        }`}
                    >
                      <item.icon className={`h-5 w-5 ${activeTab === item.id ? "text-[#0d9488]" : "text-gray-400"}`} />
                      <span>{item.label}</span>
                      {activeTab === item.id && <ChevronRight className="h-4 w-4 ml-auto text-[#0d9488]" />}
                    </button>
                  ))}
                </nav>

                <div className="p-2 mt-2">
                  <Button
                    variant="outline"
                    className="w-full justify-start bg-black/30 border-white/10 text-gray-300 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20"
                    onClick={signOut}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Излез
                  </Button>
                </div>
              </div>
            </div>

            {/* Mobile Tabs Navigation */}
            <div className="md:hidden w-full">
              <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid grid-cols-4 h-auto p-1 bg-[#0f172a]/80 backdrop-blur-sm rounded-xl border border-white/10">
                  <TabsTrigger
                    value="profile"
                    className="py-2 data-[state=active]:bg-[#0d9488]/20 data-[state=active]:text-[#0d9488]"
                  >
                    <User className="h-4 w-4 md:mr-2" />
                    <span className="hidden sm:inline">Профил</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="orders"
                    className="py-2 data-[state=active]:bg-[#0d9488]/20 data-[state=active]:text-[#0d9488]"
                  >
                    <Package className="h-4 w-4 md:mr-2" />
                    <span className="hidden sm:inline">Поръчки</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="addresses"
                    className="py-2 data-[state=active]:bg-[#0d9488]/20 data-[state=active]:text-[#0d9488]"
                  >
                    <MapPin className="h-4 w-4 md:mr-2" />
                    <span className="hidden sm:inline">Адреси</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="more"
                    className="py-2 data-[state=active]:bg-[#0d9488]/20 data-[state=active]:text-[#0d9488]"
                  >
                    <Settings className="h-4 w-4 md:mr-2" />
                    <span className="hidden sm:inline">Още</span>
                  </TabsTrigger>
                </TabsList>

                {/* More options dropdown for mobile */}
                {activeTab === "more" && (
                  <div className="mt-2 bg-[#0f172a]/80 backdrop-blur-sm rounded-xl border border-white/10 p-2">
                    {menuItems
                      .filter((item) => !["profile", "orders", "addresses"].includes(item.id))
                      .map((item) => (
                        <button
                          key={item.id}
                          onClick={() => setActiveTab(item.id)}
                          className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left hover:bg-white/5"
                        >
                          <item.icon className="h-5 w-5 text-gray-400" />
                          <span>{item.label}</span>
                        </button>
                      ))}
                    <Button
                      variant="outline"
                      className="w-full justify-start mt-2 border-white/10 text-gray-300 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20"
                      onClick={signOut}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Излез
                    </Button>
                  </div>
                )}
              </Tabs>
            </div>

            {/* Main Content Area */}
            <div className="md:col-span-9 lg:col-span-10">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="bg-[#0f172a]/80 backdrop-blur-sm rounded-xl border border-white/10 shadow-xl p-6"
              >
                {activeTab === "profile" && <AccountProfile />}
                {activeTab === "orders" && <AccountOrders />}
                {activeTab === "addresses" && <AccountAddresses />}
                {activeTab === "payment" && <AccountPaymentMethods />}
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
