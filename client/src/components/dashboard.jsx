"use client"

import { useState, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { Link, useNavigate } from "react-router-dom"
import { logoutUser } from "../redux/slices/userSlice"
import { fetchDashboardStats, fetchRecentActivities, fetchUpcomingInspections } from "../redux/slices/dashboardSlice"
import InspectionsPage from "./inspections-page"
import PropertiesPage from "./properties-page"
import UserManagement from "./user-management"
import TaskAssignment from "./task-assignment"
import ProgressMonitoring from "./progress-monitoring"
import NotificationPanel from "./notification-panel"

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("inspections")
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.users)
  const navigate = useNavigate()

  useEffect(() => {
    dispatch(fetchDashboardStats())
    dispatch(fetchRecentActivities())
    dispatch(fetchUpcomingInspections())
  }, [dispatch])

  const hasPermission = (permission) => {
    const userRole = user?.role
    const permissions = {
      canViewInspections: true, // All users can view inspections
      canViewProperties: true, // All users can view properties
      canManageUsers: userRole === "admin" || userRole === "supervisor",
    }
    return permissions[permission] || false
  }

  const handleLogout = () => {
    dispatch(logoutUser())
    navigate("/")
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
            d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2h2a2 2 0 012-2h2a2 2 0 012 2"
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
      id: "tasks",
      label: "Task Assignment",
      path: "/dashboard/tasks",
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
      component: TaskAssignment,
      permission: "canManageUsers",
    },
    {
      id: "progress",
      label: "Progress Monitor",
      path: "/dashboard/progress",
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
      component: ProgressMonitoring,
      permission: "canManageUsers",
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Top Navigation */}
      <nav className="bg-white shadow-lg border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-8">
              <div className="flex-shrink-0">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Property Inspector
                </h1>
              </div>

              {/* Tab Navigation */}
              <div className="hidden md:block">
                <div className="ml-10 flex items-baseline space-x-2">
                  {availableTabs.map((tab) => (
                    <Link
                      key={tab.id}
                      to={tab.path}
                      onClick={(e) => handleTabClick(tab.id, e)}
                      className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center space-x-2 cursor-pointer ${
                        activeTab === tab.id
                          ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg transform scale-105"
                          : "text-slate-600 hover:text-blue-600 hover:bg-blue-50"
                      }`}
                    >
                      {tab.icon}
                      <span>{tab.label}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              <NotificationPanel />
              <div className="text-sm text-slate-600 bg-white px-4 py-2 rounded-lg shadow-sm border border-slate-200">
                <span className="text-slate-500">Welcome,</span>{" "}
                <span className="font-semibold text-slate-800">
                  {user?.firstName} {user?.lastName}
                </span>
                <span className="ml-2 px-3 py-1 bg-gradient-to-r from-emerald-400 to-teal-400 text-white rounded-full text-xs font-medium">
                  {user?.role}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="text-slate-600 hover:text-red-600 hover:bg-red-50 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Tab Navigation */}
        <div className="md:hidden border-t border-slate-200 bg-slate-50">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {availableTabs.map((tab) => (
              <Link
                key={tab.id}
                to={tab.path}
                onClick={(e) => handleTabClick(tab.id, e)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-2 cursor-pointer ${
                  activeTab === tab.id
                    ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white"
                    : "text-slate-600 hover:text-blue-600 hover:bg-blue-50"
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </Link>
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
