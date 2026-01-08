"use client"

import { useState } from "react"
import { LoginPage } from "@/components/auth/login-page"
import { AdminDashboard } from "@/components/admin/dashboard"
import { ThemeProvider } from "@/components/theme-provider"

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      {isLoggedIn ? (
        <AdminDashboard onLogout={() => setIsLoggedIn(false)} />
      ) : (
        <LoginPage onLoginSuccess={() => setIsLoggedIn(true)} />
      )}
    </ThemeProvider>
  )
}
