"use client"

import { useState } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/auth-context"
import NotificationPanel from "./notification-panel"

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const hasPermission = (permission) => {
    const userRole = user?.role
    const permissions = {
      canViewInspections: true, // All roles can view inspections
      canViewProperties: true, // All roles can view properties
      canAssignTasks: userRole === "admin" || userRole === "supervisor", // Only admin and supervisor
      canManageUsers: userRole === "admin", // Only admin
    }
    return permissions[permission] || false
  }

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  const getNavItemsForRole = () => {
    const userRole = user?.role

    if (userRole === "admin") {
      return [
        {
          id: "inspections",
          label: "Inspect Property",
          path: "/inspections",
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
          ),
        },
        {
          id: "task-assignment",
          label: "Task Assignment",
          path: "/task-assignment",
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          ),
        },
        {
          id: "users",
          label: "User Management",
          path: "/users",
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
              />
            </svg>
          ),
        },
      ]
    } else if (userRole === "supervisor") {
      return [
        {
          id: "task-assignment",
          label: "Assign Tasks",
          path: "/task-assignment",
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          ),
        },
        {
          id: "inspections",
          label: "Property Checklist",
          path: "/inspections",
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
          ),
        },
      ]
    } else if (userRole === "client") {
      return [
        {
          id: "properties",
          label: "My Properties",
          path: "/properties",
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
          ),
        },
        {
          id: "progress",
          label: "Property Progress",
          path: "/progress",
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          ),
        },
      ]
    }
    return []
  }

  const navItems = getNavItemsForRole()

  const isActive = (path) => {
    return location.pathname === path || (path === "/dashboard" && location.pathname === "/")
  }

  return (
    <nav className="bg-white shadow-lg border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/dashboard" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                  Property Inspector
                </h1>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-1">
              {navItems.map((item) => (
                <Link
                  key={item.id}
                  to={item.path}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center space-x-2 ${
                    isActive(item.path)
                      ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg"
                      : "text-slate-600 hover:text-slate-800 hover:bg-slate-100"
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Right Side - User Menu */}
          <div className="flex items-center space-x-4">
            <NotificationPanel />

            {/* User Info */}
            <div className="hidden sm:flex items-center space-x-3">
              <div className="text-right">
                <div className="text-sm font-semibold text-slate-800">
                  {user?.firstName} {user?.lastName}
                </div>
                <div className="text-xs text-slate-500 capitalize">{user?.role}</div>
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-slate-400 to-slate-500 rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-lg">
                {user?.firstName?.charAt(0)}
                {user?.lastName?.charAt(0)}
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="text-slate-500 hover:text-red-600 p-2 rounded-lg hover:bg-red-50 transition-all duration-200"
              title="Logout"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-slate-600 hover:text-slate-800 hover:bg-slate-100 transition-all duration-200"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.id}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`w-full text-left px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center space-x-3 ${
                    isActive(item.path)
                      ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg"
                      : "text-slate-600 hover:text-slate-800 hover:bg-slate-100"
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              ))}

              {/* Mobile User Info */}
              <div className="px-4 py-3 border-t border-slate-200 mt-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-slate-400 to-slate-500 rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-lg">
                    {user?.firstName?.charAt(0)}
                    {user?.lastName?.charAt(0)}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-slate-800">
                      {user?.firstName} {user?.lastName}
                    </div>
                    <div className="text-xs text-slate-500 capitalize">{user?.role}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
