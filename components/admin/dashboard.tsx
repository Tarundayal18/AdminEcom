"use client"

import { useState } from "react"
import { Sidebar } from "@/components/admin/sidebar"
import { UsersManagement } from "@/components/admin/users-management"
import { ProductManagement } from "@/components/admin/product-management"
import { EstimateManagement } from "@/components/admin/estimate-management"
import { DashboardHome } from "@/components/admin/dashboard-home"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"

interface AdminDashboardProps {
  onLogout: () => void
}

export function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const [activeSection, setActiveSection] = useState("dashboard")

  const renderSection = () => {
    switch (activeSection) {
      case "dashboard":
        return <DashboardHome />
      case "users":
        return <UsersManagement />
      case "products":
        return <ProductManagement />
      case "estimates":
        return <EstimateManagement />
      default:
        return <DashboardHome />
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex">
      <Sidebar activeSection={activeSection} onSectionChange={setActiveSection} />

      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-4 md:p-6 flex items-center justify-between">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">B2B Admin Panel</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage users, products, and estimates</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onLogout}
            className="flex items-center gap-2 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 bg-transparent"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto">{renderSection()}</div>
      </div>
    </div>
  )
}
