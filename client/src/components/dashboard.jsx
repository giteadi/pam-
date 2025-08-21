"use client"

import { useState, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { Link, useNavigate } from "react-router-dom"
import { logoutUser, setCurrentUser } from "../redux/slices/userSlice"
import { fetchDashboardStats, fetchRecentActivities, fetchUpcomingInspections } from "../redux/slices/dashboardSlice"
import InspectionsPage from "./inspections-page"
import PropertiesPage from "./properties-page"
import ProgressMonitoring from "./progress-monitoring"
import NotificationPanel from "./notification-panel"
import InspectorManagement from "./inspector-management"

export default function Dashboard() {
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.users)
  const navigate = useNavigate()
  const [availableTabs, setAvailableTabs] = useState([])
  
  // Set default tab based on user role
  const defaultTab = user?.role === "supervisor" ? "properties" : "inspections"
  const [activeTab, setActiveTab] = useState(defaultTab)
  
  // Set default component based on available tabs or user role
  const getDefaultComponent = () => {
    if (user?.role === "supervisor") return PropertiesPage
    return availableTabs.find((tab) => tab.id === activeTab)?.component || PropertiesPage
  }
  
  const ActiveComponent = getDefaultComponent()

  useEffect(() => {
    dispatch(fetchDashboardStats())
    dispatch(fetchRecentActivities())
    
    // Only fetch upcoming inspections if user is not a supervisor
    if (user?.role !== "supervisor") {
      dispatch(fetchUpcomingInspections())
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
        id: "inspectors",
        label: "Inspectors",
        path: "/dashboard/inspectors",
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
        ),
        component: InspectorManagement,
        permission: "canManageInspectors",
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
    ]

    const filteredTabs = tabs.filter((tab) => hasPermission(tab.permission))
    setAvailableTabs(filteredTabs)
  }, [dispatch, user])

  const hasPermission = (permission) => {
    const userRole = user?.role
    const permissions = {
      canViewInspections: userRole === "admin" || userRole === "inspector" || userRole === "client",
      canViewProperties: true,
      canManageUsers: userRole === "admin",
      canManageInspectors: userRole === "admin",
      canAssignTasks: userRole === "admin" || userRole === "supervisor",
      canPerformInspections: userRole === "admin" || userRole === "supervisor",
    }
    return permissions[permission] || false
  }

  const handleLogout = async () => {
    try {
      // Clear Redux state and localStorage
      await dispatch(logoutUser()).unwrap()

      // Reset user state explicitly
      dispatch(setCurrentUser(null))

      // Navigate to login page
      navigate("/login", { replace: true })
    } catch (error) {
      console.error("Logout error:", error)

      // Even if there's an error, still clear local state and navigate
      dispatch(setCurrentUser(null))
      localStorage.removeItem("user")
      navigate("/login", { replace: true })
    }
  }

  const handleTabClick = (tabId, e) => {
    e.preventDefault()
    setActiveTab(tabId)
  }

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
                className="flex items-center space-x-2 text-slate-600 hover:text-red-600 hover:bg-red-50 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 border border-slate-200 hover:border-red-200"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
                <span>Logout</span>
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
