import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

// Форматира стойността като валута (USD)
export const formatCurrency = (amount: any) => {
  return new Intl.NumberFormat("bg-BG", {
    style: "currency",
    currency: "BGN", // Може да смениш с "BGN" ако желаеш левове
  }).format(amount)
}

// Форматира дата в кратък вид (например: 18 май 2025)
export const formatShortDate = (date: any) => {
  return new Date(date).toLocaleDateString("bg-BG", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

// Генерира уникален номер за поръчка
export const generateOrderNumber = () => {
  const timestamp = Date.now().toString(36)
  const randomId = Math.random().toString(36).substring(2, 5)

  return `ПОР-${timestamp}-${randomId}` // Можеш да смениш с ORD ако искаш да остане на английски
}

// Комбинира класове и премахва дублиращи с tailwind-merge
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
