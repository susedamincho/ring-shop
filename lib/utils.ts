import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount)
}

export const formatShortDate = (date) => {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

export const generateOrderNumber = () => {
  const timestamp = Date.now().toString(36)
  const randomId = Math.random().toString(36).substring(2, 5)

  return `ORD-${timestamp}-${randomId}`
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
