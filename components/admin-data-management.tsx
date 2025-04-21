"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { collection, getDocs, doc, deleteDoc, addDoc, updateDoc, serverTimestamp } from "firebase/firestore"
import { db } from "@/lib/firebase/config"
import { Edit, Trash2, Plus, Loader2 } from "lucide-react"

interface DataItem {
    id: string
    name: string
    slug?: string
    description?: string
    createdAt?: any
    updatedAt?: any
    [key: string]: any
}

const COLLECTIONS = [
    { id: "categories", name: "Categories", fields: ["name", "slug", "description"] },
    { id: "brands", name: "Brands", fields: ["name", "slug", "description"] },
    { id: "conditions", name: "Conditions", fields: ["name"] },
    { id: "storageOptions", name: "Storage Options", fields: ["name"] },
    { id: "carriers", name: "Carriers", fields: ["name"] },
    { id: "colors", name: "Colors", fields: ["name"] },
]

export default function AdminDataManagement() {
    const { toast } = useToast()
    const [selectedCollection, setSelectedCollection] = useState(COLLECTIONS[0].id)
    const [items, setItems] = useState<DataItem[]>([])
    const [loading, setLoading] = useState(false)
    const [editItem, setEditItem] = useState<DataItem | null>(null)
    const [newItem, setNewItem] = useState<Partial<DataItem>>({})
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

    // Get the fields for the selected collection
    const getCollectionFields = () => {
        return COLLECTIONS.find((c) => c.id === selectedCollection)?.fields || []
    }

    // Load data for the selected collection
    const loadData = async () => {
        try {
            setLoading(true)
            const collectionRef = collection(db, selectedCollection)
            const snapshot = await getDocs(collectionRef)
            const data = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            })) as DataItem[]

            // Sort by name
            data.sort((a, b) => a.name.localeCompare(b.name))

            setItems(data)
        } catch (error) {
            console.error(`Error loading ${selectedCollection}:`, error)
            toast({
                title: "Error",
                description: `Failed to load ${selectedCollection}. Please try again.`,
                variant: "destructive",
            })
        } finally {
            setLoading(false)
        }
    }

    // Load data when the selected collection changes
    useEffect(() => {
        loadData()
    }, [selectedCollection])

    // Handle collection change
    const handleCollectionChange = (value: string) => {
        setSelectedCollection(value)
    }

    // Handle adding a new item
    const handleAddItem = async () => {
        try {
            setLoading(true)

            // Generate slug if needed
            const itemToAdd: any = { ...newItem }
            if (getCollectionFields().includes("slug") && !itemToAdd.slug && itemToAdd.name) {
                itemToAdd.slug = itemToAdd.name.toLowerCase().replace(/\s+/g, "-")
            }

            // Add timestamp
            itemToAdd.createdAt = serverTimestamp()

            await addDoc(collection(db, selectedCollection), itemToAdd)

            toast({
                title: "Success",
                description: `Item added to ${selectedCollection} successfully.`,
            })

            // Reset form and close dialog
            setNewItem({})
            setIsAddDialogOpen(false)

            // Reload data
            await loadData()
        } catch (error) {
            console.error(`Error adding item to ${selectedCollection}:`, error)
            toast({
                title: "Error",
                description: `Failed to add item to ${selectedCollection}. Please try again.`,
                variant: "destructive",
            })
        } finally {
            setLoading(false)
        }
    }

    // Handle updating an item
    const handleUpdateItem = async () => {
        if (!editItem) return

        try {
            setLoading(true)

            // Generate slug if needed
            const itemToUpdate: any = { ...editItem }
            if (getCollectionFields().includes("slug") && !itemToUpdate.slug && itemToUpdate.name) {
                itemToUpdate.slug = itemToUpdate.name.toLowerCase().replace(/\s+/g, "-")
            }

            // Add timestamp
            itemToUpdate.updatedAt = serverTimestamp()

            // Remove id from the data to update
            const { id, ...updateData } = itemToUpdate

            await updateDoc(doc(db, selectedCollection, id), updateData)

            toast({
                title: "Success",
                description: `Item updated in ${selectedCollection} successfully.`,
            })

            // Reset form and close dialog
            setEditItem(null)
            setIsEditDialogOpen(false)

            // Reload data
            await loadData()
        } catch (error) {
            console.error(`Error updating item in ${selectedCollection}:`, error)
            toast({
                title: "Error",
                description: `Failed to update item in ${selectedCollection}. Please try again.`,
                variant: "destructive",
            })
        } finally {
            setLoading(false)
        }
    }

    // Handle deleting an item
    const handleDeleteItem = async (id: string) => {
        try {
            setLoading(true)
            await deleteDoc(doc(db, selectedCollection, id))

            toast({
                title: "Success",
                description: `Item deleted from ${selectedCollection} successfully.`,
            })

            // Reload data
            await loadData()
        } catch (error) {
            console.error(`Error deleting item from ${selectedCollection}:`, error)
            toast({
                title: "Error",
                description: `Failed to delete item from ${selectedCollection}. Please try again.`,
                variant: "destructive",
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <Select value={selectedCollection} onValueChange={handleCollectionChange}>
                    <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="Select collection" />
                    </SelectTrigger>
                    <SelectContent>
                        {COLLECTIONS.map((collection) => (
                            <SelectItem key={collection.id} value={collection.id}>
                                {collection.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" /> Add Item
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add New Item</DialogTitle>
                            <DialogDescription>
                                Add a new item to the {COLLECTIONS.find((c) => c.id === selectedCollection)?.name} collection.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            {getCollectionFields().map((field) => (
                                <div key={field} className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor={`add-${field}`} className="text-right capitalize">
                                        {field}
                                    </Label>
                                    {field === "description" ? (
                                        <Textarea
                                            id={`add-${field}`}
                                            className="col-span-3"
                                            value={newItem[field] || ""}
                                            onChange={(e) => setNewItem({ ...newItem, [field]: e.target.value })}
                                        />
                                    ) : (
                                        <Input
                                            id={`add-${field}`}
                                            className="col-span-3"
                                            value={newItem[field] || ""}
                                            onChange={(e) => setNewItem({ ...newItem, [field]: e.target.value })}
                                        />
                                    )}
                                </div>
                            ))}
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button onClick={handleAddItem} disabled={loading || !newItem.name}>
                                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                Add Item
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                {getCollectionFields().map((field) => (
                                    <TableHead key={field} className="capitalize">
                                        {field}
                                    </TableHead>
                                ))}
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={getCollectionFields().length + 1} className="h-24 text-center">
                                        <Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
                                    </TableCell>
                                </TableRow>
                            ) : items.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={getCollectionFields().length + 1} className="h-24 text-center">
                                        No items found. Add some items to get started.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                items.map((item) => (
                                    <TableRow key={item.id}>
                                        {getCollectionFields().map((field) => (
                                            <TableCell key={`${item.id}-${field}`}>
                                                {field === "description" ? (
                                                    <div className="max-w-xs truncate">{item[field] || "-"}</div>
                                                ) : (
                                                    item[field] || "-"
                                                )}
                                            </TableCell>
                                        ))}
                                        <TableCell className="text-right">
                                            <Dialog
                                                open={isEditDialogOpen && editItem?.id === item.id}
                                                onOpenChange={(open) => {
                                                    setIsEditDialogOpen(open)
                                                    if (!open) setEditItem(null)
                                                }}
                                            >
                                                <DialogTrigger asChild>
                                                    <Button variant="ghost" size="icon" onClick={() => setEditItem(item)}>
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent>
                                                    <DialogHeader>
                                                        <DialogTitle>Edit Item</DialogTitle>
                                                        <DialogDescription>
                                                            Make changes to the item in {COLLECTIONS.find((c) => c.id === selectedCollection)?.name}.
                                                        </DialogDescription>
                                                    </DialogHeader>
                                                    {editItem && (
                                                        <div className="grid gap-4 py-4">
                                                            {getCollectionFields().map((field) => (
                                                                <div key={field} className="grid grid-cols-4 items-center gap-4">
                                                                    <Label htmlFor={`edit-${field}`} className="text-right capitalize">
                                                                        {field}
                                                                    </Label>
                                                                    {field === "description" ? (
                                                                        <Textarea
                                                                            id={`edit-${field}`}
                                                                            className="col-span-3"
                                                                            value={editItem[field] || ""}
                                                                            onChange={(e) => setEditItem({ ...editItem, [field]: e.target.value })}
                                                                        />
                                                                    ) : (
                                                                        <Input
                                                                            id={`edit-${field}`}
                                                                            className="col-span-3"
                                                                            value={editItem[field] || ""}
                                                                            onChange={(e) => setEditItem({ ...editItem, [field]: e.target.value })}
                                                                        />
                                                                    )}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                    <DialogFooter>
                                                        <Button
                                                            variant="outline"
                                                            onClick={() => {
                                                                setIsEditDialogOpen(false)
                                                                setEditItem(null)
                                                            }}
                                                        >
                                                            Cancel
                                                        </Button>
                                                        <Button onClick={handleUpdateItem} disabled={loading || !editItem?.name}>
                                                            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                                            Запази промените
                                                        </Button>
                                                    </DialogFooter>
                                                </DialogContent>
                                            </Dialog>

                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="text-destructive">
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            This action cannot be undone. This will permanently delete the item from the database.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                        <AlertDialogAction
                                                            onClick={() => handleDeleteItem(item.id)}
                                                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                        >
                                                            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                                            Delete
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
