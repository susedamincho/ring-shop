"use client"

import type React from "react"
import { Inter } from "next/font/google"
import { usePathname } from "next/navigation"

import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { CartProvider } from "@/components/cart-provider"
import { AuthProvider } from "@/components/auth-provider"
import { SettingsProvider } from "@/components/settings-provider"
import { Toaster } from "@/components/ui/toaster"
import ProtectedRoute from "@/components/protected-route"

const inter = Inter({ subsets: ["latin"] })

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAdminRoute = pathname?.startsWith("/admin")

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          <AuthProvider>
            <SettingsProvider>
              <CartProvider>
                {isAdminRoute ? (
                  <ProtectedRoute adminOnly>{children}</ProtectedRoute>
                ) : (
                  <div className="relative flex min-h-screen flex-col">
                    <Header />
                    <main className="flex-1">{children}</main>
                    <Footer />
                  </div>
                )}
                <Toaster />
              </CartProvider>
            </SettingsProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
