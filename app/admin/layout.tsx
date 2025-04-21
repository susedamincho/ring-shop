import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"

import "../globals.css"
import AdminSidebar from "@/components/admin-sidebar"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Admin Dashboard - RingShop",
  description: "Admin dashboard for RingShop store management",
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 p-6 overflow-auto">{children}</main>
    </div>
  )
}
