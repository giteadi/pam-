"use client"

import { useState } from "react"
import { useInspections } from "../contexts/inspection-context"
import { useProperties } from "../contexts/property-context"
import { useAuth } from "../contexts/auth-context"
import { usePermissions } from "../hooks/use-permissions"
import InspectionChecklist from "./inspection-checklist"

export default function InspectionsPage() {
  const { inspections, loading, createInspection, updateInspection } = useInspections()
  const { properties } = useProperties()
  const { user } = useAuth()
  const { hasPermission, userRole } = usePermissions()
  const [showNewInspectionForm, setShowNewInspectionForm] = useState(false)
  const [activeInspection, setActiveInspection] = useState(null)
  const [filterStatus, setFilterStatus] = useState("all")

  const filteredInspections = inspections.filter((inspection) => {
    // Role-based filtering
    if (userRole === "client") {
      // Clients only see inspections for properties they own or are assigned to
      const userProperties = properties.filter(
        (prop) => prop.contact === user.email || prop.owner.toLowerCase().includes(user.name.toLowerCase()),
      )
      const userPropertyIds = userProperties.map((prop) => prop.id)
      if (!userPropertyIds.includes(inspection.propertyId)) {
        return false
      }
    }

    // Status filtering
    if (filterStatus === "all") return true
    return inspection.status === filterStatus
  })

  const availableProperties = properties.filter((property) => {
    if (hasPermission("canViewAllProperties")) {
      return true
    }
    // Clients only see properties they own or are assigned to
    return property.contact === user.email || property.owner.toLowerCase().includes(user.name.toLowerCase())
  })

  const handleStartInspection = (propertyId, propertyName, propertyType) => {
    const newInspection = createInspection(propertyId, propertyName, propertyType, user.name)
    setActiveInspection(newInspection)
    setShowNewInspectionForm(false)
  }

  const handleContinueInspection = (inspection) => {
    setActiveInspection(inspection)
  }

  const handleSaveInspection = (updates) => {
    if (activeInspection) {
      updateInspection(activeInspection.id, updates)
      setActiveInspection({ ...activeInspection, ...updates })
    }
  }

  const handleCompleteInspection = (updates) => {
    if (activeInspection) {
      updateInspection(activeInspection.id, updates)
      setActiveInspection(null)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "bg-accent/10 text-accent border-accent/20"
      case "in-progress":
        return "bg-chart-3/10 text-chart-3 border-chart-3/20"
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

  if (activeInspection) {
    return (
      <InspectionChecklist
        inspection={activeInspection}
        onSave={handleSaveInspection}
        onComplete={handleCompleteInspection}
      />
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-serif font-bold text-foreground">Inspections</h1>
              <p className="text-muted-foreground">
                {hasPermission("canViewAllInspections")
                  ? "Manage property inspections and checklists"
                  : "View and complete your assigned inspections"}
              </p>
            </div>
            {hasPermission("canCreateInspection") && (
              <button
                onClick={() => setShowNewInspectionForm(true)}
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span>New Inspection</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-card border border-border rounded-xl p-6 mb-6">
          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium text-card-foreground">Filter by Status:</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-colors"
            >
              <option value="all">All Inspections</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
            <div className="text-sm text-muted-foreground">
              Showing {filteredInspections.length} inspection{filteredInspections.length !== 1 ? "s" : ""}
              {userRole === "client" && " assigned to you"}
            </div>
          </div>
        </div>

        {/* Inspections List */}
        {filteredInspections.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">No inspections found</h3>
            <p className="text-muted-foreground">
              {filterStatus !== "all" ? "Try adjusting your filter" : "Get started by creating your first inspection"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredInspections.map((inspection) => (
              <div
                key={inspection.id}
                className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-serif font-semibold text-foreground">{inspection.propertyName}</h3>
                    <p className="text-sm text-muted-foreground">Inspector: {inspection.inspectorName}</p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(inspection.status)}`}
                  >
                    {inspection.status.charAt(0).toUpperCase() + inspection.status.slice(1)}
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Progress:</span>
                    <span className="font-medium text-foreground">{inspection.progress}%</span>
                  </div>
                  <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all duration-300"
                      style={{ width: `${inspection.progress}%` }}
                    ></div>
                  </div>
                </div>

                <div className="space-y-1 mb-4 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Started:</span>
                    <span className="text-card-foreground">{inspection.startDate}</span>
                  </div>
                  {inspection.completedDate && (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Completed:</span>
                      <span className="text-card-foreground">{inspection.completedDate}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-end space-x-2">
                  <button
                    onClick={() => handleContinueInspection(inspection)}
                    className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-medium rounded-lg transition-colors"
                  >
                    {inspection.status === "completed" ? "View" : "Continue"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* New Inspection Modal */}
      {showNewInspectionForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-card border border-border rounded-xl shadow-xl w-full max-w-md">
            <div className="p-6 border-b border-border">
              <h2 className="text-xl font-serif font-bold text-foreground">Start New Inspection</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-card-foreground mb-2 block">Select Property</label>
                  {availableProperties.length === 0 ? (
                    <div className="text-center py-4 text-muted-foreground">No properties available for inspection</div>
                  ) : (
                    availableProperties.map((property) => (
                      <button
                        key={property.id}
                        onClick={() => handleStartInspection(property.id, property.name, property.type)}
                        className="w-full text-left p-3 bg-muted/50 hover:bg-muted rounded-lg transition-colors"
                      >
                        <div className="font-medium text-foreground">{property.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {property.type} • {property.address}
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-border flex items-center justify-end space-x-4">
              <button
                onClick={() => setShowNewInspectionForm(false)}
                className="px-4 py-2 text-muted-foreground hover:text-foreground border border-border hover:bg-muted rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
