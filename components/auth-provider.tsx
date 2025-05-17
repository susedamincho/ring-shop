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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDoc = await getDoc(doc(db, "users", firebaseUser.uid))

          if (userDoc.exists()) {
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
          console.error("Грешка при вземане на потребителски данни:", error)
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
        setUser(null)
        setIsAdmin(false)
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true)
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      const firebaseUser = userCredential.user
      const userDoc = await getDoc(doc(db, "users", firebaseUser.uid))

      if (userDoc.exists()) {
        await setDoc(doc(db, "users", firebaseUser.uid), { lastLogin: serverTimestamp() }, { merge: true })
      }

      toast({
        title: "Добре дошли обратно!",
        description: "Успешно влязохте в системата.",
      })

      router.push("/")
    } catch (error: any) {
      console.error("Грешка при вход:", error)
      let errorMessage = "Входът не бе успешен. Проверете имейла и паролата си."

      if (error.code === "auth/user-not-found" || error.code === "auth/wrong-password") {
        errorMessage = "Невалиден имейл или парола. Опитайте отново."
      } else if (error.code === "auth/too-many-requests") {
        errorMessage = "Твърде много неуспешни опити. Опитайте по-късно или използвайте 'Забравена парола'."
      }

      toast({
        title: "Грешка при вход",
        description: errorMessage,
        variant: "destructive",
      })
      throw error
    } finally {
      setLoading(false)
    }
  }

  const signUp = async (email: string, password: string, name: string) => {
    try {
      setLoading(true)
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const firebaseUser = userCredential.user

      await updateProfile(firebaseUser, { displayName: name })

      await setDoc(doc(db, "users", firebaseUser.uid), {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        name,
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp(),
        isAdmin: false,
      })

      toast({
        title: "Акаунтът е създаден!",
        description: "Регистрацията беше успешна.",
      })

      router.push("/")
    } catch (error: any) {
      console.error("Грешка при регистрация:", error)
      let errorMessage = "Неуспешна регистрация. Опитайте отново."

      if (error.code === "auth/email-already-in-use") {
        errorMessage = "Имейлът вече се използва. Влезте или използвайте друг."
      } else if (error.code === "auth/weak-password") {
        errorMessage = "Паролата е твърде слаба. Моля, използвайте по-силна."
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "Невалиден имейл адрес. Проверете въведения имейл."
      }

      toast({
        title: "Грешка при регистрация",
        description: errorMessage,
        variant: "destructive",
      })
      throw error
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    try {
      await firebaseSignOut(auth)
      toast({
        title: "Излязохте от акаунта",
        description: "Успешно излязохте от системата.",
      })
      router.push("/login")
    } catch (error) {
      console.error("Грешка при изход:", error)
      toast({
        title: "Грешка при изход",
        description: "Неуспешен опит за излизане. Опитайте отново.",
        variant: "destructive",
      })
      throw error
    }
  }

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email)
      toast({
        title: "Имейл за нулиране на парола е изпратен",
        description: "Проверете пощата си за връзка за нулиране.",
      })
    } catch (error: any) {
      console.error("Грешка при нулиране на парола:", error)
      let errorMessage = "Неуспешно изпращане на имейл за нулиране."

      if (error.code === "auth/user-not-found") {
        errorMessage = "Няма акаунт с този имейл адрес."
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "Невалиден имейл адрес. Проверете отново."
      }

      toast({
        title: "Грешка при нулиране",
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
