"use client"

import { useState } from "react"
import { Filter, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function AdminOrderFilters() {
  const [searchTerm, setSearchTerm] = useState("")
  const [dateRange, setDateRange] = useState({ from: "", to: "" })
  const [paymentStatus, setPaymentStatus] = useState("")

  const handleDateChange = (e) => {
    const { name, value } = e.target
    setDateRange((prev) => ({ ...prev, [name]: value }))
  }

  const applyFilters = () => {
    // In a real app, this would update the URL or trigger a data fetch
    console.log({
      searchTerm,
      dateRange,
      paymentStatus,
    })
  }

  const clearFilters = () => {
    setSearchTerm("")
    setDateRange({ from: "", to: "" })
    setPaymentStatus("")
  }

  return (
    <div className="flex items-center gap-2">
      <Input
        placeholder="Search orders..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-[250px]"
      />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56">
          <DropdownMenuLabel>Filter Orders</DropdownMenuLabel>
          <DropdownMenuSeparator />

          <div className="p-2">
            <h4 className="mb-2 text-sm font-medium">Date Range</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <Input
                  type="date"
                  placeholder="From"
                  name="from"
                  value={dateRange.from}
                  onChange={handleDateChange}
                  className="h-8"
                />
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <Input
                  type="date"
                  placeholder="To"
                  name="to"
                  value={dateRange.to}
                  onChange={handleDateChange}
                  className="h-8"
                />
              </div>
            </div>
          </div>

          <DropdownMenuSeparator />
          <div className="p-2">
            <h4 className="mb-2 text-sm font-medium">Payment Status</h4>
            <Select value={paymentStatus} onValueChange={setPaymentStatus}>
              <SelectTrigger className="h-8">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="refunded">Refunded</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DropdownMenuSeparator />
          <div className="p-2 flex gap-2">
            <Button size="sm" className="w-full" onClick={applyFilters}>
              Apply
            </Button>
            <Button size="sm" variant="outline" className="w-full" onClick={clearFilters}>
              Clear
            </Button>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
