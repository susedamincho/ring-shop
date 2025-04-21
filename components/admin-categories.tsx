"use client"

import { useState, useEffect } from "react"
import { Edit, MoreHorizontal, Plus, Trash, Star, X } from "lucide-react"
import { useRouter } from "next/navigation"

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
import { getCategories, addCategory, updateCategory, deleteCategory } from "@/lib/firebase/categories"

interface Category {
  id: string
  name: string
  slug: string
  description?: string
  parentId?: string
  featured?: boolean
  image?: string
}

export default function AdminCategories() {
  const router = useRouter()
  const { toast } = useToast()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    parentId: "",
    featured: false,
    image: "",
  })

  // Fetch categories on component mount
  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      setLoading(true)
      const fetchedCategories = await getCategories()
      setCategories(fetchedCategories)
    } catch (error) {
      console.error("Error fetching categories:", error)
      toast({
        title: "Error",
        description: "Failed to load categories. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAddCategory = () => {
    setEditingCategory(null)
    setFormData({
      name: "",
      slug: "",
      description: "",
      parentId: "",
      featured: false,
      image: "",
    })
    setDialogOpen(true)
  }

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category)
    setFormData({
      name: category.name || "",
      slug: category.slug || "",
      description: category.description || "",
      parentId: category.parentId || "",
      featured: category.featured || false,
      image: category.image || "",
    })
    setDialogOpen(true)
  }

  const handleDeleteCategory = async (id: string) => {
    try {
      await deleteCategory(id)
      setCategories(categories.filter((category) => category.id !== id))
      toast({
        title: "Category deleted",
        description: "The category has been deleted successfully.",
      })
    } catch (error) {
      console.error("Error deleting category:", error)
      toast({
        title: "Error",
        description: "Failed to delete category. Please try again.",
        variant: "destructive",
      })
    }
  }

  const toggleFeatured = async (category: Category) => {
    try {
      const updatedFeatured = !category.featured
      const updatedCategory = await updateCategory(category.id, {
        featured: updatedFeatured
      })

      setCategories(categories.map((cat) =>
        cat.id === category.id ? { ...cat, featured: updatedFeatured } : cat
      ))

      toast({
        title: updatedFeatured ? "Category Featured" : "Category Unfeatured",
        description: updatedFeatured
          ? "The category has been added to featured navigation."
          : "The category has been removed from featured navigation.",
      })
    } catch (error) {
      console.error("Error updating category featured status:", error)
      toast({
        title: "Error",
        description: "Failed to update featured status. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      if (editingCategory) {
        // Update existing category
        const updatedCategory = await updateCategory(editingCategory.id, formData)
        setCategories(categories.map((category) => (category.id === editingCategory.id ? updatedCategory : category)))
        toast({
          title: "Category updated",
          description: "The category has been updated successfully.",
        })
      } else {
        // Add new category
        const newCategory = await addCategory(formData)
        setCategories([...categories, newCategory])
        toast({
          title: "Category added",
          description: "The new category has been added successfully.",
        })
      }
      setDialogOpen(false)
    } catch (error) {
      console.error("Error saving category:", error)
      toast({
        title: "Error",
        description: "Failed to save category. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Input placeholder="Search categories..." className="w-[300px]" />
          <Button variant="outline">Search</Button>
        </div>
        <Button onClick={handleAddCategory}>
          <Plus className="mr-2 h-4 w-4" />
          Add Category
        </Button>
      </div>

      {/* Featured Categories Section */}
      <div className="bg-slate-50 p-4 rounded-lg border">
        <h3 className="text-lg font-medium mb-2">Featured Categories</h3>
        <p className="text-sm text-slate-500 mb-4">
          These categories appear in the main navigation bar. Add or remove categories from featured to customize your navigation.
        </p>

        <div className="flex flex-wrap gap-2">
          {categories.filter(c => c.featured === true).length === 0 ? (
            <p className="text-sm text-slate-500 italic">No featured categories yet. Feature categories to show them in the main navigation.</p>
          ) : (
            categories
              .filter(c => c.featured === true)
              .map(category => (
                <div key={category.id} className="bg-white border rounded-full px-3 py-1 flex items-center gap-1 shadow-sm">
                  <span className="text-sm font-medium">{category.name}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5 rounded-full hover:bg-red-50 hover:text-red-500"
                    onClick={() => toggleFeatured(category)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))
          )}
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Image</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Featured</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  Loading categories...
                </TableCell>
              </TableRow>
            ) : categories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  No categories found. Add your first category to get started.
                </TableCell>
              </TableRow>
            ) : (
              categories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell className="font-medium">{category.name}</TableCell>
                  <TableCell>
                    {category.image ? (
                      <div className="relative h-10 w-10 overflow-hidden rounded">
                        <img
                          src={category.image}
                          alt={category.name}
                          className="object-cover h-full w-full"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "https://via.placeholder.com/100?text=Error";
                          }}
                        />
                      </div>
                    ) : (
                      <span className="text-slate-400 text-sm">No image</span>
                    )}
                  </TableCell>
                  <TableCell>{category.slug}</TableCell>
                  <TableCell className="max-w-xs truncate">{category.description}</TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`rounded-full ${category.featured
                        ? 'bg-green-100 text-green-800 hover:bg-green-200'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      onClick={() => toggleFeatured(category)}
                    >
                      <Star className={`h-4 w-4 mr-1 ${category.featured ? 'fill-green-500' : ''}`} />
                      {category.featured ? 'Featured' : 'Not Featured'}
                    </Button>
                  </TableCell>
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
                        <DropdownMenuItem onClick={() => handleEditCategory(category)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => toggleFeatured(category)}>
                          {category.featured ? (
                            <>
                              <Star className="mr-2 h-4 w-4 fill-current" />
                              Remove from Featured
                            </>
                          ) : (
                            <>
                              <Star className="mr-2 h-4 w-4" />
                              Add to Featured
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteCategory(category.id)}>
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

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingCategory ? "Edit Category" : "Add New Category"}</DialogTitle>
            <DialogDescription>
              {editingCategory ? "Update the category details below." : "Fill in the details to create a new category."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                name="slug"
                value={formData.slug}
                onChange={handleInputChange}
                required
              />
              <p className="text-sm text-muted-foreground mt-1">
                This will be used in the URL: /category/your-slug
              </p>
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
              />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="featured"
                  name="featured"
                  checked={formData.featured}
                  onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <Label htmlFor="featured">Featured in Navigation</Label>
              </div>
              <p className="text-sm text-muted-foreground mt-1 ml-6">
                Featured categories will be displayed in the main navigation
              </p>
            </div>
            <div>
              <Label htmlFor="image">Image URL</Label>
              <Input
                id="image"
                name="image"
                placeholder="https://example.com/image.jpg"
                value={formData.image || ""}
                onChange={handleInputChange}
              />
              <p className="text-sm text-muted-foreground mt-1">
                Enter a URL to an image for this category
              </p>
              {formData.image && (
                <div className="mt-2">
                  <p className="text-sm font-medium mb-1">Preview:</p>
                  <div className="relative h-24 w-24 overflow-hidden rounded border">
                    <img
                      src={formData.image}
                      alt="Category preview"
                      className="object-cover h-full w-full"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "https://via.placeholder.com/100?text=Invalid+URL";
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="parentId">Parent Category (Optional)</Label>
              <select
                id="parentId"
                name="parentId"
                value={formData.parentId}
                onChange={handleInputChange}
                className="w-full rounded-md border border-input bg-background px-3 py-2"
              >
                <option value="">None (Top Level Category)</option>
                {categories
                  .filter((c) => c.id !== editingCategory?.id) // Prevent selecting self as parent
                  .map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
              </select>
            </div>

            <DialogFooter>
              <Button type="submit">{editingCategory ? "Update Category" : "Add Category"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
