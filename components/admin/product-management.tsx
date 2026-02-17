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
import { Plus, Edit, Trash2, ToggleLeft as Toggle, Eye, EyeOff, Upload, X } from "lucide-react"
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
  image?: string
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
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | number | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Fetch products from API
  const fetchProducts = async () => {
    try {
      setLoading(true)
      const response = await api.get('/products')
      console.log('=== PRODUCTS API RESPONSE ===')
      console.log('Response data:', response.data)
      console.log('Products array:', response.data.data)
      console.log('============================')
      
      const productsData = response.data.data.map((product: any) => {
        console.log('Processing product:', product)
        return {
          id: product._id,
          name: product.name,
          category: product.category,
          price: product.price,
          quantity: product.quantity,
          description: product.description || "",
          status: product.isActive ? "active" : "inactive" as "active" | "inactive",
          image: product.mainImage?.url || product.image || product.imageUrl || null
        }
      })
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
        description: product.description || "",
        status: "inactive" as "active" | "inactive",
        image: product.mainImage?.url || product.image || product.imageUrl || null
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
    console.log('=== handleConfirmAction START ===')
    console.log('confirmDialog.type:', confirmDialog.type)
    console.log('editingId:', editingId)
    console.log('formData:', formData)
    console.log('selectedImage:', selectedImage)
    
    if (confirmDialog.type === "add" || confirmDialog.type === "edit") {
      setIsSubmitting(true)
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
          console.log('=== FORM DATA VALIDATION ===')
          console.log('name:', formData.name)
          console.log('category:', formData.category)
          console.log('price:', formData.price)
          console.log('quantity:', formData.quantity)
          console.log('selectedImage:', selectedImage)
          
          // Validate all required fields
          if (!formData.name || !formData.name.trim()) {
            toast.error('Product name is required')
            return
          }
          if (!formData.category || !formData.category.trim()) {
            toast.error('Category is required')
            return
          }
          if (!formData.price || isNaN(Number.parseFloat(formData.price))) {
            toast.error('Valid price is required')
            return
          }
          if (!formData.quantity || isNaN(Number.parseInt(formData.quantity))) {
            toast.error('Valid quantity is required')
            return
          }
          
          if (selectedImage) {
            // Use FormData when image is present
            const formDataToSend = new FormData()
            formDataToSend.append('name', formData.name.trim())
            formDataToSend.append('category', formData.category.trim())
            formDataToSend.append('price', formData.price)
            formDataToSend.append('quantity', formData.quantity)
            formDataToSend.append('description', formData.description || '') // Added description field
            formDataToSend.append('mainImage', selectedImage) // Changed to 'mainImage' to match Postman
            
            // Log FormData content for debugging
            console.log('=== FORM DATA CONTENT ===')
            console.log('formData.description:', formData.description)
            console.log('description being sent:', formData.description || '')
            for (let [key, value] of formDataToSend.entries()) {
              console.log(key, value)
            }
            console.log('========================')
            
            const response = await api.post('/admin/products', formDataToSend, {
              headers: {
                'Content-Type': 'multipart/form-data',
              },
            })
            
            const productWithId: Product = {
              id: response.data._id || Date.now().toString(),
              name: formData.name,
              category: formData.category,
              price: Number.parseFloat(formData.price),
              quantity: Number.parseInt(formData.quantity),
              status: "active",
              image: response.data.mainImage?.url || response.data.image || null
            }
            
            setProducts([...products, productWithId])
            toast.success("Product added successfully with image")
          } else {
            // Use JSON when no image (original approach)
            const newProduct = {
              name: formData.name.trim(),
              category: formData.category.trim(),
              price: Number.parseFloat(formData.price),
              quantity: Number.parseInt(formData.quantity),
              description: formData.description || '', // Added description field
            }
            
            console.log('=== SENDING JSON DATA ===')
            console.log('formData.description:', formData.description)
            console.log('newProduct.description:', newProduct.description)
            console.log('Complete newProduct:', newProduct)
            console.log('========================')
            
            const response = await api.post('/admin/products', newProduct)
            
            const productWithId: Product = {
              id: response.data._id || Date.now().toString(),
              ...newProduct,
              status: "active",
            }
            
            setProducts([...products, productWithId])
            toast.success("Product added successfully")
          }
        }
        
        // Refresh appropriate list
        if (showDeactivated) {
          fetchDeactivatedProducts()
        } else {
          fetchProducts()
        }
        
        toast.success(confirmDialog.type === "edit" ? "Product updated successfully" : "Product added successfully")
        
        // Close dialog after success
        setIsDialogOpen(false)
      } catch (error: any) {
        console.error('Error saving product:', error)
        console.error('Error response:', error.response?.data)
        console.error('Error status:', error.response?.status)
        toast.error(confirmDialog.type === "edit" ? "Failed to update product" : "Failed to add product")
      } finally {
        setIsSubmitting(false)
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
    setImagePreview(product.image || null)
    setSelectedImage(null)
    setIsDialogOpen(true)
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedImage(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeImage = () => {
    setSelectedImage(null)
    setImagePreview(null)
  }

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Product Management</h2>
          <p className="text-slate-600 dark:text-slate-400 mt-2">Add, edit, or manage products</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open)
          if (!open) {
            // Dialog close ho raha hai - form clear karo
            setFormData({ 
              name: "", 
              category: "",
              price: "",
              quantity: "",
              description: ""
            })
            setSelectedImage(null)
            setImagePreview(null)
            setEditingId(null)
          } else {
            // Dialog open ho raha hai - agar editingId nahi hai to form clear karo
            if (!editingId) {
              setFormData({ 
                name: "", 
                category: "",
                price: "",
                quantity: "",
                description: ""
              })
              setSelectedImage(null)
              setImagePreview(null)
            }
          }
        }}>
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
                <label className="text-sm font-medium">Product Image</label>
                <div className="mt-2">
                  {imagePreview ? (
                    <div className="relative">
                      <img 
                        src={imagePreview} 
                        alt="Product preview" 
                        className="w-32 h-32 object-cover rounded-md border border-gray-300 dark:border-slate-700"
                      />
                      <button
                        type="button"
                        onClick={removeImage}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-gray-300 dark:border-slate-700 rounded-md p-4">
                      <label htmlFor="image-upload" className="cursor-pointer flex flex-col items-center">
                        <Upload className="w-8 h-8 text-gray-400 mb-2" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Click to upload image
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                          PNG, JPG, GIF up to 10MB
                        </span>
                      </label>
                      <input
                        id="image-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </div>
                  )}
                </div>
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
              <Button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-cyan-600" disabled={isSubmitting}>
                {isSubmitting ? (
                  <div className="flex items-center justify-center">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    {editingId ? "Updating..." : "Adding..."}
                  </div>
                ) : (
                  <>
                    {editingId ? "Update Product" : "Add Product"}
                  </>
                )}
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
                <TableHead>Image</TableHead>
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
                  <TableCell>
                    {product.image ? (
                      <img 
                        src={product.image} 
                        alt={product.name}
                        className="w-12 h-12 object-cover rounded-md border border-gray-300 dark:border-slate-700"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gray-200 dark:bg-slate-700 rounded-md flex items-center justify-center">
                        <span className="text-xs text-gray-500 dark:text-gray-400">No img</span>
                      </div>
                    )}
                  </TableCell>
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
