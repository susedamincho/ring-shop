// файл: RegisterPage.tsx

"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, Loader2, UserPlus, Mail, Lock, User } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/components/auth-provider"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function RegisterPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { signUp, loading: authLoading } = useAuth()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const validateForm = () => {
    if (!name.trim()) {
      setError("Полето за име е задължително")
      return false
    }

    if (!email.trim()) {
      setError("Полето за имейл е задължително")
      return false
    }

    if (!password) {
      setError("Полето за парола е задължително")
      return false
    }

    if (password !== confirmPassword) {
      setError("Паролите не съвпадат")
      return false
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError("Моля, въведете валиден имейл адрес")
      return false
    }

    if (password.length < 8) {
      setError("Паролата трябва да бъде поне 8 символа")
      return false
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!validateForm()) return

    setLoading(true)

    try {
      await signUp(email, password, name)
    } catch (error) {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0f172a] to-[#1e293b] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-80 h-80 rounded-full bg-teal-500/10 blur-3xl"></div>
        <div className="absolute top-1/2 right-0 w-96 h-96 rounded-full bg-teal-600/5 blur-3xl"></div>
        <div className="absolute bottom-0 left-1/4 w-64 h-64 rounded-full bg-blue-600/10 blur-3xl"></div>
      </div>

      <div className="container max-w-md z-10">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <div className="flex items-center justify-center mb-6">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center shadow-lg">
                <UserPlus className="h-6 w-6 text-white" />
              </div>
            </div>
            <h2 className="text-3xl font-extrabold text-white tracking-tight">Присъединете се към нашата общност</h2>
            <p className="mt-2 text-gray-400">Създайте акаунт, за да започнете</p>
          </Link>
        </div>

        <Card className="bg-[#1e293b]/80 backdrop-blur-sm border-gray-800 shadow-2xl">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-2xl font-bold text-white">Създаване на акаунт</CardTitle>
            <CardDescription className="text-gray-400">Въведете вашата информация, за да се регистрирате</CardDescription>
          </CardHeader>

          {error && (
            <div className="px-6">
              <Alert variant="destructive" className="mb-4 bg-red-900/50 border-red-800 text-red-200">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-gray-300">Пълно име</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 h-4 w-4" />
                  <Input
                    id="name"
                    placeholder="Иван Иванов"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    disabled={loading}
                    className="pl-10 bg-[#0f172a]/50 border-gray-700 text-white placeholder:text-gray-500 focus:border-teal-500 focus:ring-teal-500"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-300">Имейл</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 h-4 w-4" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="ime@primer.bg"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                    className="pl-10 bg-[#0f172a]/50 border-gray-700 text-white placeholder:text-gray-500 focus:border-teal-500 focus:ring-teal-500"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-300">Парола</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 h-4 w-4" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                    className="pl-10 bg-[#0f172a]/50 border-gray-700 text-white placeholder:text-gray-500 focus:border-teal-500 focus:ring-teal-500"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 text-gray-400 hover:text-white"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={loading}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    <span className="sr-only">{showPassword ? "Скрий паролата" : "Покажи паролата"}</span>
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-1">Паролата трябва да бъде поне 8 символа</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-gray-300">Потвърдете паролата</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 h-4 w-4" />
                  <Input
                    id="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    disabled={loading}
                    className="pl-10 bg-[#0f172a]/50 border-gray-700 text-white placeholder:text-gray-500 focus:border-teal-500 focus:ring-teal-500"
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col pt-0">
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white font-medium py-2 rounded-md transition-all duration-200 shadow-lg hover:shadow-teal-500/25"
                disabled={loading || authLoading}
              >
                {loading || authLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Създаване на акаунт...
                  </>
                ) : (
                  "Създай акаунт"
                )}
              </Button>
              <div className="mt-6 text-center text-sm text-gray-400">
                Вече имате акаунт?{" "}
                <Link href="/login" className="text-teal-400 hover:text-teal-300 font-medium">
                  Влезте
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}
