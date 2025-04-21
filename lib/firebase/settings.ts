import { doc, getDoc, setDoc } from "firebase/firestore"
import { db } from "./config"

// Define settings types
export interface StoreSettings {
  storeName: string
  storeEmail: string
  storePhone: string
  storeAddress: string
  currency: string
  taxRate: number
  freeShippingThreshold: number
}

// Default settings
export const defaultSettings: StoreSettings = {
  storeName: "RingShop",
  storeEmail: "info@RingShop.com",
  storePhone: "+1 (555) 123-4567",
  storeAddress: "123 Fashion St, New York, NY 10001",
  currency: "USD",
  taxRate: 8,
  freeShippingThreshold: 100,
}

// Get store settings
export async function getStoreSettings(): Promise<StoreSettings> {
  try {
    const settingsDoc = await getDoc(doc(db, "settings", "store"))

    if (settingsDoc.exists()) {
      return settingsDoc.data() as StoreSettings
    } else {
      // If no settings exist, create default settings
      await setDoc(doc(db, "settings", "store"), defaultSettings)
      return defaultSettings
    }
  } catch (error) {
    console.error("Error getting store settings:", error)
    return defaultSettings
  }
}

// Update store settings
export async function updateStoreSettings(settings: Partial<StoreSettings>): Promise<StoreSettings> {
  try {
    const currentSettings = await getStoreSettings()
    const updatedSettings = {
      ...currentSettings,
      ...settings,
      // Ensure numeric values are stored as numbers
      taxRate: settings.taxRate !== undefined ? Number(settings.taxRate) : currentSettings.taxRate,
      freeShippingThreshold:
        settings.freeShippingThreshold !== undefined
          ? Number(settings.freeShippingThreshold)
          : currentSettings.freeShippingThreshold,
    }

    await setDoc(doc(db, "settings", "store"), updatedSettings)
    return updatedSettings
  } catch (error) {
    console.error("Error updating store settings:", error)
    throw error
  }
}

// Get email settings
export async function getEmailSettings() {
  try {
    const settingsDoc = await getDoc(doc(db, "settings", "email"))

    if (settingsDoc.exists()) {
      return settingsDoc.data()
    } else {
      return {
        emailProvider: "smtp",
        smtpHost: "smtp.example.com",
        smtpPort: "587",
        smtpUsername: "username",
        smtpPassword: "password",
        senderName: "RingShop",
        senderEmail: "noreply@RingShop.com",
        enableOrderConfirmation: true,
        enableShippingNotifications: true,
        enableMarketingEmails: true,
      }
    }
  } catch (error) {
    console.error("Error getting email settings:", error)
    throw error
  }
}

// Update email settings
export async function updateEmailSettings(settings: any) {
  try {
    await setDoc(doc(db, "settings", "email"), settings)
    return settings
  } catch (error) {
    console.error("Error updating email settings:", error)
    throw error
  }
}
