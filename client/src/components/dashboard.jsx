"use client"

import { useAuth } from "../contexts/auth-context"
import { usePermissions } from "../hooks/use-permissions"
import { useState, useEffect } from "react"
import PropertiesPage from "./properties-page"
import InspectionsPage from "./inspections-page"
import UserManagement from "./user-management"

export default function Dashboard() {
  const { user, logout } = useAuth()
  const { hasPermission } = usePermissions()
  const [currentPage, setCurrentPage] = useState("dashboard")
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    setIsLoaded(true)
  }, [])

  const getRoleColor = (role) => {
    switch (role) {
      case "admin":
        return "bg-chart-3 text-white"
      case "supervisor":
        return "bg-secondary text-secondary-foreground"
      case "client":
        return "bg-primary text-primary-foreground"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const getRolePermissions = (role) => {
    switch (role) {
      case "admin":
        return ["Manage Users", "View All Inspections", "Generate Reports", "System Settings"]
      case "supervisor":
        return ["Manage Inspections", "View Analytics", "Assign Tasks", "Review Reports"]
      case "client":
        return ["View My Inspections", "Complete Checklists", "View Reports"]
      default:
        return []
    }
  }

  const handleNavigation = (page) => {
    setCurrentPage(page)
  }

  if (currentPage === "properties") {
    return <PropertiesPage />
  }

  if (currentPage === "inspections") {
    return <InspectionsPage />
  }

  if (currentPage === "users") {
    return <UserManagement />
  }

  return (
    <div className={`min-h-screen bg-background ${isLoaded ? "page-transition" : ""}`}>
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-40 backdrop-blur-sm bg-card/95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center icon-hover">
                <svg className="w-5 h-5 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h1 className="text-xl font-serif font-bold text-foreground">Property Inspector</h1>
              <nav className="hidden md:flex items-center space-x-6 ml-8">
                {[
                  { key: "dashboard", label: "Dashboard" },
                  { key: "properties", label: "Properties" },
                  { key: "inspections", label: "Inspections" },
                  ...(hasPermission("canViewUsers") ? [{ key: "users", label: "Users" }] : []),
                ].map((item) => (
                  <button
                    key={item.key}
                    onClick={() => handleNavigation(item.key)}
                    className={`text-sm font-medium transition-all duration-200 relative ${
                      currentPage === item.key ? "text-primary" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {item.label}
                    {currentPage === item.key && (
                      <div className="absolute -bottom-4 left-0 right-0 h-0.5 bg-primary rounded-full"></div>
                    )}
                  </button>
                ))}
              </nav>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <div className="text-sm font-medium text-foreground">{user.name}</div>
                  <div className="text-xs text-muted-foreground">{user.email}</div>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 hover:scale-105 ${getRoleColor(user.role)}`}
                >
                  {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                </span>
              </div>
              <button
                onClick={logout}
                className="text-muted-foreground hover:text-foreground transition-all duration-200 p-2 rounded-lg hover:bg-muted/50 icon-hover"
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
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-serif font-bold text-foreground mb-2">Welcome back, {user.name}!</h2>
          <p className="text-muted-foreground">
            Manage your property inspections efficiently with our professional tools.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[
            {
              title: "Total Inspections",
              value: "24",
              icon: "M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2",
              color: "primary",
              delay: "0.1s",
            },
            {
              title: "Completed",
              value: "18",
              icon: "M5 13l4 4L19 7",
              color: "accent",
              delay: "0.2s",
            },
            {
              title: "Pending",
              value: "6",
              icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
              color: "chart-3",
              delay: "0.3s",
            },
          ].map((stat, index) => (
            <div
              key={stat.title}
              className="bg-card border border-border rounded-xl p-6 card-hover stagger-item"
              style={{ animationDelay: stat.delay }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                </div>
                <div className={`w-12 h-12 bg-${stat.color}/10 rounded-lg flex items-center justify-center icon-hover`}>
                  <svg className={`w-6 h-6 text-${stat.color}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={stat.icon} />
                  </svg>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Role-based Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Permissions Card */}
          <div className="bg-card border border-border rounded-xl p-6 card-hover">
            <h3 className="text-lg font-serif font-semibold text-foreground mb-4">Your Permissions</h3>
            <div className="space-y-3">
              {getRolePermissions(user.role).map((permission, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-3 stagger-item"
                  style={{ animationDelay: `${0.4 + index * 0.1}s` }}
                >
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span className="text-card-foreground">{permission}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-card border border-border rounded-xl p-6 card-hover">
            <h3 className="text-lg font-serif font-semibold text-foreground mb-4">Quick Actions</h3>
            <div className="space-y-3">
              {hasPermission("canCreateInspection") && (
                <button
                  onClick={() => handleNavigation("inspections")}
                  className="w-full text-left p-3 bg-primary/5 hover:bg-primary/10 rounded-lg transition-all duration-200 border border-primary/20 hover:border-primary/30 hover:scale-[1.02] stagger-item"
                  style={{ animationDelay: "0.5s" }}
                >
                  <div className="font-medium text-foreground">New Inspection</div>
                  <div className="text-sm text-muted-foreground">Create a new property inspection</div>
                </button>
              )}
              <button
                onClick={() => handleNavigation("properties")}
                className="w-full text-left p-3 bg-accent/5 hover:bg-accent/10 rounded-lg transition-all duration-200 border border-accent/20 hover:border-accent/30 hover:scale-[1.02] stagger-item"
                style={{ animationDelay: "0.6s" }}
              >
                <div className="font-medium text-foreground">
                  {hasPermission("canViewAllProperties") ? "Manage Properties" : "View Properties"}
                </div>
                <div className="text-sm text-muted-foreground">
                  {hasPermission("canViewAllProperties")
                    ? "View and manage your properties"
                    : "View your assigned properties"}
                </div>
              </button>
              {hasPermission("canViewUsers") && (
                <button
                  onClick={() => handleNavigation("users")}
                  className="w-full text-left p-3 bg-chart-3/5 hover:bg-chart-3/10 rounded-lg transition-all duration-200 border border-chart-3/20 hover:border-chart-3/30 hover:scale-[1.02] stagger-item"
                  style={{ animationDelay: "0.7s" }}
                >
                  <div className="font-medium text-foreground">Manage Users</div>
                  <div className="text-sm text-muted-foreground">Add or edit user accounts</div>
                </button>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
