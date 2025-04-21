"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { CreditCard, Plus, Edit, Trash, Loader2, Shield } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/components/auth-provider"
import {
  getPaymentMethods,
  addPaymentMethod,
  updatePaymentMethod,
  deletePaymentMethod,
} from "@/lib/firebase/payment-methods"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export default function AccountPaymentMethods() {
  const { toast } = useToast()
  const { user } = useAuth()
  const [paymentMethods, setPaymentMethods] = useState([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingPaymentMethod, setEditingPaymentMethod] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [paymentMethodToDelete, setPaymentMethodToDelete] = useState(null)

  useEffect(() => {
    fetchPaymentMethods()
  }, [user])

  const fetchPaymentMethods = async () => {
    if (!user?.uid) return

    try {
      setLoading(true)
      const methods = await getPaymentMethods(user.uid)
      setPaymentMethods(methods)
    } catch (err) {
      console.error("Error fetching payment methods:", err)
      toast({
        title: "Error",
        description: "Failed to load your payment methods. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAddPaymentMethod = () => {
    setEditingPaymentMethod(null)
    setDialogOpen(true)
  }

  const handleEditPaymentMethod = (paymentMethod) => {
    setEditingPaymentMethod(paymentMethod)
    setDialogOpen(true)
  }

  const confirmDeletePaymentMethod = (paymentMethod) => {
    setPaymentMethodToDelete(paymentMethod)
    setDeleteConfirmOpen(true)
  }

  const handleDeletePaymentMethod = async () => {
    if (!paymentMethodToDelete || !user?.uid) return

    try {
      setSubmitting(true)
      await deletePaymentMethod(user.uid, paymentMethodToDelete.id)
      setPaymentMethods(paymentMethods.filter((method) => method.id !== paymentMethodToDelete.id))

      toast({
        title: "Payment method deleted",
        description: "The payment method has been deleted successfully.",
      })
      setDeleteConfirmOpen(false)
      setPaymentMethodToDelete(null)
    } catch (error) {
      console.error("Error deleting payment method:", error)
      toast({
        title: "Error",
        description: "Failed to delete payment method. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!user?.uid) return

    try {
      setSubmitting(true)
      const formData = new FormData(e.target)

      const paymentData = {
        cardNumber: formData.get("cardNumber"),
        cardType: determineCardType(formData.get("cardNumber")),
        expiryDate: formData.get("expiryDate"),
        nameOnCard: formData.get("nameOnCard"),
        isDefault: formData.get("isDefault") === "on",
      }

      if (editingPaymentMethod) {
        // Update existing payment method
        const updatedMethod = await updatePaymentMethod(user.uid, editingPaymentMethod.id, paymentData)
        setPaymentMethods(
          paymentMethods.map((method) =>
            method.id === editingPaymentMethod.id
              ? updatedMethod
              : updatedMethod.isDefault
                ? { ...method, isDefault: false }
                : method,
          ),
        )

        toast({
          title: "Payment method updated",
          description: "The payment method has been updated successfully.",
        })
      } else {
        // Add new payment method
        const newMethod = await addPaymentMethod(user.uid, paymentData)

        // If the new method is default, update all other methods to not be default
        if (newMethod.isDefault) {
          setPaymentMethods([newMethod, ...paymentMethods.map((method) => ({ ...method, isDefault: false }))])
        } else {
          setPaymentMethods([newMethod, ...paymentMethods])
        }

        toast({
          title: "Payment method added",
          description: "The new payment method has been added successfully.",
        })
      }

      setDialogOpen(false)
    } catch (error) {
      console.error("Error saving payment method:", error)
      toast({
        title: "Error",
        description: "Failed to save payment method. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  // Simple function to determine card type based on first digit
  const determineCardType = (cardNumber) => {
    const firstDigit = cardNumber.charAt(0)
    if (firstDigit === "4") return "Visa"
    if (firstDigit === "5") return "Mastercard"
    if (firstDigit === "3") return "American Express"
    if (firstDigit === "6") return "Discover"
    return "Credit Card"
  }

  // Get card logo based on card type
  const getCardLogo = (cardType) => {
    switch (cardType) {
      case "Visa":
        return "bg-blue-500"
      case "Mastercard":
        return "bg-red-500"
      case "American Express":
        return "bg-green-500"
      case "Discover":
        return "bg-orange-500"
      default:
        return "bg-gray-500"
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-12 w-12 animate-spin text-[#0d9488] mb-4" />
        <p className="text-gray-400">Loading your payment methods...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Payment Methods</h2>
        <Button onClick={handleAddPaymentMethod} className="bg-[#0d9488] hover:bg-[#0d9488]/80 text-white">
          <Plus className="mr-2 h-4 w-4" />
          Add Payment Method
        </Button>
      </div>

      {paymentMethods.length === 0 ? (
        <div className="text-center py-12 bg-[#1e293b]/50 rounded-xl border border-white/10">
          <CreditCard className="h-16 w-16 mx-auto text-gray-500 mb-4" />
          <h3 className="text-xl font-semibold mb-2">No payment methods found</h3>
          <p className="text-gray-400 mb-6">You haven't added any payment methods yet.</p>
          <Button onClick={handleAddPaymentMethod} className="bg-[#0d9488] hover:bg-[#0d9488]/80 text-white">
            <Plus className="mr-2 h-4 w-4" />
            Add Your First Payment Method
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {paymentMethods.map((method) => (
              <motion.div
                key={method.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`bg-[#1e293b]/50 rounded-xl border ${method.isDefault ? "border-[#0d9488]/50" : "border-white/10"
                  } overflow-hidden hover:border-[#0d9488]/30 transition-colors`}
              >
                <div className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center">
                      <div
                        className={`w-10 h-6 rounded ${getCardLogo(method.cardType)} mr-3 flex items-center justify-center text-white text-xs font-bold`}
                      >
                        {method.cardType.substring(0, 4)}
                      </div>
                      <div>
                        <h3 className="font-medium">{method.cardType}</h3>
                        {method.isDefault && (
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
                        onClick={() => handleEditPaymentMethod(method)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-gray-400 hover:text-red-400 hover:bg-red-500/10"
                        onClick={() => confirmDeletePaymentMethod(method)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-1 text-sm">
                    <p className="font-mono text-lg tracking-widest">{method.cardNumber}</p>
                    <div className="flex justify-between text-gray-400">
                      <p>{method.nameOnCard}</p>
                      <p>Expires: {method.expiryDate}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Add/Edit Payment Method Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-[#1e293b] border-white/10 text-white">
          <DialogHeader>
            <DialogTitle>{editingPaymentMethod ? "Edit Payment Method" : "Add New Payment Method"}</DialogTitle>
            <DialogDescription className="text-gray-400">
              {editingPaymentMethod
                ? "Update your payment method information below."
                : "Enter your payment method information below."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="cardNumber">Card Number</Label>
              <div className="relative">
                <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input
                  id="cardNumber"
                  name="cardNumber"
                  placeholder="1234 5678 9012 3456"
                  defaultValue={editingPaymentMethod?.cardNumber?.replace(/\*/g, "") || ""}
                  required
                  className="pl-10 bg-[#0f172a]/80 border-white/10"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="expiryDate">Expiry Date</Label>
                <Input
                  id="expiryDate"
                  name="expiryDate"
                  placeholder="MM/YY"
                  defaultValue={editingPaymentMethod?.expiryDate || ""}
                  required
                  className="bg-[#0f172a]/80 border-white/10"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cvc">CVC</Label>
                <div className="relative">
                  <Shield className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <Input
                    id="cvc"
                    name="cvc"
                    placeholder="123"
                    required
                    className="pl-10 bg-[#0f172a]/80 border-white/10"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="nameOnCard">Name on Card</Label>
              <Input
                id="nameOnCard"
                name="nameOnCard"
                defaultValue={editingPaymentMethod?.nameOnCard || ""}
                required
                className="bg-[#0f172a]/80 border-white/10"
              />
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <Checkbox
                id="isDefault"
                name="isDefault"
                defaultChecked={editingPaymentMethod?.isDefault || false}
                className="data-[state=checked]:bg-[#0d9488] data-[state=checked]:border-[#0d9488]"
              />
              <label
                htmlFor="isDefault"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Set as default payment method
              </label>
            </div>

            <div className="bg-[#0f172a]/80 rounded-lg p-3 mt-2 border border-white/10 flex items-center text-xs text-gray-400">
              <Shield className="h-4 w-4 mr-2 text-[#0d9488]" />
              Your payment information is encrypted and stored securely. We never store your full card details.
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
                    {editingPaymentMethod ? "Updating..." : "Adding..."}
                  </>
                ) : (
                  <>{editingPaymentMethod ? "Update Payment Method" : "Add Payment Method"}</>
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
            <DialogTitle>Delete Payment Method</DialogTitle>
            <DialogDescription className="text-gray-400">
              Are you sure you want to delete this payment method? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          {paymentMethodToDelete && (
            <div className="bg-[#0f172a]/80 rounded-lg p-4 my-4 border border-white/10">
              <div className="flex items-center mb-2">
                <div
                  className={`w-10 h-6 rounded ${getCardLogo(paymentMethodToDelete.cardType)} mr-3 flex items-center justify-center text-white text-xs font-bold`}
                >
                  {paymentMethodToDelete.cardType.substring(0, 4)}
                </div>
                <p className="font-medium">{paymentMethodToDelete.cardType}</p>
              </div>
              <p className="font-mono tracking-widest">{paymentMethodToDelete.cardNumber}</p>
              <p className="text-sm text-gray-400">Expires: {paymentMethodToDelete.expiryDate}</p>
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
              onClick={handleDeletePaymentMethod}
              className="bg-red-500 hover:bg-red-600 text-white ml-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Payment Method"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
