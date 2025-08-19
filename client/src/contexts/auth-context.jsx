"use client"

import { createContext, useContext, useState } from "react"

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  const login = async (email, password) => {
    try {
      // In a real app, this would be an API call to your backend
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })

      const result = await response.json()

      if (result.success) {
        const userData = {
          id: result.data.id,
          email: result.data.email,
          role: result.data.role,
          firstName: result.data.name.split(" ")[0],
          lastName: result.data.name.split(" ")[1] || "",
        }
        setUser(userData)
        setIsAuthenticated(true)
        return { success: true, user: userData }
      }

      return { success: false, error: result.msg || "Login failed" }
    } catch (error) {
      // Fallback to demo credentials for development
      const demoCredentials = [
        { email: "admin@demo.com", password: "demo123", role: "admin", name: "Admin User" },
        { email: "super@demo.com", password: "demo123", role: "supervisor", name: "Supervisor User" },
        { email: "client@demo.com", password: "demo123", role: "client", name: "Client User" },
      ]

      const validUser = demoCredentials.find((cred) => cred.email === email && cred.password === password)

      if (validUser) {
        const userData = {
          id: Math.random().toString(36).substr(2, 9),
          email: validUser.email,
          role: validUser.role,
          firstName: validUser.name.split(" ")[0],
          lastName: validUser.name.split(" ")[1] || "",
        }
        setUser(userData)
        setIsAuthenticated(true)
        return { success: true, user: userData }
      }

      return { success: false, error: "Invalid credentials" }
    }
  }

  const register = async (email, password, firstName, lastName) => {
    try {
      // In a real app, this would be an API call to your backend
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          password,
        }),
      })

      const result = await response.json()
      return result
    } catch (error) {
      // Fallback for development
      if (email && password && firstName && lastName) {
        return {
          success: true,
          msg: "Registration successful. Please login with your credentials.",
        }
      }
      return { success: false, error: "Registration failed" }
    }
  }

  const logout = () => {
    setUser(null)
    setIsAuthenticated(false)
  }

  const forgotPassword = (email) => {
    // Simulate forgot password logic
    return { success: true, message: "Reset link sent" }
  }

  const value = {
    user,
    isAuthenticated,
    login,
    register,
    logout,
    forgotPassword,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
