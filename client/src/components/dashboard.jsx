"use client"

import { useState } from "react"
import { useAuth } from "../contexts/auth-context"
import { usePermissions } from "../hooks/use-permissions"
import InspectionsPage from "./inspections-page"
import PropertiesPage from "./properties-page"
import UserManagement from "./user-management"

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("inspections")
  const { user, logout } = useAuth()
  const { hasPermission, userRole } = usePermissions()

  const handleLogout = () => {
    logout()
    window.location.href = "/"
  }

  const handleTabClick = (tabId, e) => {
    e.preventDefault()
    setActiveTab(tabId)
  }

  const tabs = [
    {
      id: "inspections",
      label: "Inspections",
      path: "/dashboard/inspections",
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
      component: InspectionsPage,
      permission: "canViewInspections",
    },
    {
      id: "properties",
      label: "Properties",
      path: "/dashboard/properties",
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
      component: PropertiesPage,
      permission: "canViewProperties",
    },
    {
      id: "users",
      label: "User Management",
      path: "/dashboard/users",
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
      component: UserManagement,
      permission: "canManageUsers",
    },
  ]

  const availableTabs = tabs.filter((tab) => hasPermission(tab.permission))
  const ActiveComponent = tabs.find((tab) => tab.id === activeTab)?.component || InspectionsPage

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation */}
      <nav className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-8">
              <div className="flex-shrink-0">
                <h1 className="text-xl font-serif font-bold text-foreground">Property Inspector</h1>
              </div>

              {/* Tab Navigation */}
              <div className="hidden md:block">
                <div className="ml-10 flex items-baseline space-x-4">
                  {availableTabs.map((tab) => (
                    <a
                      key={tab.id}
                      href={tab.path}
                      onClick={(e) => handleTabClick(tab.id, e)}
                      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-2 cursor-pointer ${
                        activeTab === tab.id
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted"
                      }`}
                    >
                      {tab.icon}
                      <span>{tab.label}</span>
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              <div className="text-sm text-muted-foreground">
                Welcome,{" "}
                <span className="font-medium text-foreground">
                  {user?.firstName} {user?.lastName}
                </span>
                <span className="ml-2 px-2 py-1 bg-muted text-muted-foreground rounded text-xs">{userRole}</span>
              </div>
              <button
                onClick={handleLogout}
                className="text-muted-foreground hover:text-foreground px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Tab Navigation */}
        <div className="md:hidden border-t border-border">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {availableTabs.map((tab) => (
              <a
                key={tab.id}
                href={tab.path}
                onClick={(e) => handleTabClick(tab.id, e)}
                className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-2 cursor-pointer ${
                  activeTab === tab.id
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </a>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main>
        <ActiveComponent />
      </main>
    </div>
  )
}
