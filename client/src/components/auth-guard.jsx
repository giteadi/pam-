"use client"

import { useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import { useEffect } from "react"

export default function AuthGuard({ children, requiredRole = null, allowedRoles = null }) {
  const { user, isAuthenticated, loading } = useSelector((state) => state.users)
  const navigate = useNavigate()

  useEffect(() => {
    // Don't redirect while loading
    if (loading) return

    // Check if user is authenticated
    if (!isAuthenticated || !user) {
      navigate("/login", { replace: true })
      return
    }

    if (requiredRole && user?.role !== requiredRole) {
      navigate("/dashboard", { replace: true })
      return
    }

    if (allowedRoles && !allowedRoles.includes(user?.role)) {
      navigate("/dashboard", { replace: true })
      return
    }
  }, [isAuthenticated, user, loading, requiredRole, allowedRoles, navigate])

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="text-slate-600">Loading...</span>
        </div>
      </div>
    )
  }

  // Don't render anything if not authenticated or wrong role
  if (
    !isAuthenticated ||
    !user ||
    (requiredRole && user?.role !== requiredRole) ||
    (allowedRoles && !allowedRoles.includes(user?.role))
  ) {
    return null
  }

  return children
}
