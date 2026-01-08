"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, Key, Eye, EyeOff } from "lucide-react"
import { ConfirmationDialog } from "../ui/confirmation-dialog"

interface User {
  id: string
  company: string
  contact: string
  email: string
  phone: string
  username: string
  status: "pending" | "approved" | "disabled"
}

export function UsersManagement() {
  const [users, setUsers] = useState<User[]>([
    {
      id: "1",
      company: "Tech Corp",
      contact: "John Doe",
      email: "john@techcorp.com",
      phone: "+1-555-0001",
      username: "johndoe",
      status: "pending",
    },
    {
      id: "2",
      company: "Global Solutions",
      contact: "Jane Smith",
      email: "jane@globalsol.com",
      phone: "+1-555-0002",
      username: "janesmith",
      status: "approved",
    },
  ])

  const [showPassword, setShowPassword] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")

  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean
    type: "approve" | "reject" | "reset" | "toggle" | null
    userId?: string
    userName?: string
  }>({
    open: false,
    type: null,
  })

  const filteredUsers = users.filter(
    (u) =>
      u.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.contact.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const approveUser = (id: string) => {
    const user = users.find((u) => u.id === id)
    setConfirmDialog({
      open: true,
      type: "approve",
      userId: id,
      userName: user?.contact,
    })
  }

  const rejectUser = (id: string) => {
    const user = users.find((u) => u.id === id)
    setConfirmDialog({
      open: true,
      type: "reject",
      userId: id,
      userName: user?.contact,
    })
  }

  const toggleUserStatus = (id: string) => {
    const user = users.find((u) => u.id === id)
    setConfirmDialog({
      open: true,
      type: "toggle",
      userId: id,
      userName: user?.contact,
    })
  }

  const resetPassword = (id: string) => {
    const user = users.find((u) => u.id === id)
    setConfirmDialog({
      open: true,
      type: "reset",
      userId: id,
      userName: user?.contact,
    })
  }

  const handleConfirmAction = () => {
    if (!confirmDialog.userId) return

    switch (confirmDialog.type) {
      case "approve":
        setUsers(users.map((u) => (u.id === confirmDialog.userId ? { ...u, status: "approved" } : u)))
        break
      case "reject":
        setUsers(users.filter((u) => u.id !== confirmDialog.userId))
        break
      case "toggle":
        setUsers(
          users.map((u) =>
            u.id === confirmDialog.userId ? { ...u, status: u.status === "disabled" ? "approved" : "disabled" } : u,
          ),
        )
        break
      case "reset":
        alert(`Password reset email sent to ${confirmDialog.userName}`)
        break
    }

    setConfirmDialog({ open: false, type: null })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200"
      case "approved":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "disabled":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      default:
        return ""
    }
  }

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white">User Management</h2>
          <p className="text-slate-600 dark:text-slate-400 mt-2">Approve, reject, or manage user registrations</p>
        </div>
      </div>

      <Card className="dark:border-slate-800">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle>Registered Users</CardTitle>
              <CardDescription>View and manage all user accounts</CardDescription>
            </div>
            <Input
              placeholder="Search by company, email..."
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
                <TableHead>Company</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Username</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id} className="dark:border-slate-800">
                  <TableCell className="font-medium text-slate-900 dark:text-white">{user.company}</TableCell>
                  <TableCell className="text-slate-600 dark:text-slate-300">{user.contact}</TableCell>
                  <TableCell className="text-slate-600 dark:text-slate-300">{user.email}</TableCell>
                  <TableCell className="text-slate-600 dark:text-slate-300">{user.username}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(user.status)}>
                      {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      {user.status === "pending" && (
                        <>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => approveUser(user.id)}
                            title="Approve"
                            className="text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => rejectUser(user.id)}
                            title="Reject"
                            className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                          >
                            <XCircle className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                      {user.status === "approved" && (
                        <>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => resetPassword(user.id)}
                            title="Reset Password"
                            className="text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                          >
                            <Key className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => toggleUserStatus(user.id)}
                            title="Disable User"
                            className="text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                      {user.status === "disabled" && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => toggleUserStatus(user.id)}
                          title="Enable User"
                          className="text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                        >
                          <EyeOff className="w-4 h-4" />
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
        open={confirmDialog.open && confirmDialog.type === "approve"}
        onOpenChange={(open) =>
          setConfirmDialog({
            ...confirmDialog,
            open: open && confirmDialog.type === "approve",
          })
        }
        title="Approve User?"
        description={`Are you sure you want to approve ${confirmDialog.userName}?`}
        actionLabel="Approve"
        onConfirm={handleConfirmAction}
      />

      <ConfirmationDialog
        open={confirmDialog.open && confirmDialog.type === "reject"}
        onOpenChange={(open) =>
          setConfirmDialog({
            ...confirmDialog,
            open: open && confirmDialog.type === "reject",
          })
        }
        title="Reject User?"
        description={`Are you sure you want to reject ${confirmDialog.userName}? This action cannot be undone.`}
        actionLabel="Reject"
        variant="destructive"
        onConfirm={handleConfirmAction}
      />

      <ConfirmationDialog
        open={confirmDialog.open && confirmDialog.type === "toggle"}
        onOpenChange={(open) =>
          setConfirmDialog({
            ...confirmDialog,
            open: open && confirmDialog.type === "toggle",
          })
        }
        title="Change User Status?"
        description={`Are you sure you want to toggle ${confirmDialog.userName}'s status?`}
        actionLabel="Toggle"
        onConfirm={handleConfirmAction}
      />

      <ConfirmationDialog
        open={confirmDialog.open && confirmDialog.type === "reset"}
        onOpenChange={(open) =>
          setConfirmDialog({
            ...confirmDialog,
            open: open && confirmDialog.type === "reset",
          })
        }
        title="Reset Password?"
        description={`A password reset email will be sent to ${confirmDialog.userName}. Are you sure?`}
        actionLabel="Send Reset Email"
        onConfirm={handleConfirmAction}
      />
    </div>
  )
}
