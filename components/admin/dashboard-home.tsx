"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Package, ShoppingCart, Clock } from "lucide-react"

export function DashboardHome() {
  const [stats] = useState({
    pendingUsers: 5,
    approvedUsers: 24,
    totalProducts: 42,
    newEstimates: 8,
  })

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

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={Clock} label="Pending Users" value={stats.pendingUsers} color="bg-amber-600" />
        <StatCard icon={Users} label="Approved Users" value={stats.approvedUsers} color="bg-green-600" />
        <StatCard icon={Package} label="Total Products" value={stats.totalProducts} color="bg-blue-600" />
        <StatCard icon={ShoppingCart} label="New Estimates" value={stats.newEstimates} color="bg-cyan-600" />
      </div>

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
