"use client"

import { createContext, useContext, useState } from "react"

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  const login = (email, password, role) => {
    // Simulate login logic
    const demoCredentials = [
      { email: "admin@demo.com", password: "demo123", role: "admin" },
      { email: "super@demo.com", password: "demo123", role: "supervisor" },
      { email: "client@demo.com", password: "demo123", role: "client" },
    ]

    const validUser = demoCredentials.find(
      (cred) => cred.email === email && cred.password === password && cred.role === role,
    )

    if (validUser) {
      const userData = {
        id: Math.random().toString(36).substr(2, 9),
        email: validUser.email,
        role: validUser.role,
        firstName: validUser.role.charAt(0).toUpperCase() + validUser.role.slice(1),
        lastName: "User",
      }
      setUser(userData)
      setIsAuthenticated(true)
      return { success: true, user: userData }
    }

    return { success: false, error: "Invalid credentials" }
  }

  const register = (email, password, firstName, lastName, role) => {
    // Simulate registration logic
    if (email && password && firstName && lastName) {
      const userData = {
        id: Math.random().toString(36).substr(2, 9),
        email,
        role,
        firstName,
        lastName,
      }
      // In a real app, you wouldn't auto-login after registration
      // setUser(userData)
      // setIsAuthenticated(true)
      return { success: true, user: userData }
    }

    return { success: false, error: "Registration failed" }
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
