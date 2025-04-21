// This file is for reference only and should be run once to set up an admin user
// It's not part of the regular application code

import { db } from "./config"
import { doc, setDoc, getDoc } from "firebase/firestore"

// Function to set up an admin user
export async function setupAdminUser(userId: string) {
  try {
    // Check if user exists
    const userDoc = await getDoc(doc(db, "users", userId))

    if (userDoc.exists()) {
      // Update user to be an admin
      await setDoc(doc(db, "users", userId), { isAdmin: true }, { merge: true })
      console.log(`User ${userId} has been set as an admin`)
    } else {
      console.error(`User ${userId} does not exist`)
    }
  } catch (error) {
    console.error("Error setting up admin user:", error)
  }
}

// Usage:
// 1. Create a regular user account through the registration form
// 2. Get the user ID from Firebase Auth console or Firestore
// 3. Call this function with the user ID to make them an admin
// setupAdminUser("user-id-here")
