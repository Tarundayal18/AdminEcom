"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Package, ShoppingCart, Clock, Loader2 } from "lucide-react"
import { api } from "@/lib/api"
import { statsApi } from "@/lib/auth"

interface User {
  id: number
  companyName: string
  contactPerson: string
  email: string
  username: string
  role: string
  status: string
  isFirstLogin: boolean
}

export function DashboardHome() {
  const [stats, setStats] = useState({
    pendingUsers: 0,
    approvedUsers: 0,
    totalProducts: 0,
    newEstimates: 0,
  })
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      
      // Fetch all data in parallel
      const [usersResponse, productsResponse, estimatesResponse] = await Promise.all([
        api.get('/admin/users'),
        statsApi.getTotalProducts(),
        statsApi.getNewEstimates()
      ])
      
      const usersData = usersResponse.data.data || usersResponse.data
      const totalProducts = productsResponse.data?.totalProducts || 0
      const newEstimates = estimatesResponse.data?.newEstimates || 0
      
      setUsers(usersData)
      
      // Calculate stats based on user status
      const pendingCount = usersData.filter((user: User) => user.status === 'pending').length
      const approvedCount = usersData.filter((user: User) => user.status === 'approved').length
      
      setStats({
        pendingUsers: pendingCount,
        approvedUsers: approvedCount,
        totalProducts: totalProducts,
        newEstimates: newEstimates,
      })
    } catch (err) {
      console.error('Error fetching dashboard data:', err)
      setError('Failed to fetch dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const StatCard = ({ icon: Icon, label, value, color }: any) => (
    <Card className="hover:shadow-lg transition-shadow duration-200 dark:border-slate-800">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">{label}</p>
            <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">{value}</p>
          </div>
          <div className={cn("p-3 rounded-lg", color)}>
            <Icon className="w-6 h-6 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="p-6 md:p-8 space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Welcome Back</h2>
        <p className="text-slate-600 dark:text-slate-400 mt-2">Here's a quick overview of your B2B platform</p>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
          <span className="ml-2 text-slate-600 dark:text-slate-400">Loading dashboard data...</span>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-600 dark:text-red-400">{error}</p>
          <button 
            onClick={fetchDashboardData}
            className="mt-2 text-sm text-red-600 dark:text-red-400 hover:underline"
          >
            Try again
          </button>
        </div>
      )}

      {/* Stats Grid */}
      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard icon={Clock} label="Pending Users" value={stats.pendingUsers} color="bg-amber-600" />
          <StatCard icon={Users} label="Approved Users" value={stats.approvedUsers} color="bg-green-600" />
          <StatCard icon={Package} label="Total Products" value={stats.totalProducts} color="bg-blue-600" />
          <StatCard icon={ShoppingCart} label="New Estimates" value={stats.newEstimates} color="bg-cyan-600" />
        </div>
      )}

      {/* Users Status Overview */}
      {!loading && !error && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pending Users */}
          <Card className="dark:border-slate-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-600" />
                Pending Users
              </CardTitle>
              <CardDescription>Users waiting for approval</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {users.filter(user => user.status === 'pending').slice(0, 5).map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">{user.companyName}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">{user.contactPerson}</p>
                    </div>
                    <span className="px-2 py-1 text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 rounded-full">
                      Pending
                    </span>
                  </div>
                ))}
                {users.filter(user => user.status === 'pending').length === 0 && (
                  <p className="text-slate-500 dark:text-slate-400 text-center py-4">No pending users</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Approved Users */}
          <Card className="dark:border-slate-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-green-600" />
                Approved Users
              </CardTitle>
              <CardDescription>Recently approved users</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {users.filter(user => user.status === 'approved').slice(0, 5).map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">{user.companyName}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">{user.contactPerson}</p>
                    </div>
                    <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 rounded-full">
                      Approved
                    </span>
                  </div>
                ))}
                {users.filter(user => user.status === 'approved').length === 0 && (
                  <p className="text-slate-500 dark:text-slate-400 text-center py-4">No approved users</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Recent Activity */}
      <Card className="dark:border-slate-800">
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest updates in your system</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { action: "New user registration", user: "John Doe", time: "2 hours ago" },
              { action: "Product added", user: "Premium Plan", time: "4 hours ago" },
              { action: "New estimate created", user: "Tech Corp", time: "6 hours ago" },
            ].map((item, i) => (
              <div
                key={i}
                className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 last:border-0"
              >
                <div>
                  <p className="font-medium text-slate-900 dark:text-white">{item.action}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{item.user}</p>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400">{item.time}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(" ")
}
