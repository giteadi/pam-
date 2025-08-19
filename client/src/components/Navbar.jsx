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
      canMonitorProgress: true, // All roles can monitor progress
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
          id: "property-inspection",
          label: "Property Inspection",
          path: "/property-inspection",
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
          id: "inspections",
          label: "Inspections",
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
        {
          id: "progress",
          label: "Monitor Progress",
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
    } else if (userRole === "supervisor") {
      return [
        {
          id: "property-inspection",
          label: "Property Inspection",
          path: "/property-inspection",
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
                d="M9 5H7a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
          ),
        },
        {
          id: "progress",
          label: "Monitor Progress",
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
          label: "Monitor Progress",
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
    <nav className="bg-white shadow-xl border-b border-slate-200 sticky top-0 z-50 backdrop-blur-sm bg-white/95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          <div className="flex items-center space-x-8">
            <Link to="/dashboard" className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center shadow-xl transform hover:scale-105 transition-all duration-200">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Property Inspector
                </h1>
                <p className="text-xs text-slate-500 font-medium">Professional Inspection Platform</p>
              </div>
            </Link>

            <div className="hidden lg:block">
              <div className="ml-10 flex items-center space-x-2">
                {navItems.map((item) => (
                  <Link
                    key={item.id}
                    to={item.path}
                    className={`px-5 py-3 rounded-2xl text-sm font-semibold transition-all duration-300 flex items-center space-x-3 transform hover:scale-105 ${
                      isActive(item.path)
                        ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-xl shadow-blue-500/25"
                        : "text-slate-600 hover:text-blue-600 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:shadow-lg"
                    }`}
                  >
                    <div className={`p-1 rounded-lg ${isActive(item.path) ? "bg-white/20" : "bg-slate-100"}`}>
                      {item.icon}
                    </div>
                    <span className="font-medium">{item.label}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-6">
            <NotificationPanel />

            <div className="hidden sm:flex items-center space-x-4 bg-gradient-to-r from-slate-50 to-blue-50 px-6 py-3 rounded-2xl border border-slate-200 shadow-lg">
              <div className="text-right">
                <div className="text-sm font-bold text-slate-800">
                  {user?.firstName} {user?.lastName}
                </div>
                <div className="text-xs font-medium px-3 py-1 bg-gradient-to-r from-emerald-400 to-teal-500 text-white rounded-full capitalize shadow-sm">
                  {user?.role}
                </div>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-slate-400 to-slate-600 rounded-2xl flex items-center justify-center text-white font-bold text-sm shadow-xl">
                {user?.firstName?.charAt(0)}
                {user?.lastName?.charAt(0)}
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-6 py-3 rounded-2xl font-semibold text-sm transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center space-x-2"
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
              <span className="hidden md:block">Logout</span>
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-3 rounded-2xl text-slate-600 hover:text-slate-800 hover:bg-slate-100 transition-all duration-200 shadow-lg"
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

        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-200 bg-gradient-to-br from-white to-slate-50 rounded-b-3xl shadow-2xl">
            <div className="px-4 pt-4 pb-6 space-y-3">
              {navItems.map((item) => (
                <Link
                  key={item.id}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`w-full text-left px-6 py-4 rounded-2xl text-sm font-semibold transition-all duration-200 flex items-center space-x-4 shadow-lg ${
                    isActive(item.path)
                      ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-blue-500/25"
                      : "text-slate-600 hover:text-blue-600 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 bg-white"
                  }`}
                >
                  <div className={`p-2 rounded-xl ${isActive(item.path) ? "bg-white/20" : "bg-slate-100"}`}>
                    {item.icon}
                  </div>
                  <span>{item.label}</span>
                </Link>
              ))}

              <div className="px-6 py-4 border-t border-slate-200 mt-6 bg-gradient-to-r from-slate-50 to-blue-50 rounded-2xl">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-slate-400 to-slate-600 rounded-2xl flex items-center justify-center text-white font-bold text-sm shadow-lg">
                    {user?.firstName?.charAt(0)}
                    {user?.lastName?.charAt(0)}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-800">
                      {user?.firstName} {user?.lastName}
                    </div>
                    <div className="text-xs font-medium px-3 py-1 bg-gradient-to-r from-emerald-400 to-teal-500 text-white rounded-full capitalize shadow-sm inline-block">
                      {user?.role}
                    </div>
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
