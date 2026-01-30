"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Lock } from "lucide-react"
import { authApi } from "@/lib/auth"
import { toast } from "sonner"
import { loginSchema } from "@/lib/validations"

interface LoginPageProps {
  onLoginSuccess: () => void
}

export function LoginPage({ onLoginSuccess }: LoginPageProps) {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    // Client-side validation
    const validationResult = loginSchema.safeParse({ username, password })
    
    if (!validationResult.success) {
      const errorMessage = validationResult.error.errors[0]?.message || 'Validation failed'
      setError(errorMessage)
      toast.error(errorMessage)
      setIsLoading(false)
      return
    }

    try {
      console.log('Attempting login with:', { username, password: '***' })
      const response = await authApi.login({ username, password })
      console.log('Login response:', response)
      
      if (response.success === true) {
        console.log('Login successful, redirecting to dashboard')
        // Handle both response formats - token can be at root or in data
        const token = response.token || response.data?.token
        if (token) {
          localStorage.setItem('token', token)
        }
        onLoginSuccess()
      } else {
        console.log('Login failed:', response)
        const errorMsg = response.error || response.message || 'Invalid username or password'
        setError(errorMsg)
        toast.error(errorMsg)
        // Don't call onLoginSuccess() - stay on login page
      }
    } catch (err: any) {
      console.error('Login error caught:', err)
      const errorMessage = err.response?.data?.error || err.response?.data?.message || err.message || 'Invalid username or password'
      setError(errorMessage)
      toast.error(errorMessage)
      // Don't call onLoginSuccess() - stay on login page
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl border-slate-700 bg-slate-800">
        <CardHeader className="space-y-2 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
              <Lock className="w-6 h-6 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl text-white">Admin Panel</CardTitle>
          <CardDescription className="text-slate-400">Enter your credentials to access the panel</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <Alert className="bg-red-500/10 border-red-500/20 text-red-400">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Username</label>
              <Input
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-500"
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Password</label>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-500"
                disabled={isLoading}
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold"
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
