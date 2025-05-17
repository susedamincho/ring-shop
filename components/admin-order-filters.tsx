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
        placeholder="Търсене на поръчки..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-[250px]"
      />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <Filter className="mr-2 h-4 w-4" />
            Филтър
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56">
          <DropdownMenuLabel>Филтриране на поръчки</DropdownMenuLabel>
          <DropdownMenuSeparator />

          <div className="p-2">
            <h4 className="mb-2 text-sm font-medium">Период</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <Input
                  type="date"
                  placeholder="От"
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
                  placeholder="До"
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
            <h4 className="mb-2 text-sm font-medium">Статус на плащане</h4>
            <Select value={paymentStatus} onValueChange={setPaymentStatus}>
              <SelectTrigger className="h-8">
                <SelectValue placeholder="Избери статус" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="paid">Платено</SelectItem>
                <SelectItem value="pending">Изчакващо</SelectItem>
                <SelectItem value="failed">Неуспешно</SelectItem>
                <SelectItem value="refunded">Възстановено</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DropdownMenuSeparator />
          <div className="p-2 flex gap-2">
            <Button size="sm" className="w-full" onClick={applyFilters}>
              Приложи
            </Button>
            <Button size="sm" variant="outline" className="w-full" onClick={clearFilters}>
              Изчисти
            </Button>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
