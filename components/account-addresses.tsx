"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { MapPin, Plus, Edit, Trash, Home, Briefcase, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/components/auth-provider"
import { getUserAddresses, addAddress, updateAddress, deleteAddress } from "@/lib/firebase/addresses"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export default function AccountAddresses() {
  const { toast } = useToast()
  const { user } = useAuth()
  const [addresses, setAddresses] = useState([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingAddress, setEditingAddress] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [addressToDelete, setAddressToDelete] = useState(null)

  useEffect(() => {
    fetchAddresses()
  }, [user])

  const fetchAddresses = async () => {
    if (!user?.uid) return

    try {
      setLoading(true)
      const userAddresses = await getUserAddresses(user.uid)
      setAddresses(userAddresses)
    } catch (err) {
      console.error("Error fetching addresses:", err)
      toast({
        title: "Error",
        description: "Failed to load your addresses. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAddAddress = () => {
    setEditingAddress(null)
    setDialogOpen(true)
  }

  const handleEditAddress = (address) => {
    setEditingAddress(address)
    setDialogOpen(true)
  }

  const confirmDeleteAddress = (address) => {
    setAddressToDelete(address)
    setDeleteConfirmOpen(true)
  }

  const handleDeleteAddress = async () => {
    if (!addressToDelete) return

    try {
      setSubmitting(true)
      await deleteAddress(addressToDelete.id)
      setAddresses(addresses.filter((address) => address.id !== addressToDelete.id))

      toast({
        title: "Address deleted",
        description: "The address has been deleted successfully.",
      })
      setDeleteConfirmOpen(false)
      setAddressToDelete(null)
    } catch (error) {
      console.error("Error deleting address:", error)
      toast({
        title: "Error",
        description: "Failed to delete the address. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const formData = new FormData(e.target)
      const addressData = {
        userId: user.uid,
        name: formData.get("name"),
        address: formData.get("address"),
        city: formData.get("city"),
        state: formData.get("state"),
        zipCode: formData.get("zipCode"),
        country: formData.get("country"),
        isDefault: formData.get("isDefault") === "on",
        type: formData.get("type") || "home",
      }

      if (editingAddress) {
        const updatedAddress = await updateAddress(editingAddress.id, addressData)
        setAddresses(addresses.map((address) => (address.id === editingAddress.id ? updatedAddress : address)))

        toast({
          title: "Address updated",
          description: "The address has been updated successfully.",
        })
      } else {
        const newAddress = await addAddress(addressData)
        setAddresses([...addresses, newAddress])

        toast({
          title: "Address added",
          description: "The new address has been added successfully.",
        })
      }

      setDialogOpen(false)
    } catch (error) {
      console.error("Error saving address:", error)
      toast({
        title: "Error",
        description: "Failed to save the address. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const getAddressTypeIcon = (type) => {
    switch (type) {
      case "work":
        return <Briefcase className="h-4 w-4" />
      case "home":
      default:
        return <Home className="h-4 w-4" />
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-12 w-12 animate-spin text-[#0d9488] mb-4" />
        <p className="text-gray-400">Loading your addresses...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Your Addresses</h2>
        <Button onClick={handleAddAddress} className="bg-[#0d9488] hover:bg-[#0d9488]/80 text-white">
          <Plus className="mr-2 h-4 w-4" />
          Add Address
        </Button>
      </div>

      {addresses.length === 0 ? (
        <div className="text-center py-12 bg-[#1e293b]/50 rounded-xl border border-white/10">
          <MapPin className="h-16 w-16 mx-auto text-gray-500 mb-4" />
          <h3 className="text-xl font-semibold mb-2">No addresses found</h3>
          <p className="text-gray-400 mb-6">You haven't added any addresses yet.</p>
          <Button onClick={handleAddAddress} className="bg-[#0d9488] hover:bg-[#0d9488]/80 text-white">
            <Plus className="mr-2 h-4 w-4" />
            Add Your First Address
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {addresses.map((address) => (
              <motion.div
                key={address.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`bg-[#1e293b]/50 rounded-xl border ${address.isDefault ? "border-[#0d9488]/50" : "border-white/10"
                  } overflow-hidden hover:border-[#0d9488]/30 transition-colors`}
              >
                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center">
                      <div
                        className={`p-2 rounded-full ${address.isDefault ? "bg-[#0d9488]/20 text-[#0d9488]" : "bg-gray-800 text-gray-400"
                          } mr-3`}
                      >
                        {getAddressTypeIcon(address.type)}
                      </div>
                      <div>
                        <h3 className="font-medium">{address.name}</h3>
                        {address.isDefault && (
                          <span className="text-xs bg-[#0d9488]/20 text-[#0d9488] px-2 py-0.5 rounded-full">
                            Default
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex space-x-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-gray-400 hover:text-white hover:bg-white/10"
                        onClick={() => handleEditAddress(address)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-gray-400 hover:text-red-400 hover:bg-red-500/10"
                        onClick={() => confirmDeleteAddress(address)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-1 text-sm text-gray-300">
                    <p>{address.address}</p>
                    <p>
                      {address.city}, {address.state} {address.zipCode}
                    </p>
                    <p>{address.country}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Add/Edit Address Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-[#1e293b] border-white/10 text-white">
          <DialogHeader>
            <DialogTitle>{editingAddress ? "Edit Address" : "Add New Address"}</DialogTitle>
            <DialogDescription className="text-gray-400">
              {editingAddress ? "Update your address information below." : "Enter your address information below."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="name">Address Name</Label>
              <Input
                id="name"
                name="name"
                defaultValue={editingAddress?.name || ""}
                placeholder="Home, Work, etc."
                required
                className="bg-[#0f172a]/80 border-white/10"
              />
            </div>

            <div className="flex gap-4 mb-4">
              <div className="flex items-center">
                <input
                  type="radio"
                  id="type-home"
                  name="type"
                  value="home"
                  defaultChecked={!editingAddress || editingAddress?.type === "home" || !editingAddress?.type}
                  className="sr-only peer"
                />
                <label
                  htmlFor="type-home"
                  className="flex items-center gap-2 px-3 py-2 rounded-lg border border-white/10 cursor-pointer peer-checked:border-[#0d9488] peer-checked:bg-[#0d9488]/20 peer-checked:text-[#0d9488]"
                >
                  <Home className="h-4 w-4" />
                  <span>Home</span>
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="radio"
                  id="type-work"
                  name="type"
                  value="work"
                  defaultChecked={editingAddress?.type === "work"}
                  className="sr-only peer"
                />
                <label
                  htmlFor="type-work"
                  className="flex items-center gap-2 px-3 py-2 rounded-lg border border-white/10 cursor-pointer peer-checked:border-[#0d9488] peer-checked:bg-[#0d9488]/20 peer-checked:text-[#0d9488]"
                >
                  <Briefcase className="h-4 w-4" />
                  <span>Work</span>
                </label>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Street Address</Label>
              <Input
                id="address"
                name="address"
                defaultValue={editingAddress?.address || ""}
                required
                className="bg-[#0f172a]/80 border-white/10"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  name="city"
                  defaultValue={editingAddress?.city || ""}
                  required
                  className="bg-[#0f172a]/80 border-white/10"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  name="state"
                  defaultValue={editingAddress?.state || ""}
                  required
                  className="bg-[#0f172a]/80 border-white/10"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="zipCode">ZIP Code</Label>
                <Input
                  id="zipCode"
                  name="zipCode"
                  defaultValue={editingAddress?.zipCode || ""}
                  required
                  className="bg-[#0f172a]/80 border-white/10"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  name="country"
                  defaultValue={editingAddress?.country || "United States"}
                  required
                  className="bg-[#0f172a]/80 border-white/10"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <Checkbox
                id="isDefault"
                name="isDefault"
                defaultChecked={editingAddress?.isDefault || false}
                className="data-[state=checked]:bg-[#0d9488] data-[state=checked]:border-[#0d9488]"
              />
              <label
                htmlFor="isDefault"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Set as default address
              </label>
            </div>

            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
                disabled={submitting}
                className="border-white/10 text-gray-300 hover:bg-white/5"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="bg-[#0d9488] hover:bg-[#0d9488]/80 text-white ml-2"
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {editingAddress ? "Updating..." : "Adding..."}
                  </>
                ) : (
                  <>{editingAddress ? "Update Address" : "Add Address"}</>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="bg-[#1e293b] border-white/10 text-white">
          <DialogHeader>
            <DialogTitle>Delete Address</DialogTitle>
            <DialogDescription className="text-gray-400">
              Are you sure you want to delete this address? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          {addressToDelete && (
            <div className="bg-[#0f172a]/80 rounded-lg p-4 my-4 border border-white/10">
              <p className="font-medium">{addressToDelete.name}</p>
              <p className="text-sm text-gray-400">{addressToDelete.address}</p>
              <p className="text-sm text-gray-400">
                {addressToDelete.city}, {addressToDelete.state} {addressToDelete.zipCode}
              </p>
              <p className="text-sm text-gray-400">{addressToDelete.country}</p>
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteConfirmOpen(false)}
              disabled={submitting}
              className="border-white/10 text-gray-300 hover:bg-white/5"
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={submitting}
              onClick={handleDeleteAddress}
              className="bg-red-500 hover:bg-red-600 text-white ml-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Address"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
