"use client"

import { useState, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { fetchUsers, createUser, updateUser, deleteUser } from "../redux/slices/userSlice"

export default function UserManagement() {
  const dispatch = useDispatch()
  const { users, loading, error, user: currentUser } = useSelector((state) => state.users)

  const [showForm, setShowForm] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "client",
  })
  const [errors, setErrors] = useState({})

  useEffect(() => {
    dispatch(fetchUsers())
  }, [dispatch])

  const hasPermission = (permission) => {
    const userRole = currentUser?.role
    const permissions = {
      canViewUsers: userRole === "admin" || userRole === "supervisor",
      canCreateUser: userRole === "admin",
      canEditUser: userRole === "admin",
      canDeleteUser: userRole === "admin",
    }
    return permissions[permission] || false
  }

  if (!hasPermission("canViewUsers")) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-destructive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-foreground mb-2">Access Denied</h3>
          <p className="text-muted-foreground">You don't have permission to view user management.</p>
        </div>
      </div>
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const newErrors = {}

    if (!formData.name.trim()) newErrors.name = "Name is required"
    if (!formData.email.trim()) newErrors.email = "Email is required"
    if (!formData.email.includes("@")) newErrors.email = "Valid email is required"

    setErrors(newErrors)

    if (Object.keys(newErrors).length === 0) {
      try {
        if (editingUser) {
          await dispatch(updateUser({ id: editingUser.id, data: formData })).unwrap()
        } else {
          await dispatch(createUser(formData)).unwrap()
        }
        setShowForm(false)
        setEditingUser(null)
        setFormData({ name: "", email: "", role: "client" })
      } catch (err) {
        console.error("Failed to save user:", err)
      }
    }
  }

  const handleEdit = (user) => {
    setEditingUser(user)
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
    })
    setShowForm(true)
  }

  const handleDelete = async (user) => {
    if (window.confirm(`Are you sure you want to delete "${user.name}"?`)) {
      try {
        await dispatch(deleteUser(user.id)).unwrap()
      } catch (err) {
        console.error("Failed to delete user:", err)
      }
    }
  }

  const getRoleColor = (role) => {
    switch (role) {
      case "admin":
        return "bg-chart-3/10 text-chart-3 border-chart-3/20"
      case "supervisor":
        return "bg-secondary/10 text-secondary border-secondary/20"
      case "client":
        return "bg-primary/10 text-primary border-primary/20"
      default:
        return "bg-muted text-muted-foreground border-border"
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-serif font-bold text-foreground">User Management</h1>
              <p className="text-muted-foreground">Manage system users and their permissions</p>
            </div>
            {hasPermission("canCreateUser") && (
              <button
                onClick={() => setShowForm(true)}
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span>Add User</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">{error}</div>
        </div>
      )}

      {/* Users List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-medium text-foreground">User</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-foreground">Role</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-foreground">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-foreground">Last Login</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-foreground">Created</th>
                  <th className="px-6 py-4 text-right text-sm font-medium text-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-muted/20">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-foreground">{user.name}</div>
                        <div className="text-sm text-muted-foreground">{user.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getRoleColor(user.role)}`}>
                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-accent/10 text-accent border border-accent/20">
                        {user.status?.charAt(0).toUpperCase() + user.status?.slice(1) || "Active"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-card-foreground">{user.lastLogin || "Never"}</td>
                    <td className="px-6 py-4 text-sm text-card-foreground">{user.createdAt}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        {hasPermission("canEditUser") && (
                          <button
                            onClick={() => handleEdit(user)}
                            className="p-2 text-muted-foreground hover:text-accent hover:bg-accent/10 rounded-lg transition-colors"
                            title="Edit User"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                              />
                            </svg>
                          </button>
                        )}
                        {hasPermission("canDeleteUser") && user.role !== "admin" && (
                          <button
                            onClick={() => handleDelete(user)}
                            className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                            title="Delete User"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* User Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-card border border-border rounded-xl shadow-xl w-full max-w-md">
            <div className="p-6 border-b border-border">
              <h2 className="text-xl font-serif font-bold text-foreground">
                {editingUser ? "Edit User" : "Add New User"}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium text-card-foreground">
                  Full Name *
                </label>
                <input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={`w-full px-4 py-3 bg-input border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-colors ${
                    errors.name ? "border-destructive" : "border-border"
                  }`}
                  placeholder="Enter full name"
                  disabled={loading}
                />
                {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
              </div>

              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-card-foreground">
                  Email Address *
                </label>
                <input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={`w-full px-4 py-3 bg-input border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-colors ${
                    errors.email ? "border-destructive" : "border-border"
                  }`}
                  placeholder="Enter email address"
                  disabled={loading}
                />
                {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
              </div>

              <div className="space-y-2">
                <label htmlFor="role" className="text-sm font-medium text-card-foreground">
                  Role
                </label>
                <select
                  id="role"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-4 py-3 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-colors"
                  disabled={loading}
                >
                  <option value="client">Client</option>
                  <option value="supervisor">Supervisor</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className="flex items-center justify-end space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false)
                    setEditingUser(null)
                    setFormData({ name: "", email: "", role: "client" })
                    setErrors({})
                  }}
                  className="px-4 py-2 text-muted-foreground hover:text-foreground border border-border hover:bg-muted rounded-lg transition-colors"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-lg transition-colors disabled:opacity-50"
                  disabled={loading}
                >
                  {loading ? "Saving..." : editingUser ? "Update User" : "Add User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
