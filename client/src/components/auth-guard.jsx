"use client"

import { useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import { useEffect } from "react"

export default function AuthGuard({ children, requiredRole = null }) {
  const { user, isAuthenticated, loading } = useSelector((state) => state.users)
  const navigate = useNavigate()

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        navigate("/login")
        return
      }

      if (requiredRole && user?.role !== requiredRole) {
        navigate("/unauthorized")
        return
      }
    }
  }, [isAuthenticated, user, loading, requiredRole, navigate])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!isAuthenticated || (requiredRole && user?.role !== requiredRole)) {
    return null
  }

  return children
}
