"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
} from "firebase/auth"
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore"
import { auth, db } from "@/lib/firebase/config"
import { useToast } from "@/components/ui/use-toast"

type User = {
  uid: string
  email: string | null
  name: string | null
  isAdmin: boolean
  photoURL?: string | null
}

type AuthContextType = {
  user: User | null
  isAdmin: boolean
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, name: string) => Promise<void>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAdmin: false,
  loading: true,
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
  resetPassword: async () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { toast } = useToast()
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // User is signed in
        try {
          // Get additional user data from Firestore
          const userDoc = await getDoc(doc(db, "users", firebaseUser.uid))

          if (userDoc.exists()) {
            // User exists in Firestore
            const userData = userDoc.data()
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              name: firebaseUser.displayName || userData.name,
              isAdmin: userData.isAdmin || false,
              photoURL: firebaseUser.photoURL,
            })
            setIsAdmin(userData.isAdmin || false)
          } else {
            // User exists in Auth but not in Firestore
            // Create a basic profile
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              name: firebaseUser.displayName,
              isAdmin: false,
              photoURL: firebaseUser.photoURL,
            })
            setIsAdmin(false)
          }
        } catch (error) {
          console.error("Error fetching user data:", error)
          // Basic user info from Firebase Auth
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            name: firebaseUser.displayName,
            isAdmin: false,
            photoURL: firebaseUser.photoURL,
          })
          setIsAdmin(false)
        }
      } else {
        // User is signed out
        setUser(null)
        setIsAdmin(false)
      }
      setLoading(false)
    })

    // Cleanup subscription
    return () => unsubscribe()
  }, [])

  // Sign in with email and password
  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true)
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      const firebaseUser = userCredential.user

      // Get user data from Firestore
      const userDoc = await getDoc(doc(db, "users", firebaseUser.uid))

      if (userDoc.exists()) {
        // Update last login timestamp
        await setDoc(doc(db, "users", firebaseUser.uid), { lastLogin: serverTimestamp() }, { merge: true })
      }

      toast({
        title: "Welcome back!",
        description: "You have successfully signed in.",
      })

      // Redirect to home page or previous page
      router.push("/")
    } catch (error: any) {
      console.error("Error signing in:", error)
      let errorMessage = "Failed to sign in. Please check your credentials."

      if (error.code === "auth/user-not-found" || error.code === "auth/wrong-password") {
        errorMessage = "Invalid email or password. Please try again."
      } else if (error.code === "auth/too-many-requests") {
        errorMessage = "Too many failed login attempts. Please try again later or reset your password."
      }

      toast({
        title: "Sign in failed",
        description: errorMessage,
        variant: "destructive",
      })
      throw error
    } finally {
      setLoading(false)
    }
  }

  // Sign up with email and password
  const signUp = async (email: string, password: string, name: string) => {
    try {
      setLoading(true)
      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const firebaseUser = userCredential.user

      // Update profile with name
      await updateProfile(firebaseUser, { displayName: name })

      // Create user document in Firestore
      await setDoc(doc(db, "users", firebaseUser.uid), {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        name,
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp(),
        isAdmin: false,
      })

      toast({
        title: "Account created!",
        description: "Your account has been successfully created.",
      })

      // Redirect to home page
      router.push("/")
    } catch (error: any) {
      console.error("Error signing up:", error)
      let errorMessage = "Failed to create account. Please try again."

      if (error.code === "auth/email-already-in-use") {
        errorMessage = "Email is already in use. Please use a different email or sign in."
      } else if (error.code === "auth/weak-password") {
        errorMessage = "Password is too weak. Please use a stronger password."
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "Invalid email address. Please check your email."
      }

      toast({
        title: "Sign up failed",
        description: errorMessage,
        variant: "destructive",
      })
      throw error
    } finally {
      setLoading(false)
    }
  }

  // Sign out
  const signOut = async () => {
    try {
      await firebaseSignOut(auth)
      toast({
        title: "Signed out",
        description: "You have been successfully signed out.",
      })
      router.push("/login")
    } catch (error) {
      console.error("Error signing out:", error)
      toast({
        title: "Sign out failed",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      })
      throw error
    }
  }

  // Reset password
  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email)
      toast({
        title: "Password reset email sent",
        description: "Check your email for a link to reset your password.",
      })
    } catch (error: any) {
      console.error("Error resetting password:", error)
      let errorMessage = "Failed to send password reset email. Please try again."

      if (error.code === "auth/user-not-found") {
        errorMessage = "No account found with this email address."
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "Invalid email address. Please check your email."
      }

      toast({
        title: "Password reset failed",
        description: errorMessage,
        variant: "destructive",
      })
      throw error
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAdmin,
        loading,
        signIn,
        signUp,
        signOut,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
