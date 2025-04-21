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
import { Textarea } from "@/components/ui/textarea"
import { getBrands, addBrand, updateBrand, deleteBrand, getProductsByBrand } from "@/lib/firebase/brands"

export default function AdminBrands() {
  const { toast } = useToast()
  const [brands, setBrands] = useState([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingBrand, setEditingBrand] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [brandToDelete, setBrandToDelete] = useState(null)
  const [productCount, setProductCount] = useState({})
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    website: "",
    logo: "",
  })

  // Fetch brands on component mount
  useEffect(() => {
    fetchBrands()
  }, [])

  const fetchBrands = async () => {
    try {
      setLoading(true)
      const fetchedBrands = await getBrands()
      setBrands(fetchedBrands)

      // Get product counts for each brand
      const counts = {}
      for (const brand of fetchedBrands) {
        const products = await getProductsByBrand(brand.name)
        counts[brand.id] = products.length
      }
      setProductCount(counts)
    } catch (error) {
      console.error("Error fetching brands:", error)
      toast({
        title: "Error",
        description: "Failed to load brands. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAddBrand = () => {
    setEditingBrand(null)
    setFormData({
      name: "",
      slug: "",
      description: "",
      website: "",
      logo: "",
    })
    setDialogOpen(true)
  }

  const handleEditBrand = (brand) => {
    setEditingBrand(brand)
    setFormData({
      name: brand.name || "",
      slug: brand.slug || "",
      description: brand.description || "",
      website: brand.website || "",
      logo: brand.logo || "",
    })
    setDialogOpen(true)
  }

  const confirmDeleteBrand = (brand) => {
    setBrandToDelete(brand)
    setDeleteConfirmOpen(true)
  }

  const handleDeleteBrand = async () => {
    if (!brandToDelete) return

    try {
      await deleteBrand(brandToDelete.id)
      setBrands(brands.filter((brand) => brand.id !== brandToDelete.id))
      toast({
        title: "Brand deleted",
        description: "The brand has been deleted successfully.",
      })
      setDeleteConfirmOpen(false)
      setBrandToDelete(null)
    } catch (error) {
      console.error("Error deleting brand:", error)
      toast({
        title: "Error",
        description: "Failed to delete brand. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      if (editingBrand) {
        // Update existing brand
        const updatedBrand = await updateBrand(editingBrand.id, formData)
        setBrands(brands.map((brand) => (brand.id === editingBrand.id ? updatedBrand : brand)))
        toast({
          title: "Brand updated",
          description: "The brand has been updated successfully.",
        })
      } else {
        // Add new brand
        const newBrand = await addBrand(formData)
        setBrands([...brands, newBrand])
        toast({
          title: "Brand added",
          description: "The new brand has been added successfully.",
        })
      }
      setDialogOpen(false)
    } catch (error) {
      console.error("Error saving brand:", error)
      toast({
        title: "Error",
        description: "Failed to save brand. Please try again.",
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

  const filteredBrands = brands.filter(
    (brand) =>
      brand.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (brand.description && brand.description.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Input
            placeholder="Search brands..."
            className="w-[300px]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button onClick={handleAddBrand}>
          <Plus className="mr-2 h-4 w-4" />
          Add Brand
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Website</TableHead>
              <TableHead>Products</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  Loading brands...
                </TableCell>
              </TableRow>
            ) : filteredBrands.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  {searchTerm
                    ? "No brands found matching your search."
                    : "No brands found. Add your first brand to get started."}
                </TableCell>
              </TableRow>
            ) : (
              filteredBrands.map((brand) => (
                <TableRow key={brand.id}>
                  <TableCell className="font-medium">{brand.name}</TableCell>
                  <TableCell>{brand.slug}</TableCell>
                  <TableCell className="max-w-xs truncate">{brand.description}</TableCell>
                  <TableCell>
                    {brand.website && (
                      <a
                        href={brand.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        {brand.website.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                      </a>
                    )}
                  </TableCell>
                  <TableCell>{productCount[brand.id] || 0}</TableCell>
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
                        <DropdownMenuItem onClick={() => handleEditBrand(brand)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600" onClick={() => confirmDeleteBrand(brand)}>
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

      {/* Add/Edit Brand Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingBrand ? "Edit Brand" : "Add New Brand"}</DialogTitle>
            <DialogDescription>
              {editingBrand ? "Update the brand details below." : "Fill in the details to create a new brand."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Brand Name</Label>
              <Input id="name" name="name" value={formData.name} onChange={handleInputChange} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">Slug</Label>
              <Input id="slug" name="slug" value={formData.slug} onChange={handleInputChange} required />
              <p className="text-xs text-muted-foreground">The slug is used in the URL, e.g., /brand/your-slug</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">Website URL (Optional)</Label>
              <Input
                id="website"
                name="website"
                type="url"
                value={formData.website}
                onChange={handleInputChange}
                placeholder="https://example.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="logo">Logo URL (Optional)</Label>
              <Input
                id="logo"
                name="logo"
                value={formData.logo}
                onChange={handleInputChange}
                placeholder="https://example.com/logo.png"
              />
              {formData.logo && (
                <div className="mt-2">
                  <img
                    src={formData.logo || "/placeholder.svg"}
                    alt="Brand logo preview"
                    className="h-16 object-contain rounded-md border p-2"
                    onError={(e) => {
                      e.target.src = "/placeholder.svg?height=64&width=120"
                      e.target.alt = "Invalid image URL"
                    }}
                  />
                </div>
              )}
            </div>

            <DialogFooter>
              <Button type="submit">{editingBrand ? "Update Brand" : "Add Brand"}</Button>
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
              Are you sure you want to delete the brand "{brandToDelete?.name}"?
              {productCount[brandToDelete?.id] > 0 && (
                <p className="mt-2 text-red-500">
                  Warning: This brand is associated with {productCount[brandToDelete?.id]} product(s). Deleting it may
                  affect those products.
                </p>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteBrand}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
