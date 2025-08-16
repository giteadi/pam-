"use client"

import { useAuth } from "../contexts/auth-context"
import { useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"

export default function AuthGuard({ children }) {
  const { user, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    console.log("[v0] AuthGuard - isAuthenticated:", isAuthenticated, "pathname:", location.pathname)
    if (!isAuthenticated && location.pathname !== "/login") {
      console.log("[v0] Not authenticated, redirecting to login")
      navigate("/login", { replace: true })
    }
  }, [isAuthenticated, navigate, location.pathname])

  if (!isAuthenticated && location.pathname !== "/login") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Redirecting to login...</p>
        </div>
      </div>
    )
  }

  return children
}
