"use client"

import { useState } from "react"
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
import { Mail, Eye, CheckCircle } from "lucide-react"
import { ConfirmationDialog } from "../ui/confirmation-dialog"

interface Estimate {
  id: string
  company: string
  products: string
  quantity: number
  total: number
  date: string
  status: "new" | "sent" | "closed"
}

export function EstimateManagement() {
  const [estimates, setEstimates] = useState<Estimate[]>([
    {
      id: "1",
      company: "Tech Corp",
      products: "Professional License, Support",
      quantity: 5,
      total: 2495,
      date: "2024-01-15",
      status: "new",
    },
    {
      id: "2",
      company: "Global Solutions",
      products: "Enterprise Package",
      quantity: 2,
      total: 1998,
      date: "2024-01-14",
      status: "sent",
    },
  ])

  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean
    type: "send" | "close" | null
    estimateId?: string
  }>({
    open: false,
    type: null,
  })

  const updateStatus = (id: string, status: "sent" | "closed") => {
    setConfirmDialog({
      open: true,
      type: status === "sent" ? "send" : "close",
      estimateId: id,
    })
  }

  const handleConfirmStatusUpdate = (newStatus: "sent" | "closed") => {
    if (confirmDialog.estimateId) {
      setEstimates(estimates.map((e) => (e.id === confirmDialog.estimateId ? { ...e, status: newStatus } : e)))
    }
    setConfirmDialog({ open: false, type: null })
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
          <Table>
            <TableHeader>
              <TableRow className="dark:border-slate-800">
                <TableHead>Company</TableHead>
                <TableHead>Products</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Total Amount</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {estimates.map((estimate) => (
                <TableRow key={estimate.id} className="dark:border-slate-800">
                  <TableCell className="font-medium text-slate-900 dark:text-white">{estimate.company}</TableCell>
                  <TableCell className="text-slate-600 dark:text-slate-300 text-sm">{estimate.products}</TableCell>
                  <TableCell className="text-slate-600 dark:text-slate-300">{estimate.quantity}</TableCell>
                  <TableCell className="font-semibold text-slate-900 dark:text-white">
                    ${estimate.total.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-slate-600 dark:text-slate-300 text-sm">{estimate.date}</TableCell>
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
                            className="text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="dark:bg-slate-900 dark:border-slate-800">
                          <DialogHeader>
                            <DialogTitle>Estimate Details</DialogTitle>
                            <DialogDescription>View full estimate information</DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Company</p>
                                <p className="font-medium">{estimate.company}</p>
                              </div>
                              <div>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Date</p>
                                <p className="font-medium">{estimate.date}</p>
                              </div>
                            </div>
                            <div>
                              <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">Products</p>
                              <p className="font-medium">{estimate.products}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Quantity</p>
                                <p className="font-medium">{estimate.quantity}</p>
                              </div>
                              <div>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Total</p>
                                <p className="font-bold text-lg text-blue-600">${estimate.total.toLocaleString()}</p>
                              </div>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                      {estimate.status === "new" && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => updateStatus(estimate.id, "sent")}
                          className="text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"
                          title="Send Estimate"
                        >
                          <Mail className="w-4 h-4" />
                        </Button>
                      )}
                      {estimate.status === "sent" && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => updateStatus(estimate.id, "closed")}
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
