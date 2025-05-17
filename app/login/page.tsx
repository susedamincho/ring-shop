// файл: LoginPage.tsx

"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, Loader2, LogIn, Mail, Lock } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/components/auth-provider"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function LoginPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { signIn, loading: authLoading, resetPassword } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [resetEmail, setResetEmail] = useState("")
  const [showResetForm, setShowResetForm] = useState(false)
  const [resetSent, setResetSent] = useState(false)

  const validateForm = () => {
    if (!email.trim()) {
      setError("Имейлът е задължителен")
      return false
    }

    if (!password) {
      setError("Паролата е задължителна")
      return false
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError("Моля, въведете валиден имейл адрес")
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
      await signIn(email, password)
    } catch (error) {
      setLoading(false)
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    if (!resetEmail.trim()) {
      setError("Имейлът е задължителен")
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(resetEmail)) {
      setError("Моля, въведете валиден имейл адрес")
      return
    }

    setLoading(true)
    try {
      await resetPassword(resetEmail)
      setResetSent(true)
      setLoading(false)
    } catch (error) {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0f172a] to-[#1e293b] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-teal-500/10 blur-3xl"></div>
        <div className="absolute top-1/2 left-0 w-96 h-96 rounded-full bg-teal-600/5 blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-64 h-64 rounded-full bg-blue-600/10 blur-3xl"></div>
      </div>

      <div className="container max-w-md z-10">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <div className="flex items-center justify-center mb-6">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center shadow-lg">
                <LogIn className="h-6 w-6 text-white" />
              </div>
            </div>
            <h2 className="text-3xl font-extrabold text-white tracking-tight">Добре дошли отново</h2>
            <p className="mt-2 text-gray-400">Влезте в акаунта си, за да продължите</p>
          </Link>
        </div>

        <Card className="bg-[#1e293b]/80 backdrop-blur-sm border-gray-800 shadow-2xl">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-2xl font-bold text-white">Вход</CardTitle>
            <CardDescription className="text-gray-400">Въведете вашите данни за достъп до акаунта</CardDescription>
          </CardHeader>

          {error && (
            <div className="px-6">
              <Alert variant="destructive" className="mb-4 bg-red-900/50 border-red-800 text-red-200">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            </div>
          )}

          {!showResetForm ? (
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
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
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-gray-300">Парола</Label>
                    <Button
                      variant="link"
                      className="p-0 h-auto text-sm text-teal-400 hover:text-teal-300"
                      type="button"
                      onClick={() => {
                        setShowResetForm(true)
                        setResetEmail(email)
                      }}
                    >
                      Забравена парола?
                    </Button>
                  </div>
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
                      Вписване...
                    </>
                  ) : (
                    "Вход"
                  )}
                </Button>
                <div className="mt-6 text-center text-sm text-gray-400">
                  Нямате акаунт?{" "}
                  <Link href="/register" className="text-teal-400 hover:text-teal-300 font-medium">
                    Създайте акаунт
                  </Link>
                </div>
              </CardFooter>
            </form>
          ) : (
            <form onSubmit={handleResetPassword}>
              <CardContent className="space-y-4">
                {resetSent ? (
                  <div className="text-center py-4">
                    <div className="w-16 h-16 rounded-full bg-teal-500/20 flex items-center justify-center mx-auto mb-4">
                      <Mail className="h-8 w-8 text-teal-400" />
                    </div>
                    <p className="text-teal-400 mb-4 font-medium">
                      Изпратихме ви имейл за възстановяване на парола! Проверете пощата си.
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowResetForm(false)
                        setResetSent(false)
                      }}
                      className="mt-2 border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
                    >
                      Назад към вход
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="resetEmail" className="text-gray-300">Имейл</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 h-4 w-4" />
                        <Input
                          id="resetEmail"
                          type="email"
                          placeholder="ime@primer.bg"
                          value={resetEmail}
                          onChange={(e) => setResetEmail(e.target.value)}
                          required
                          disabled={loading}
                          className="pl-10 bg-[#0f172a]/50 border-gray-700 text-white placeholder:text-gray-500 focus:border-teal-500 focus:ring-teal-500"
                        />
                      </div>
                    </div>
                    <p className="text-sm text-gray-400">Ще ви изпратим връзка за възстановяване на паролата ви.</p>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowResetForm(false)}
                        disabled={loading}
                        className="flex-1 border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
                      >
                        Отказ
                      </Button>
                      <Button
                        type="submit"
                        disabled={loading}
                        className="flex-1 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Изпращане...
                          </>
                        ) : (
                          "Изпрати връзка"
                        )}
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </form>
          )}
        </Card>
      </div>
    </div>
  )
}
