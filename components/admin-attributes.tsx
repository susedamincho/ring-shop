"use client"

import { useState, useEffect } from "react"
import { Edit, MoreHorizontal, Plus, Trash } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/components/ui/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  addAttributeItem,
  updateAttributeItem,
  deleteAttributeItem,
  getConditions,
  getStorageOptions,
  getCarriers,
  getColors,
} from "@/lib/firebase/attributes"

export default function AdminAttributes() {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("conditions")
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState(null)
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
  })

  // Fetch items when component mounts or tab changes
  useEffect(() => {
    fetchItems()
  }, [activeTab])

  const fetchItems = async () => {
    try {
      setLoading(true)
      let fetchedItems = []

      switch (activeTab) {
        case "conditions":
          fetchedItems = await getConditions()
          break
        case "storage":
          fetchedItems = await getStorageOptions()
          break
        case "carriers":
          fetchedItems = await getCarriers()
          break
        case "colors":
          fetchedItems = await getColors()
          break
        default:
          fetchedItems = []
      }

      setItems(fetchedItems)
    } catch (error) {
      console.error(`Error fetching ${activeTab}:`, error)
      toast({
        title: "Error",
        description: `Failed to load ${activeTab}. Please try again.`,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const getCollectionName = () => {
    switch (activeTab) {
      case "conditions":
        return "conditions"
      case "storage":
        return "storageOptions"
      case "carriers":
        return "carriers"
      case "colors":
        return "colors"
      default:
        return ""
    }
  }

  const handleAddItem = () => {
    setEditingItem(null)
    setFormData({
      name: "",
      slug: "",
    })
    setDialogOpen(true)
  }

  const handleEditItem = (item) => {
    setEditingItem(item)
    setFormData({
      name: item.name || "",
      slug: item.slug || "",
    })
    setDialogOpen(true)
  }

  const confirmDeleteItem = (item) => {
    setItemToDelete(item)
    setDeleteConfirmOpen(true)
  }

  const handleDeleteItem = async () => {
    if (!itemToDelete) return

    try {
      const collectionName = getCollectionName()
      await deleteAttributeItem(collectionName, itemToDelete.id)
      setItems(items.filter((item) => item.id !== itemToDelete.id))
      toast({
        title: "Item deleted",
        description: "The item has been deleted successfully.",
      })
      setDeleteConfirmOpen(false)
      setItemToDelete(null)
    } catch (error) {
      console.error("Error deleting item:", error)
      toast({
        title: "Error",
        description: "Failed to delete item. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })

    // Auto-generate slug from name if slug field is empty
    if (name === "name" && (!formData.slug || formData.slug === "")) {
      setFormData({
        ...formData,
        name: value,
        slug: value
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/[^a-z0-9-]/g, ""),
      })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      const collectionName = getCollectionName()

      if (editingItem) {
        // Update existing item
        const updatedItem = await updateAttributeItem(collectionName, editingItem.id, formData)
        setItems(items.map((item) => (item.id === editingItem.id ? updatedItem : item)))
        toast({
          title: "Item updated",
          description: "The item has been updated successfully.",
        })
      } else {
        // Add new item
        const newItem = await addAttributeItem(collectionName, formData)
        setItems([...items, newItem])
        toast({
          title: "Item added",
          description: "The new item has been added successfully.",
        })
      }
      setDialogOpen(false)
    } catch (error) {
      console.error("Error saving item:", error)
      toast({
        title: "Error",
        description: "Failed to save item. Please try again.",
        variant: "destructive",
      })
    }
  }

  const filteredItems = items.filter((item) => item.name.toLowerCase().includes(searchTerm.toLowerCase()))

  return (
    <div className="space-y-4">
      <Tabs defaultValue="conditions" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="conditions">Conditions</TabsTrigger>
          <TabsTrigger value="storage">Storage Options</TabsTrigger>
          <TabsTrigger value="carriers">Carriers</TabsTrigger>
          <TabsTrigger value="colors">Colors</TabsTrigger>
        </TabsList>

        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-2">
            <Input
              placeholder={`Search ${activeTab}...`}
              className="w-[300px]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button onClick={handleAddItem}>
            <Plus className="mr-2 h-4 w-4" />
            Add {activeTab === "storage" ? "Storage Option" : activeTab.slice(0, -1)}
          </Button>
        </div>

        <TabsContent value="conditions" className="space-y-4">
          <AttributeTable
            items={filteredItems}
            loading={loading}
            searchTerm={searchTerm}
            onEdit={handleEditItem}
            onDelete={confirmDeleteItem}
            attributeType="condition"
          />
        </TabsContent>

        <TabsContent value="storage" className="space-y-4">
          <AttributeTable
            items={filteredItems}
            loading={loading}
            searchTerm={searchTerm}
            onEdit={handleEditItem}
            onDelete={confirmDeleteItem}
            attributeType="storage option"
          />
        </TabsContent>

        <TabsContent value="carriers" className="space-y-4">
          <AttributeTable
            items={filteredItems}
            loading={loading}
            searchTerm={searchTerm}
            onEdit={handleEditItem}
            onDelete={confirmDeleteItem}
            attributeType="carrier"
          />
        </TabsContent>

        <TabsContent value="colors" className="space-y-4">
          <AttributeTable
            items={filteredItems}
            loading={loading}
            searchTerm={searchTerm}
            onEdit={handleEditItem}
            onDelete={confirmDeleteItem}
            attributeType="color"
          />
        </TabsContent>
      </Tabs>

      {/* Add/Edit Item Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingItem ? `Edit ${activeTab.slice(0, -1)}` : `Add New ${activeTab.slice(0, -1)}`}
            </DialogTitle>
            <DialogDescription>
              {editingItem
                ? `Update the ${activeTab.slice(0, -1)} details below.`
                : `Fill in the details to create a new ${activeTab.slice(0, -1)}.`}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" value={formData.name} onChange={handleInputChange} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">Slug</Label>
              <Input id="slug" name="slug" value={formData.slug} onChange={handleInputChange} required />
              <p className="text-xs text-muted-foreground">The slug is used in URLs and filtering</p>
            </div>

            <DialogFooter>
              <Button type="submit">{editingItem ? "Update" : "Add"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{itemToDelete?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteItem}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function AttributeTable({ items, loading, searchTerm, onEdit, onDelete, attributeType }) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Slug</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={3} className="text-center py-8">
                Loading items...
              </TableCell>
            </TableRow>
          ) : items.length === 0 ? (
            <TableRow>
              <TableCell colSpan={3} className="text-center py-8">
                {searchTerm
                  ? `No ${attributeType}s found matching your search.`
                  : `No ${attributeType}s found. Add your first ${attributeType} to get started.`}
              </TableCell>
            </TableRow>
          ) : (
            items.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell>{item.slug}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Actions</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => onEdit(item)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600" onClick={() => onDelete(item)}>
                        <Trash className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
