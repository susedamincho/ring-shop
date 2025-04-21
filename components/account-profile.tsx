"use client"

import { useState } from "react"
import { User, Mail, Phone, Calendar, Camera, Loader2, CheckCircle2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/components/auth-provider"
import { doc, updateDoc } from "firebase/firestore"
import { updateProfile as updateFirebaseProfile } from "firebase/auth"
import { db, auth } from "@/lib/firebase/config"

export default function AccountProfile() {
  const { toast } = useToast()
  const { user } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    bio: user?.bio || "",
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setSuccess(false)

    try {
      // Update Firebase Auth profile
      if (auth.currentUser) {
        await updateFirebaseProfile(auth.currentUser, {
          displayName: formData.name,
        })
      }

      // Update Firestore user document
      if (user?.uid) {
        await updateDoc(doc(db, "users", user.uid), {
          name: formData.name,
          phone: formData.phone,
          bio: formData.bio,
          updatedAt: new Date(),
        })
      }

      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      })

      setSuccess(true)
      setTimeout(() => {
        setIsEditing(false)
        setSuccess(false)
      }, 1500)
    } catch (error) {
      console.error("Error updating profile:", error)
      toast({
        title: "Update failed",
        description: "There was an error updating your profile. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Profile Information</h2>
        {!isEditing && (
          <Button
            onClick={() => setIsEditing(true)}
            variant="outline"
            className="bg-black/30 border-[#0d9488]/50 text-[#0d9488] hover:bg-[#0d9488]/10 hover:text-[#0d9488]"
          >
            Промени профил
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Profile Image Section */}
        <div className="flex flex-col items-center justify-start space-y-4">
          <div className="relative">
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-[#0d9488] to-[#0f172a] flex items-center justify-center">
              {user?.photoURL ? (
                <img
                  src={user.photoURL || "/placeholder.svg"}
                  alt={user.name || "User"}
                  className="w-32 h-32 rounded-full object-cover"
                />
              ) : (
                <User className="h-16 w-16 text-white" />
              )}
            </div>
            {isEditing && (
              <button className="absolute bottom-0 right-0 bg-[#0d9488] text-white p-2 rounded-full shadow-lg hover:bg-[#0d9488]/80 transition-colors">
                <Camera className="h-5 w-5" />
              </button>
            )}
          </div>

          <div className="text-center">
            <h3 className="font-medium text-lg">{user?.name || "User"}</h3>
            <p className="text-gray-400 text-sm">{user?.email || "user@example.com"}</p>
          </div>

          <div className="w-full bg-[#1e293b]/50 rounded-lg p-4 mt-4">
            <div className="flex items-center space-x-2 text-sm text-gray-400 mb-2">
              <Calendar className="h-4 w-4" />
              <span>Member since</span>
            </div>
            <p className="text-white">
              {user?.createdAt
                ? new Date(user.createdAt.seconds * 1000).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })
                : "N/A"}
            </p>
          </div>
        </div>

        {/* Profile Form Section */}
        <div className="md:col-span-2">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-gray-300">
                <User className="inline h-4 w-4 mr-2 text-[#0d9488]" />
                Цяло име
              </Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                disabled={!isEditing || loading}
                className={`bg-[#1e293b]/50 border-white/10 ${!isEditing ? "text-gray-400" : "text-white"}`}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-300">
                <Mail className="inline h-4 w-4 mr-2 text-[#0d9488]" />
                Имейл адрес
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                disabled={true}
                className="bg-[#1e293b]/50 border-white/10 text-gray-400"
              />
              <p className="text-xs text-gray-500">Имейлът не може да се променя. Свържете се с поддръжката за помощ.</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-gray-300">
                <Phone className="inline h-4 w-4 mr-2 text-[#0d9488]" />
                Телефонен номер
              </Label>
              <Input
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                disabled={!isEditing || loading}
                className={`bg-[#1e293b]/50 border-white/10 ${!isEditing ? "text-gray-400" : "text-white"}`}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio" className="text-gray-300">
                За мен
              </Label>
              <Textarea
                id="bio"
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                disabled={!isEditing || loading}
                className={`bg-[#1e293b]/50 border-white/10 min-h-[100px] ${!isEditing ? "text-gray-400" : "text-white"}`}
                placeholder={isEditing ? "Tell us a bit about yourself..." : ""}
              />
            </div>

            {isEditing && (
              <div className="flex space-x-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  className="border-white/10 text-gray-300 hover:bg-white/5"
                  onClick={() => setIsEditing(false)}
                  disabled={loading}
                >
                  Отказ
                </Button>
                <Button type="submit" className="bg-[#0d9488] hover:bg-[#0d9488]/80 text-white" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Запазване...
                    </>
                  ) : success ? (
                    <>
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Запазено!
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  )
}
