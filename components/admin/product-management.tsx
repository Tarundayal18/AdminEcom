"use client"

import type React from "react"

import { useState } from "react"
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
import { Plus, Edit, Trash2, ToggleLeft as Toggle } from "lucide-react"
import { ConfirmationDialog } from "../ui/confirmation-dialog"

interface Product {
  id: string
  name: string
  price: number
  status: "active" | "inactive"
}

export function ProductManagement() {
  const [products, setProducts] = useState<Product[]>([
    {
      id: "1",
      name: "Professional License",
      price: 299,
      status: "active",
    },
    {
      id: "2",
      name: "Enterprise Package",
      price: 999,
      status: "active",
    },
    {
      id: "3",
      name: "Support Plan",
      price: 199,
      status: "inactive",
    },
  ])

  const [searchTerm, setSearchTerm] = useState("")
  const [formData, setFormData] = useState({ name: "", price: "" })
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean
    type: "add" | "edit" | "delete" | "toggle" | null
    productId?: string
  }>({
    open: false,
    type: null,
  })

  const filteredProducts = products.filter((p) => p.name.toLowerCase().includes(searchTerm.toLowerCase()))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setConfirmDialog({
      open: true,
      type: editingId ? "edit" : "add",
      productId: editingId || undefined,
    })
  }

  const handleConfirmAction = () => {
    if (confirmDialog.type === "add" || confirmDialog.type === "edit") {
      if (confirmDialog.type === "edit" && editingId) {
        setProducts(
          products.map((p) =>
            p.id === editingId
              ? {
                  ...p,
                  name: formData.name || p.name,
                  price: formData.price ? Number.parseFloat(formData.price) : p.price,
                }
              : p,
          ),
        )
        setEditingId(null)
      } else {
        const newProduct: Product = {
          id: Date.now().toString(),
          name: formData.name,
          price: Number.parseFloat(formData.price),
          status: "active",
        }
        setProducts([...products, newProduct])
      }
      setFormData({ name: "", price: "" })
      setIsDialogOpen(false)
    }
    setConfirmDialog({ open: false, type: null })
  }

  const deleteProduct = (id: string) => {
    setConfirmDialog({
      open: true,
      type: "delete",
      productId: id,
    })
  }

  const handleConfirmDelete = () => {
    if (confirmDialog.productId) {
      setProducts(products.filter((p) => p.id !== confirmDialog.productId))
    }
    setConfirmDialog({ open: false, type: null })
  }

  const toggleStatus = (id: string) => {
    setConfirmDialog({
      open: true,
      type: "toggle",
      productId: id,
    })
  }

  const handleConfirmToggle = () => {
    if (confirmDialog.productId) {
      setProducts(
        products.map((p) =>
          p.id === confirmDialog.productId ? { ...p, status: p.status === "active" ? "inactive" : "active" } : p,
        ),
      )
    }
    setConfirmDialog({ open: false, type: null })
  }

  const editProduct = (product: Product) => {
    setEditingId(product.id)
    setFormData({
      name: product.name,
      price: product.price.toString(),
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
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Add Product
            </Button>
          </DialogTrigger>
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
                <label className="text-sm font-medium">Price ($)</label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
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
              <CardTitle>All Products</CardTitle>
              <CardDescription>Manage your product catalog</CardDescription>
            </div>
            <Input
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="md:w-64 dark:bg-slate-800 dark:border-slate-700"
            />
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="dark:border-slate-800">
                <TableHead>Product Name</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((product) => (
                <TableRow key={product.id} className="dark:border-slate-800">
                  <TableCell className="font-medium text-slate-900 dark:text-white">{product.name}</TableCell>
                  <TableCell className="text-slate-600 dark:text-slate-300">${product.price.toFixed(2)}</TableCell>
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
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => toggleStatus(product.id)}
                        className="text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        <Toggle className="w-4 h-4" />
                      </Button>
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

      <ConfirmationDialog
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
      />
    </div>
  )
}
