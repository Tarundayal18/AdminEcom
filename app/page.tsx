"use client"

import { useState, useEffect } from "react"
import { LoginPage } from "@/components/auth/login-page"
import { AdminDashboard } from "@/components/admin/dashboard"
import { ThemeProvider } from "@/components/theme-provider"
import { authApi } from "@/lib/auth"

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if token exists in localStorage on app load
    const token = localStorage.getItem('token')
    if (token) {
      setIsLoggedIn(true)
    }
    setLoading(false)
  }, [])

  const handleLoginSuccess = () => {
    setIsLoggedIn(true)
  }

  const handleLogout = async () => {
    try {
      // Call logout API
      await authApi.logout()
    } catch (error) {
      console.error('Logout API error:', error)
    } finally {
      // Always clear token and update state
      localStorage.removeItem('token')
      setIsLoggedIn(false)
    }
  }

  if (loading) {
    return (
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </ThemeProvider>
    )
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      {isLoggedIn ? (
        <AdminDashboard onLogout={handleLogout} />
      ) : (
        <LoginPage onLoginSuccess={handleLoginSuccess} />
      )}
    </ThemeProvider>
  )
}
