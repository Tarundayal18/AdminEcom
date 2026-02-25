"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Mail, Eye, CheckCircle, Download } from "lucide-react"
import { ConfirmationDialog } from "../ui/confirmation-dialog"
import { toast } from "sonner"
import { api } from "@/lib/api"
import * as XLSX from 'xlsx'

interface EstimateItem {
  productId: {
    _id: string
    name: string
    category: string
    price: number
  }
  quantity: number
  price: number
  _id: string
}

interface Estimate {
  _id: string
  userId: number | {
    _id: string
    companyName: string
    contactPerson: string
    email: string
    phone: string
  }
  items: EstimateItem[]
  status: "new" | "sent" | "closed"
  createdAt: string
  __v: number
}

export function EstimateManagement() {
  const [estimates, setEstimates] = useState<Estimate[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedEstimate, setSelectedEstimate] = useState<Estimate | null>(null)
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean
    type: "send" | "close" | null
    estimateId?: string
  }>({
    open: false,
    type: null,
  })

  // Fetch estimates from API
  const fetchEstimates = async () => {
    try {
      setLoading(true)
      console.log('Fetching estimates from:', 'https://lot-ecom-backend.onrender.com/api/v1/estimate/admin/all')
      const response = await api.get('/estimate/admin/all')
      console.log('Estimates response:', response.data)
      
      if (response.data.success) {
        console.log('Estimates data:', response.data.data)
        setEstimates(response.data.data)
      } else {
        toast.error('Failed to fetch estimates')
      }
    } catch (error: any) {
      console.error('Error fetching estimates:', error)
      console.error('Error response:', error.response?.data)
      toast.error('Failed to fetch estimates')
    } finally {
      setLoading(false)
    }
  }

  // Fetch estimates on component mount
  useEffect(() => {
    fetchEstimates()
  }, [])

  // Calculate total for an estimate
  const calculateTotal = (items: EstimateItem[]) => {
    return items.reduce((total, item) => total + item.price, 0)
  }

  // Format user ID or company name
  const formatUserId = (userId: number | any) => {
    if (typeof userId === 'number') {
      return `#₹{userId}`
    }
    if (typeof userId === 'object' && userId?.companyName) {
      return userId.companyName
    }
    return 'Unknown User'
  }

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const updateStatus = (id: string, status: "sent" | "closed") => {
    setConfirmDialog({
      open: true,
      type: status === "sent" ? "send" : "close",
      estimateId: id,
    })
  }

  const handleConfirmStatusUpdate = (newStatus: "sent" | "closed") => {
    if (confirmDialog.estimateId) {
      setEstimates(estimates.map((e) => (e._id === confirmDialog.estimateId ? { ...e, status: newStatus } : e)))
    }
    setConfirmDialog({ open: false, type: null })
  }

  // Export estimate to Excel
  const exportToExcel = (estimate: Estimate) => {
    try {
      // Prepare data for Excel
      const excelData = estimate.items.map((item) => ({
        'Product Name': item.productId?.name || 'Unknown Product',
        'Category': item.productId?.category || 'Unknown Category',
        'Quantity': item.quantity,
        'Unit Price': item.productId?.price || 0,
        'Total Price': item.price,
      }))

      // Add total row
      excelData.push({
        'Product Name': 'TOTAL',
        'Category': '' as any,
        'Quantity': null as any,
        'Unit Price': null as any,
        'Total Price': calculateTotal(estimate.items),
      })

      // Create workbook
      const ws = XLSX.utils.json_to_sheet(excelData)
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, 'Estimate')

      // Add header info
      const headerInfo = [
        [`Estimate ID: ₹{estimate._id}`],
        [`Customer: ₹{formatUserId(estimate.userId)}`],
        [`Date: ₹{formatDate(estimate.createdAt)}`],
        [`Status: ₹{estimate.status.toUpperCase()}`],
        [],
      ]

      // Insert header info at the top
      XLSX.utils.sheet_add_aoa(ws, headerInfo, { origin: 'A1' })

      // Generate filename
      const fileName = `Estimate_₹{estimate._id}_₹{formatUserId(estimate.userId).replace(/[^a-zA-Z0-9]/g, '_')}_₹{new Date().toISOString().split('T')[0]}.xlsx`

      // Download file
      XLSX.writeFile(wb, fileName)
      toast.success('Estimate exported to Excel successfully')
    } catch (error) {
      console.error('Error exporting to Excel:', error)
      toast.error('Failed to export estimate to Excel')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "new":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      case "sent":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200"
      case "closed":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      default:
        return ""
    }
  }

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Estimate Management</h2>
        <p className="text-slate-600 dark:text-slate-400 mt-2">Review and manage customer estimates</p>
      </div>

      <Card className="dark:border-slate-800">
        <CardHeader>
          <CardTitle>All Estimates</CardTitle>
          <CardDescription>View and manage customer quotation requests</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {loading ? (
            <div className="text-center py-8">
              <p className="text-slate-600 dark:text-slate-400">Loading estimates...</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="dark:border-slate-800">
                  <TableHead>User ID</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Total Amount</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {estimates.map((estimate) => (
                  <TableRow key={estimate._id} className="dark:border-slate-800">
                    <TableCell className="font-medium text-slate-900 dark:text-white">
                      {formatUserId(estimate.userId)}
                    </TableCell>
                    <TableCell className="text-slate-600 dark:text-slate-300 text-sm">
                      {estimate.items.length} item{estimate.items.length !== 1 ? 's' : ''}
                    </TableCell>
                    <TableCell className="font-semibold text-slate-900 dark:text-white">
                      ₹{calculateTotal(estimate.items).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-slate-600 dark:text-slate-300 text-sm">
                      {formatDate(estimate.createdAt)}
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(estimate.status)}>
                        {estimate.status.charAt(0).toUpperCase() + estimate.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setSelectedEstimate(estimate)}
                              className="text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="dark:bg-slate-900 dark:border-slate-800 max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Estimate Details</DialogTitle>
                              <DialogDescription>View full estimate information</DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <p className="text-sm text-slate-500 dark:text-slate-400">User/Company</p>
                                  <p className="font-medium">{formatUserId(estimate.userId)}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-slate-500 dark:text-slate-400">Date</p>
                                  <p className="font-medium">{formatDate(estimate.createdAt)}</p>
                                </div>
                              </div>
                              <div>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">Items</p>
                                <div className="space-y-2">
                                  {estimate.items.map((item) => (
                                    <div key={item._id} className="flex justify-between items-center p-2 border rounded dark:border-slate-700">
                                      <div>
                                        <p className="font-medium">
                                          {item.productId?.name || 'Unknown Product'}
                                        </p>
                                        <p className="text-sm text-slate-500">
                                          {item.productId?.category || 'Unknown Category'} • Qty: {item.quantity}
                                        </p>
                                      </div>
                                      <p className="font-semibold">₹{item.price.toLocaleString()}</p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                              <div className="border-t pt-4">
                                <div className="flex justify-between items-center">
                                  <p className="text-sm text-slate-500 dark:text-slate-400">Total Amount</p>
                                  <p className="font-bold text-lg text-blue-600">
                                    ₹{calculateTotal(estimate.items).toLocaleString()}
                                  </p>
                                </div>
                              </div>
                              <div className="flex justify-end pt-4">
                                <Button
                                  onClick={() => exportToExcel(estimate)}
                                  className="bg-green-600 hover:bg-green-700 text-white"
                                >
                                  <Download className="w-4 h-4 mr-2" />
                                  Export to Excel
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                        {estimate.status === "new" && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => exportToExcel(estimate)}
                            className="text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"
                            title="Export to Excel"
                          >
                            <Mail className="w-4 h-4" />
                          </Button>
                        )}
                        {estimate.status === "sent" && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => updateStatus(estimate._id, "closed")}
                            className="text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                            title="Mark as Closed"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <ConfirmationDialog
        open={confirmDialog.open && confirmDialog.type === "send"}
        onOpenChange={(open) =>
          setConfirmDialog({
            ...confirmDialog,
            open: open && confirmDialog.type === "send",
          })
        }
        title="Send Estimate?"
        description="Are you sure you want to send this estimate to the customer?"
        actionLabel="Send"
        onConfirm={() => handleConfirmStatusUpdate("sent")}
      />

      <ConfirmationDialog
        open={confirmDialog.open && confirmDialog.type === "close"}
        onOpenChange={(open) =>
          setConfirmDialog({
            ...confirmDialog,
            open: open && confirmDialog.type === "close",
          })
        }
        title="Close Estimate?"
        description="Are you sure you want to mark this estimate as closed?"
        actionLabel="Close"
        onConfirm={() => handleConfirmStatusUpdate("closed")}
      />
    </div>
  )
}
