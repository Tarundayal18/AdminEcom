"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, Eye, EyeOff, Loader2 } from "lucide-react"
import { ConfirmationDialog } from "../ui/confirmation-dialog"
import { api } from "@/lib/api"

interface User {
  _id: number
  companyName: string
  contactPerson: string
  email: string
  username: string
  status: "pending" | "approved" | "disabled"
  isFirstLogin: boolean
}

export function UsersManagement() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<number | null>(null)
  const [showPassword, setShowPassword] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")

  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean
    type: "approve" | "reject" | "reset" | "toggle" | null
    userId?: number
    userName?: string
  }>({
    open: false,
    type: null,
  })

  useEffect(() => {
    fetchUsers()
    
    // Debug: Check current token
    const token = localStorage.getItem('token')
    console.log('=== TOKEN DEBUG ===')
    console.log('Token from localStorage:', token)
    console.log('Token length:', token?.length)
    console.log('Token starts with Bearer?', token?.startsWith('Bearer'))
    console.log('==================')
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const response = await api.get('/admin/users')
      const usersData = response.data.data || response.data
      setUsers(usersData)
    } catch (err) {
      console.error('Error fetching users:', err)
      setError('Failed to fetch users')
    } finally {
      setLoading(false)
    }
  }

  const filteredUsers = users.filter(
    (u) =>
      u.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const approveUser = async (id: number) => {
    console.log('🔘 APPROVE BUTTON CLICKED!')
    console.log('🆔 User ID from approveUser:', id)
    const user = users.find((u) => u._id === id)
    console.log('👤 User found:', user)
    console.log('🔍 User ID property:', user?._id)
    setConfirmDialog({
      open: true,
      type: "approve",
      userId: user?._id,
      userName: user?.contactPerson,
    })
  }

  const rejectUser = async (id: number) => {
    console.log('❌ REJECT BUTTON CLICKED!')
    console.log('🆔 User ID from rejectUser:', id)
    const user = users.find((u) => u._id === id)
    console.log('👤 User found:', user)
    console.log('🔍 User ID property:', user?._id)
    setConfirmDialog({
      open: true,
      type: "reject",
      userId: user?._id,
      userName: user?.contactPerson,
    })
  }

  const updateUserStatus = async (id: number, status: string) => {
    try {
      setActionLoading(id)
      
      // Manual test - create request exactly as backend expects
      const token = localStorage.getItem('token')
      const fullUrl = `http://localhost:5001/api/v1/admin/users/${id}`
      
      console.log(`=== MANUAL REQUEST TEST ===`)
      console.log('🆔 User ID being updated:', id)
      console.log('📝 New Status:', status)
      console.log('🔗 Full URL:', fullUrl)
      console.log('🎫 Full Token:', token)
      console.log('📤 Request Body:', JSON.stringify({ status }, null, 2))
      console.log('📋 Complete Request Details:')
      console.log({
        url: fullUrl,
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: { status }
      })
      console.log('============================')
      
      // Create the exact request with user ID in URL
      const response = await fetch(fullUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      })
      
      console.log('📬 Response Status:', response.status)
      console.log('📬 Response Headers:', response.headers)
      
      const responseData = await response.json()
      console.log('📬 Response Data:', responseData)
      
      if (response.ok) {
        // Refresh users list after successful update
        await fetchUsers()
        console.log('✅ Users refreshed successfully')
      } else {
        throw new Error(responseData.message || 'Update failed')
      }
      
    } catch (error: any) {
      console.error('❌ Error updating user status:', error)
      alert(`Failed to update user status: ${error.message}`)
    } finally {
      setActionLoading(null)
    }
  }

  const toggleUserStatus = (id: number) => {
    const user = users.find((u) => u._id === id)
    setConfirmDialog({
      open: true,
      type: "toggle",
      userId: user?._id,
      userName: user?.contactPerson,
    })
  }

  const disableUser = async (id: number) => {
    try {
      setActionLoading(id)
      
      const token = localStorage.getItem('token')
      const fullUrl = `http://localhost:5001/api/v1/admin/users/disable/${id}`
      
      console.log(`=== DISABLE USER REQUEST ===`)
      console.log('🆔 User ID to disable:', id)
      console.log('🔗 Full URL:', fullUrl)
      console.log('🎫 Full Token:', token)
      console.log('📤 Request Body: None (empty)')
      console.log('============================')
      
      const response = await fetch(fullUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      console.log('📬 Response Status:', response.status)
      console.log('📬 Response Headers:', response.headers)
      
      // Check if response is JSON before parsing
      const contentType = response.headers.get('content-type')
      console.log('📬 Content-Type:', contentType)
      
      let responseData
      if (contentType && contentType.includes('application/json')) {
        responseData = await response.json()
        console.log('📬 Response Data (JSON):', responseData)
      } else {
        const textData = await response.text()
        console.log('📬 Response Data (Text):', textData)
        console.log('📬 First 200 chars:', textData.substring(0, 200))
        throw new Error('Server returned non-JSON response')
      }
      
      if (response.ok) {
        await fetchUsers()
        console.log('✅ Users refreshed successfully')
      } else {
        throw new Error(responseData.message || 'Disable failed')
      }
      
    } catch (error: any) {
      console.error('❌ Error disabling user:', error)
      alert(`Failed to disable user: ${error.message}`)
    } finally {
      setActionLoading(null)
    }
  }

  const handleConfirmAction = async () => {
    console.log('🎯 CONFIRM ACTION CLICKED!')
    console.log('📋 Dialog State:', confirmDialog)
    
    if (!confirmDialog.userId) {
      console.log('❌ No userId in dialog state')
      return
    }

    console.log('🔄 Processing action type:', confirmDialog.type)
    console.log('🆔 Processing user ID:', confirmDialog.userId)

    switch (confirmDialog.type) {
      case "approve":
        console.log('✅ Calling updateUserStatus with approved')
        await updateUserStatus(confirmDialog.userId, "approved")
        break
      case "reject":
        console.log('❌ Calling updateUserStatus with rejected')
        await updateUserStatus(confirmDialog.userId, "rejected")
        break
      case "toggle":
        console.log('🔄 Calling disableUser function')
        await disableUser(confirmDialog.userId)
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

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
          <span className="ml-2 text-slate-600 dark:text-slate-400">Loading users...</span>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-600 dark:text-red-400">{error}</p>
          <button 
            onClick={fetchUsers}
            className="mt-2 text-sm text-red-600 dark:text-red-400 hover:underline"
          >
            Try again
          </button>
        </div>
      )}

      {/* Users Table */}
      {!loading && !error && (
        <Card className="dark:border-slate-800">
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <CardTitle>Registered Users</CardTitle>
                <CardDescription>View and manage all user accounts</CardDescription>
              </div>
              <Input
                placeholder="Search by company, email, contact person..."
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
                  <TableHead>Contact Person</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Username</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user._id} className="dark:border-slate-800">
                    <TableCell className="font-medium text-slate-900 dark:text-white">{user.companyName}</TableCell>
                    <TableCell className="text-slate-600 dark:text-slate-300">{user.contactPerson}</TableCell>
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
                              onClick={() => approveUser(user._id)}
                              title="Approve"
                              className="text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"
                              disabled={actionLoading === user._id}
                            >
                              {actionLoading === user._id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <CheckCircle className="w-4 h-4" />
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => rejectUser(user._id)}
                              title="Reject"
                              className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                              disabled={actionLoading === user._id}
                            >
                              {actionLoading === user._id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <XCircle className="w-4 h-4" />
                              )}
                            </Button>
                          </>
                        )}
                        {user.status === "approved" && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => toggleUserStatus(user._id)}
                            title="Disable User"
                            className="text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        )}
                        {user.status === "disabled" && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => toggleUserStatus(user._id)}
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
                {filteredUsers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-slate-500 dark:text-slate-400">
                      No users found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

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
