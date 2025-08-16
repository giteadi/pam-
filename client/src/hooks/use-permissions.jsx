"use client"

import { useAuth } from "../contexts/auth-context.jsx"

export function usePermissions() {
  const { user } = useAuth()

  const permissions = {
    // Property permissions
    canViewAllProperties: user?.role === "admin" || user?.role === "supervisor",
    canCreateProperty: user?.role === "admin" || user?.role === "supervisor",
    canEditProperty: user?.role === "admin" || user?.role === "supervisor",
    canDeleteProperty: user?.role === "admin",

    // Inspection permissions
    canViewAllInspections: user?.role === "admin" || user?.role === "supervisor",
    canCreateInspection: user?.role === "admin" || user?.role === "supervisor",
    canEditInspection: user?.role === "admin" || user?.role === "supervisor",
    canDeleteInspection: user?.role === "admin",
    canCompleteInspection: true, // All roles can complete inspections they have access to

    // User management permissions
    canViewUsers: user?.role === "admin",
    canCreateUser: user?.role === "admin",
    canEditUser: user?.role === "admin",
    canDeleteUser: user?.role === "admin",

    // Report permissions
    canViewAllReports: user?.role === "admin" || user?.role === "supervisor",
    canGenerateReports: user?.role === "admin" || user?.role === "supervisor",

    // System permissions
    canAccessSystemSettings: user?.role === "admin",
    canViewAnalytics: user?.role === "admin" || user?.role === "supervisor",
  }

  const hasPermission = (permission) => {
    return permissions[permission] || false
  }

  const hasAnyPermission = (permissionList) => {
    return permissionList.some((permission) => permissions[permission])
  }

  const hasAllPermissions = (permissionList) => {
    return permissionList.every((permission) => permissions[permission])
  }

  return {
    permissions,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    userRole: user?.role,
    userId: user?.id,
  }
}
