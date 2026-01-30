"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Plus, Edit, Trash2, ToggleLeft as Toggle, Eye, EyeOff } from "lucide-react"
import { ConfirmationDialog } from "../ui/confirmation-dialog"
import { api } from "@/lib/api"
import { toast } from "sonner"

interface Product {
  id: string | number
  name: string
  category: string
  price: number
  quantity: number
  description?: string
  status: "active" | "inactive"
}

export function ProductManagement() {
  const categories = ['electronics', 'clothing', 'food', 'books', 'home', 'sports', 'other']
  
  const [products, setProducts] = useState<Product[]>([])
  const [deactivatedProducts, setDeactivatedProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [showDeactivated, setShowDeactivated] = useState(false)

  const [searchTerm, setSearchTerm] = useState("")
  const [formData, setFormData] = useState({ 
    name: "", 
    category: "",
    price: "",
    quantity: "",
    description: ""
  })
  const [editingId, setEditingId] = useState<string | number | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  // Fetch products from API
  const fetchProducts = async () => {
    try {
      setLoading(true)
      const response = await api.get('/products')
      const productsData = response.data.data.map((product: any) => ({
        id: product._id,
        name: product.name,
        category: product.category,
        price: product.price,
        quantity: product.quantity,
        status: product.isActive ? "active" : "inactive" as "active" | "inactive"
      }))
      setProducts(productsData)
    } catch (error) {
      console.error('Error fetching products:', error)
      toast.error('Failed to fetch products')
    } finally {
      setLoading(false)
    }
  }

  // Fetch deactivated products for admin
  const fetchDeactivatedProducts = async () => {
    try {
      const response = await api.get('/admin/products/deactivated')
      const deactivatedData = response.data.data.map((product: any) => ({
        id: product._id,
        name: product.name,
        category: product.category,
        price: product.price,
        quantity: product.quantity,
        status: "inactive" as "active" | "inactive"
      }))
      setDeactivatedProducts(deactivatedData)
    } catch (error) {
      console.error('Error fetching deactivated products:', error)
      toast.error('Failed to fetch deactivated products')
    }
  }

  // Fetch products on component mount
  useEffect(() => {
    fetchProducts()
    fetchDeactivatedProducts()
  }, [])

  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean
    type: "add" | "edit" | "delete" | "toggle" | null
    productId?: string | number
  }>({
    open: false,
    type: null,
  })

  const filteredProducts = (showDeactivated ? deactivatedProducts : products).filter((p) => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setConfirmDialog({
      open: true,
      type: editingId ? "edit" : "add",
      productId: editingId?.toString() || undefined,
    })
  }

  const handleConfirmAction = async () => {
    if (confirmDialog.type === "add" || confirmDialog.type === "edit") {
      try {
        if (confirmDialog.type === "edit" && editingId) {
          // Update existing product - only send price, quantity, description
          const updatedProduct = {
            price: Number.parseFloat(formData.price),
            quantity: Number.parseInt(formData.quantity),
            description: formData.description,
          }
          
          console.log('Updating product:', editingId, updatedProduct)
          const response = await api.put(`/admin/products/${editingId}`, updatedProduct)
          console.log('Update response:', response.data)
          
          setProducts(
            products.map((p) =>
              p.id === editingId
                ? { ...p, ...updatedProduct }
                : p,
            ),
          )
          setEditingId(null)
          toast.success("Product updated successfully")
        } else {
          // Add new product
          const newProduct = {
            name: formData.name,
            category: formData.category,
            price: Number.parseFloat(formData.price),
            quantity: Number.parseInt(formData.quantity),
          }
          
          const response = await api.post('/admin/products', newProduct)
          
          const productWithId: Product = {
            id: response.data._id || Date.now().toString(),
            ...newProduct,
            status: "active",
          }
          
          setProducts([...products, productWithId])
          toast.success("Product added successfully")
        }
        
        // Refresh appropriate list
        if (showDeactivated) {
          fetchDeactivatedProducts()
        } else {
          fetchProducts()
        }
        
        setFormData({ 
          name: "", 
          category: "",
          price: "",
          quantity: "",
          description: ""
        })
        setIsDialogOpen(false)
      } catch (error: any) {
        console.error('Error saving product:', error)
        console.error('Error response:', error.response?.data)
        console.error('Error status:', error.response?.status)
        toast.error(confirmDialog.type === "edit" ? "Failed to update product" : "Failed to add product")
      }
    }
    setConfirmDialog({ open: false, type: null })
  }

  const deleteProduct = (id: string | number) => {
    setConfirmDialog({
      open: true,
      type: "delete",
      productId: id.toString(),
    })
  }

  const handleConfirmDelete = async () => {
    if (confirmDialog.productId) {
      try {
        console.log('Deleting product:', confirmDialog.productId)
        const response = await api.delete(`/admin/products/${confirmDialog.productId}`)
        console.log('Delete response:', response.data)
        
        // Remove from appropriate list
        if (showDeactivated) {
          setDeactivatedProducts(deactivatedProducts.filter((p) => p.id !== confirmDialog.productId))
        } else {
          setProducts(products.filter((p) => p.id !== confirmDialog.productId))
        }
        
        // Refresh data from server
        if (showDeactivated) {
          fetchDeactivatedProducts()
        } else {
          fetchProducts()
        }
        
        toast.success("Product deleted successfully")
      } catch (error: any) {
        console.error('Error deleting product:', error)
        console.error('Error response:', error.response?.data)
        console.error('Error status:', error.response?.status)
        toast.error("Failed to delete product")
      }
    }
    setConfirmDialog({ open: false, type: null })
  }

  // TODO: Temporarily commented out - will be used in future
  // const toggleStatus = (id: string | number) => {
  //   setConfirmDialog({
  //     open: true,
  //     type: "toggle",
  //     productId: id.toString(),
  //   })
  // }

  const editProduct = (product: Product) => {
    setEditingId(product.id)
    setFormData({
      name: product.name,
      category: product.category,
      price: product.price.toString(),
      quantity: product.quantity.toString(),
      description: product.description || "",
    })
    setIsDialogOpen(true)
  }

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Product Management</h2>
          <p className="text-slate-600 dark:text-slate-400 mt-2">Add, edit, or manage products</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          {!showDeactivated && (
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white">
                <Plus className="w-4 h-4 mr-2" />
                Add Product
              </Button>
            </DialogTrigger>
          )}
          <DialogContent className="dark:bg-slate-900 dark:border-slate-800">
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit Product" : "Add New Product"}</DialogTitle>
              <DialogDescription>
                {editingId ? "Update product details" : "Add a new product to your catalog"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Product Name</label>
                <Input
                  placeholder="Enter product name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="dark:bg-slate-800 dark:border-slate-700"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <textarea
                  placeholder="Enter product description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full min-h-[80px] px-3 py-2 text-sm border border-gray-300 rounded-md dark:bg-slate-800 dark:border-slate-700 dark:text-white resize-none"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Category</label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                  required
                >
                  <SelectTrigger className="dark:bg-slate-800 dark:border-slate-700">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Price ($)</label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="dark:bg-slate-800 dark:border-slate-700"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">Quantity</label>
                <Input
                  type="number"
                  min="0"
                  placeholder="0"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  className="dark:bg-slate-800 dark:border-slate-700"
                  required
                />
              </div>
              <Button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-cyan-600">
                {editingId ? "Update Product" : "Add Product"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="dark:border-slate-800">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle>
                {showDeactivated ? "Deactivated Products" : "All Products"}
              </CardTitle>
              <CardDescription>
                {showDeactivated 
                  ? "Manage deactivated products (Admin Only)" 
                  : "Manage your product catalog"
                }
              </CardDescription>
            </div>
            <div className="flex flex-col md:flex-row gap-2">
              <div className="flex gap-2">
                <Button
                  variant={!showDeactivated ? "default" : "outline"}
                  size="sm"
                  onClick={() => setShowDeactivated(false)}
                  className="flex items-center gap-2"
                >
                  <Eye className="w-4 h-4" />
                  Active Products
                </Button>
                <Button
                  variant={showDeactivated ? "default" : "outline"}
                  size="sm"
                  onClick={() => setShowDeactivated(true)}
                  className="flex items-center gap-2"
                >
                  <EyeOff className="w-4 h-4" />
                  Deactivated Products
                </Button>
              </div>
              <Input
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="md:w-64 dark:bg-slate-800 dark:border-slate-700"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="dark:border-slate-800">
                <TableHead>Product Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((product) => (
                <TableRow key={product.id} className="dark:border-slate-800">
                  <TableCell className="font-medium text-slate-900 dark:text-white">
                    <div className="font-semibold">{product.name}</div>
                  </TableCell>
                  <TableCell className="text-slate-600 dark:text-slate-300">
                    <Badge variant="outline" className="dark:border-slate-600">
                      {product.category}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-slate-600 dark:text-slate-300">${product.price.toFixed(2)}</TableCell>
                  <TableCell className="text-slate-600 dark:text-slate-300">{product.quantity}</TableCell>
                  <TableCell>
                    <Badge
                      className={
                        product.status === "active"
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                          : "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200"
                      }
                    >
                      {product.status.charAt(0).toUpperCase() + product.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => editProduct(product)}
                        className="text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      {/* TODO: Temporarily commented out - will be used in future */}
                      {/* <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => toggleStatus(product.id)}
                        className="text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        <Toggle className="w-4 h-4" />
                      </Button> */}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteProduct(product.id)}
                        className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <ConfirmationDialog
        open={confirmDialog.open && confirmDialog.type === "add"}
        onOpenChange={(open) =>
          setConfirmDialog({
            ...confirmDialog,
            open: open && confirmDialog.type === "add",
          })
        }
        title="Add Product?"
        description={`Are you sure you want to add "${formData.name}" to your product catalog?`}
        actionLabel="Add Product"
        onConfirm={handleConfirmAction}
      />

      <ConfirmationDialog
        open={confirmDialog.open && confirmDialog.type === "edit"}
        onOpenChange={(open) =>
          setConfirmDialog({
            ...confirmDialog,
            open: open && confirmDialog.type === "edit",
          })
        }
        title="Update Product?"
        description={`Are you sure you want to update "${formData.name}"?`}
        actionLabel="Update"
        onConfirm={handleConfirmAction}
      />

      <ConfirmationDialog
        open={confirmDialog.open && confirmDialog.type === "delete"}
        onOpenChange={(open) =>
          setConfirmDialog({
            ...confirmDialog,
            open: open && confirmDialog.type === "delete",
          })
        }
        title="Delete Product?"
        description="This action cannot be undone. Are you sure you want to delete this product?"
        actionLabel="Delete"
        cancelLabel="Cancel"
        variant="destructive"
        onConfirm={handleConfirmDelete}
      />

      {/* TODO: Temporarily commented out - will be used in future */}
      {/* <ConfirmationDialog
        open={confirmDialog.open && confirmDialog.type === "toggle"}
        onOpenChange={(open) =>
          setConfirmDialog({
            ...confirmDialog,
            open: open && confirmDialog.type === "toggle",
          })
        }
        title="Change Product Status?"
        description="Are you sure you want to toggle this product's status?"
        actionLabel="Toggle"
        onConfirm={handleConfirmToggle}
      /> */}
    </div>
  )
}
