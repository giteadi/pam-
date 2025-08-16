"use client"

import { useAuth } from "../contexts/auth-context"

export function usePermissions() {
  const { user } = useAuth()

  const permissions = {
    admin: {
      canViewInspections: true,
      canViewProperties: true,
      canManageUsers: true,
      canCreateInspections: true,
      canEditProperties: true,
      canViewUsers: true,
      canCreateUser: true,
      canEditUser: true,
      canDeleteUser: true,
    },
    supervisor: {
      canViewInspections: true,
      canViewProperties: true,
      canManageUsers: false,
      canCreateInspections: true,
      canEditProperties: true,
      canViewUsers: false,
      canCreateUser: false,
      canEditUser: false,
      canDeleteUser: false,
    },
    client: {
      canViewInspections: true,
      canViewProperties: true,
      canManageUsers: false,
      canCreateInspections: false,
      canEditProperties: false,
      canViewUsers: false,
      canCreateUser: false,
      canEditUser: false,
      canDeleteUser: false,
    },
  }

  const userRole = user?.role || "client"
  const userPermissions = permissions[userRole] || permissions.client

  const hasPermission = (permission) => {
    return userPermissions[permission] || false
  }

  return {
    hasPermission,
    userRole,
    permissions: userPermissions,
  }
}
