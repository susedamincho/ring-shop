"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Edit, MoreHorizontal, Plus, Trash } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
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
import { getProducts, deleteProduct } from "@/lib/firebase/products"
import { formatCurrency } from "@/lib/utils"
import { Loader2 } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export default function AdminProducts({ filter = "all" }) {
  const router = useRouter()
  const { toast } = useToast()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedProducts, setSelectedProducts] = useState([])
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [productToDelete, setProductToDelete] = useState(null)
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false)

  useEffect(() => {
    fetchProducts()
  }, [filter])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const fetchedProducts = await getProducts()

      let filteredProducts = fetchedProducts
      if (filter === "active") {
        filteredProducts = fetchedProducts.filter((product) => product.inventory > 0)
      } else if (filter === "out-of-stock") {
        filteredProducts = fetchedProducts.filter((product) => product.inventory === 0)
      } else if (filter === "featured") {
        filteredProducts = fetchedProducts.filter((product) => product.featured)
      }

      setProducts(filteredProducts)
    } catch (error) {
      console.error("Грешка при зареждане на продукти:", error)
      toast({
        title: "Грешка",
        description: "Неуспешно зареждане на продуктите. Опитайте отново.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSelectAll = () => {
    if (selectedProducts.length === products.length) {
      setSelectedProducts([])
    } else {
      setSelectedProducts(products.map((product) => product.id))
    }
  }

  const handleSelectProduct = (productId) => {
    setSelectedProducts((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    )
  }

  const handleAddProduct = () => router.push("/admin/products/new")

  const handleEditProduct = (productId) => router.push(`/admin/products/edit/${productId}`)

  const confirmDeleteProduct = (product) => {
    setProductToDelete(product)
    setDeleteDialogOpen(true)
  }

  const confirmBulkDelete = () => {
    if (selectedProducts.length > 0) setBulkDeleteDialogOpen(true)
  }

  const handleDeleteProduct = async () => {
    if (!productToDelete) return

    try {
      await deleteProduct(productToDelete.id)
      setProducts(products.filter((p) => p.id !== productToDelete.id))
      setSelectedProducts(selectedProducts.filter((id) => id !== productToDelete.id))
      toast({ title: "Продуктът е изтрит", description: "Успешно изтрит продукт." })
    } catch (error) {
      console.error("Грешка при изтриване на продукт:", error)
      toast({
        title: "Грешка",
        description: "Неуспешно изтриване на продукта. Опитайте отново.",
        variant: "destructive",
      })
    } finally {
      setDeleteDialogOpen(false)
      setProductToDelete(null)
    }
  }

  const handleBulkDelete = async () => {
    try {
      for (const id of selectedProducts) await deleteProduct(id)
      setProducts(products.filter((p) => !selectedProducts.includes(p.id)))
      toast({
        title: "Продуктите са изтрити",
        description: `${selectedProducts.length} продукта бяха успешно изтрити.`,
      })
      setSelectedProducts([])
    } catch (error) {
      console.error("Грешка при масово изтриване:", error)
      toast({
        title: "Грешка",
        description: "Неуспешно изтриване на някои продукти. Опитайте отново.",
        variant: "destructive",
      })
    } finally {
      setBulkDeleteDialogOpen(false)
    }
  }

  const getProductStatus = (inventory) => {
    if (inventory === 0) return "Изчерпано"
    if (inventory < 10) return "Ограничено"
    return "В наличност"
  }

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {selectedProducts.length > 0
            ? `${selectedProducts.length} от ${products.length} избрани`
            : `${products.length} продукта`}
        </p>
        <div className="flex items-center gap-2">
          {selectedProducts.length > 0 && (
            <Button variant="outline" className="text-red-500" onClick={confirmBulkDelete}>
              <Trash className="mr-2 h-4 w-4" />
              Изтрий избраните
            </Button>
          )}
          <Button onClick={handleAddProduct}>
            <Plus className="mr-2 h-4 w-4" />
            Добави продукт
          </Button>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">
                <Checkbox
                  checked={selectedProducts.length === products.length && products.length > 0}
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              <TableHead>Продукт</TableHead>
              <TableHead>Категории</TableHead>
              <TableHead>Цена</TableHead>
              <TableHead>Наличност</TableHead>
              <TableHead>Статус</TableHead>
              <TableHead className="text-right">Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  Няма намерени продукти.
                </TableCell>
              </TableRow>
            ) : (
              products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedProducts.includes(product.id)}
                      onCheckedChange={() => handleSelectProduct(product.id)}
                    />
                  </TableCell>
                  <TableCell className="font-medium flex items-center gap-2">
                    {product.image && (
                      <img
                        src={product.image || "/placeholder.svg"}
                        alt={product.name}
                        className="h-10 w-10 rounded object-cover"
                      />
                    )}
                    <span>{product.name}</span>
                  </TableCell>
                  <TableCell>{product.categoryIds?.length || 0} категории</TableCell>
                  <TableCell>{formatCurrency(product.price)}</TableCell>
                  <TableCell>{product.inventory}</TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        product.inventory === 0
                          ? "bg-red-100 text-red-800"
                          : product.inventory < 10
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {getProductStatus(product.inventory)}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Действия</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Действия</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleEditProduct(product.id)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Редактирай
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600" onClick={() => confirmDeleteProduct(product)}>
                          <Trash className="mr-2 h-4 w-4" />
                          Изтрий
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

      {/* Потвърждение за изтриване */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Сигурни ли сте?</AlertDialogTitle>
            <AlertDialogDescription>
              Това ще изтрие продукта „{productToDelete?.name}“ завинаги. Това действие е необратимо.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отказ</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteProduct} className="bg-red-600 hover:bg-red-700">
              Изтрий
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Потвърждение за масово изтриване */}
      <AlertDialog open={bulkDeleteDialogOpen} onOpenChange={setBulkDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Сигурни ли сте?</AlertDialogTitle>
            <AlertDialogDescription>
              Това ще изтрие {selectedProducts.length} избрани продукта. Това действие е необратимо.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отказ</AlertDialogCancel>
            <AlertDialogAction onClick={handleBulkDelete} className="bg-red-600 hover:bg-red-700">
              Изтрий всички
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
