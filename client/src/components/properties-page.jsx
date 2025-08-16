"use client"

import { useState } from "react"
import { useProperties } from "../contexts/property-context"
import { useAuth } from "../contexts/auth-context"
import { usePermissions } from "../hooks/use-permissions"
import PropertyCard from "./property-card"
import PropertyForm from "./property-form"

export default function PropertiesPage() {
  const { properties, loading, addProperty, updateProperty, deleteProperty } = useProperties()
  const { user } = useAuth()
  const { hasPermission, userRole } = usePermissions()
  const [showForm, setShowForm] = useState(false)
  const [editingProperty, setEditingProperty] = useState(null)
  const [viewingProperty, setViewingProperty] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")

  const filteredProperties = properties.filter((property) => {
    // Role-based filtering
    if (!hasPermission("canViewAllProperties")) {
      // Clients only see properties they own or are assigned to
      const userFullName = user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : ""
      const hasAccess =
        property.contact === user?.email ||
        (userFullName && property.owner?.toLowerCase().includes(userFullName.toLowerCase()))
      if (!hasAccess) return false
    }

    // Search filtering
    const matchesSearch =
      property.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.address.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterType === "all" || property.type.toLowerCase() === filterType.toLowerCase()
    const matchesStatus = filterStatus === "all" || property.status.toLowerCase() === filterStatus.toLowerCase()

    return matchesSearch && matchesType && matchesStatus
  })

  const handleAddProperty = () => {
    setEditingProperty(null)
    setShowForm(true)
  }

  const handleEditProperty = (property) => {
    setEditingProperty(property)
    setShowForm(true)
  }

  const handleViewProperty = (property) => {
    setViewingProperty(property)
  }

  const handleDeleteProperty = (property) => {
    if (window.confirm(`Are you sure you want to delete "${property.name}"?`)) {
      deleteProperty(property.id)
    }
  }

  const handleFormSubmit = (formData) => {
    if (editingProperty) {
      updateProperty(editingProperty.id, formData)
    } else {
      addProperty(formData)
    }
    setShowForm(false)
    setEditingProperty(null)
  }

  const handleFormCancel = () => {
    setShowForm(false)
    setEditingProperty(null)
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
              <h1 className="text-2xl font-serif font-bold text-foreground">Properties</h1>
              <p className="text-muted-foreground">
                {hasPermission("canViewAllProperties")
                  ? "Manage your property portfolio"
                  : "View your assigned properties"}
              </p>
            </div>
            {hasPermission("canCreateProperty") && (
              <button
                onClick={handleAddProperty}
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span>Add Property</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-card border border-border rounded-xl p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-card-foreground">Search Properties</label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name or address..."
                className="w-full px-4 py-2 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-colors"
              />
            </div>

            {/* Type Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-card-foreground">Property Type</label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full px-4 py-2 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-colors"
              >
                <option value="all">All Types</option>
                <option value="residential">Residential</option>
                <option value="commercial">Commercial</option>
                <option value="industrial">Industrial</option>
                <option value="mixed use">Mixed Use</option>
              </select>
            </div>

            {/* Status Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-card-foreground">Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-4 py-2 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-colors"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
          <div className="mt-4 text-sm text-muted-foreground">
            Showing {filteredProperties.length} propert{filteredProperties.length !== 1 ? "ies" : "y"}
            {!hasPermission("canViewAllProperties") && " assigned to you"}
          </div>
        </div>

        {/* Properties Grid */}
        {filteredProperties.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">No properties found</h3>
            <p className="text-muted-foreground">
              {searchTerm || filterType !== "all" || filterStatus !== "all"
                ? "Try adjusting your search or filters"
                : "Get started by adding your first property"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProperties.map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
                userRole={userRole}
                onEdit={handleEditProperty}
                onView={handleViewProperty}
                onDelete={handleDeleteProperty}
              />
            ))}
          </div>
        )}
      </div>

      {/* Property Form Modal */}
      {showForm && <PropertyForm property={editingProperty} onSubmit={handleFormSubmit} onCancel={handleFormCancel} />}

      {/* Property Details Modal */}
      {viewingProperty && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-card border border-border rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-border flex items-center justify-between">
              <h2 className="text-xl font-serif font-bold text-foreground">Property Details</h2>
              <button
                onClick={() => setViewingProperty(null)}
                className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium text-foreground mb-2">Property Information</h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Name:</span> {viewingProperty.name}
                    </div>
                    <div>
                      <span className="text-muted-foreground">Type:</span> {viewingProperty.type}
                    </div>
                    <div>
                      <span className="text-muted-foreground">Units:</span> {viewingProperty.units}
                    </div>
                    <div>
                      <span className="text-muted-foreground">Status:</span> {viewingProperty.status}
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="font-medium text-foreground mb-2">Contact Information</h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Owner:</span> {viewingProperty.owner}
                    </div>
                    <div>
                      <span className="text-muted-foreground">Contact:</span> {viewingProperty.contact}
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="font-medium text-foreground mb-2">Address</h3>
                <p className="text-sm text-card-foreground">{viewingProperty.address}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium text-foreground mb-2">Inspection Dates</h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Last:</span> {viewingProperty.lastInspection}
                    </div>
                    <div>
                      <span className="text-muted-foreground">Next:</span> {viewingProperty.nextInspection}
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="font-medium text-foreground mb-2">Created</h3>
                  <p className="text-sm text-card-foreground">{viewingProperty.createdAt}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
