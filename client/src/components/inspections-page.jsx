"use client"

import { useState, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { fetchInspections, createInspection, updateInspection, deleteInspection } from "../redux/slices/inspectionSlice"
import { fetchProperties } from "../redux/slices/propertySlice"
import InspectionChecklist from "./inspection-checklist"

export default function InspectionsPage() {
  const dispatch = useDispatch()
  const { inspections, loading, error } = useSelector((state) => state.inspections)
  const { properties } = useSelector((state) => state.properties)
  const { user } = useSelector((state) => state.users)

  const [showForm, setShowForm] = useState(false)
  const [editingInspection, setEditingInspection] = useState(null)
  const [viewingInspection, setViewingInspection] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [formData, setFormData] = useState({
    propertyId: "",
    inspectorName: "",
    scheduledDate: "",
    type: "routine",
    notes: "",
  })
  const [errors, setErrors] = useState({})

  useEffect(() => {
    dispatch(fetchInspections())
    dispatch(fetchProperties())
  }, [dispatch])

  const hasPermission = (permission) => {
    const userRole = user?.role
    const permissions = {
      canCreateInspection: userRole === "admin" || userRole === "supervisor",
      canEditInspection: userRole === "admin" || userRole === "supervisor",
      canDeleteInspection: userRole === "admin",
    }
    return permissions[permission] || false
  }

  const filteredInspections = inspections.filter((inspection) => {
    const matchesSearch =
      inspection.propertyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inspection.inspectorName?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === "all" || inspection.status === filterStatus
    return matchesSearch && matchesStatus
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    const newErrors = {}

    if (!formData.propertyId) newErrors.propertyId = "Property is required"
    if (!formData.inspectorName.trim()) newErrors.inspectorName = "Inspector name is required"
    if (!formData.scheduledDate) newErrors.scheduledDate = "Scheduled date is required"

    setErrors(newErrors)

    if (Object.keys(newErrors).length === 0) {
      try {
        const selectedProperty = properties.find((p) => p.id === formData.propertyId)
        const inspectionData = {
          ...formData,
          propertyName: selectedProperty?.name || "Unknown Property",
          status: "scheduled",
          progress: 0,
        }

        if (editingInspection) {
          await dispatch(updateInspection({ id: editingInspection.id, data: inspectionData })).unwrap()
        } else {
          await dispatch(createInspection(inspectionData)).unwrap()
        }

        setShowForm(false)
        setEditingInspection(null)
        setFormData({
          propertyId: "",
          inspectorName: "",
          scheduledDate: "",
          type: "routine",
          notes: "",
        })
        setErrors({})
      } catch (err) {
        console.error("Failed to save inspection:", err)
      }
    }
  }

  const handleEdit = (inspection) => {
    setEditingInspection(inspection)
    setFormData({
      propertyId: inspection.propertyId || "",
      inspectorName: inspection.inspectorName || "",
      scheduledDate: inspection.scheduledDate || "",
      type: inspection.type || "routine",
      notes: inspection.notes || "",
    })
    setShowForm(true)
  }

  const handleDelete = async (inspection) => {
    if (window.confirm(`Are you sure you want to delete the inspection for "${inspection.propertyName}"?`)) {
      try {
        await dispatch(deleteInspection(inspection.id)).unwrap()
      } catch (err) {
        console.error("Failed to delete inspection:", err)
      }
    }
  }

  const handleStartInspection = (inspection) => {
    setViewingInspection(inspection)
  }

  const handleSaveInspection = async (inspectionData) => {
    try {
      await dispatch(updateInspection({ id: viewingInspection.id, data: inspectionData })).unwrap()
    } catch (err) {
      console.error("Failed to save inspection:", err)
    }
  }

  const handleCompleteInspection = async (inspectionData) => {
    try {
      await dispatch(updateInspection({ id: viewingInspection.id, data: inspectionData })).unwrap()
      setViewingInspection(null)
    } catch (err) {
      console.error("Failed to complete inspection:", err)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "bg-accent/10 text-accent border-accent/20"
      case "in-progress":
        return "bg-secondary/10 text-secondary border-secondary/20"
      case "scheduled":
        return "bg-primary/10 text-primary border-primary/20"
      case "overdue":
        return "bg-destructive/10 text-destructive border-destructive/20"
      default:
        return "bg-muted text-muted-foreground border-border"
    }
  }

  if (viewingInspection) {
    return (
      <InspectionChecklist
        inspection={viewingInspection}
        onSave={handleSaveInspection}
        onComplete={handleCompleteInspection}
      />
    )
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
              <h1 className="text-2xl font-serif font-bold text-foreground">Inspections</h1>
              <p className="text-muted-foreground">Manage property inspections and checklists</p>
            </div>
            {hasPermission("canCreateInspection") && (
              <button
                onClick={() => setShowForm(true)}
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span>Schedule Inspection</span>
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

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-card border border-border rounded-xl p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-card-foreground">Search Inspections</label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by property or inspector..."
                className="w-full px-4 py-2 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-colors"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-card-foreground">Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-4 py-2 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-colors"
              >
                <option value="all">All Status</option>
                <option value="scheduled">Scheduled</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="overdue">Overdue</option>
              </select>
            </div>
          </div>
          <div className="mt-4 text-sm text-muted-foreground">
            Showing {filteredInspections.length} inspection{filteredInspections.length !== 1 ? "s" : ""}
          </div>
        </div>

        {/* Inspections Grid */}
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
              {searchTerm || filterStatus !== "all"
                ? "Try adjusting your search or filters"
                : "Get started by scheduling your first inspection"}
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
                    <h3 className="font-serif font-semibold text-foreground mb-1">{inspection.propertyName}</h3>
                    <p className="text-sm text-muted-foreground">{inspection.inspectorName}</p>
                  </div>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(inspection.status)}`}
                  >
                    {inspection.status}
                  </span>
                </div>

                <div className="space-y-2 mb-4 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Type:</span>
                    <span className="text-card-foreground">{inspection.type}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Scheduled:</span>
                    <span className="text-card-foreground">{inspection.scheduledDate}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Progress:</span>
                    <span className="text-card-foreground">{inspection.progress || 0}%</span>
                  </div>
                </div>

                <div className="flex items-center justify-end space-x-2 pt-4 border-t border-border">
                  <button
                    onClick={() => handleStartInspection(inspection)}
                    className="px-3 py-1 text-sm text-muted-foreground hover:text-accent hover:bg-accent/10 rounded-lg transition-colors"
                  >
                    {inspection.status === "completed" ? "View" : "Start"}
                  </button>
                  {hasPermission("canEditInspection") && (
                    <button
                      onClick={() => handleEdit(inspection)}
                      className="px-3 py-1 text-sm text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                    >
                      Edit
                    </button>
                  )}
                  {hasPermission("canDeleteInspection") && (
                    <button
                      onClick={() => handleDelete(inspection)}
                      className="px-3 py-1 text-sm text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Inspection Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-card border border-border rounded-xl shadow-xl w-full max-w-md">
            <div className="p-6 border-b border-border">
              <h2 className="text-xl font-serif font-bold text-foreground">
                {editingInspection ? "Edit Inspection" : "Schedule New Inspection"}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-2">
                <label htmlFor="propertyId" className="text-sm font-medium text-card-foreground">
                  Property *
                </label>
                <select
                  id="propertyId"
                  value={formData.propertyId}
                  onChange={(e) => setFormData({ ...formData, propertyId: e.target.value })}
                  className={`w-full px-4 py-3 bg-input border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-colors ${
                    errors.propertyId ? "border-destructive" : "border-border"
                  }`}
                  disabled={loading}
                >
                  <option value="">Select property</option>
                  {properties.map((property) => (
                    <option key={property.id} value={property.id}>
                      {property.name}
                    </option>
                  ))}
                </select>
                {errors.propertyId && <p className="text-sm text-destructive">{errors.propertyId}</p>}
              </div>

              <div className="space-y-2">
                <label htmlFor="inspectorName" className="text-sm font-medium text-card-foreground">
                  Inspector Name *
                </label>
                <input
                  id="inspectorName"
                  type="text"
                  value={formData.inspectorName}
                  onChange={(e) => setFormData({ ...formData, inspectorName: e.target.value })}
                  className={`w-full px-4 py-3 bg-input border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-colors ${
                    errors.inspectorName ? "border-destructive" : "border-border"
                  }`}
                  placeholder="Enter inspector name"
                  disabled={loading}
                />
                {errors.inspectorName && <p className="text-sm text-destructive">{errors.inspectorName}</p>}
              </div>

              <div className="space-y-2">
                <label htmlFor="scheduledDate" className="text-sm font-medium text-card-foreground">
                  Scheduled Date *
                </label>
                <input
                  id="scheduledDate"
                  type="date"
                  value={formData.scheduledDate}
                  onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                  className={`w-full px-4 py-3 bg-input border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-colors ${
                    errors.scheduledDate ? "border-destructive" : "border-border"
                  }`}
                  disabled={loading}
                />
                {errors.scheduledDate && <p className="text-sm text-destructive">{errors.scheduledDate}</p>}
              </div>

              <div className="space-y-2">
                <label htmlFor="type" className="text-sm font-medium text-card-foreground">
                  Inspection Type
                </label>
                <select
                  id="type"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-4 py-3 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-colors"
                  disabled={loading}
                >
                  <option value="routine">Routine</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="safety">Safety</option>
                  <option value="compliance">Compliance</option>
                </select>
              </div>

              <div className="space-y-2">
                <label htmlFor="notes" className="text-sm font-medium text-card-foreground">
                  Notes
                </label>
                <textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-4 py-3 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-colors"
                  rows={3}
                  placeholder="Add any additional notes..."
                  disabled={loading}
                />
              </div>

              <div className="flex items-center justify-end space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false)
                    setEditingInspection(null)
                    setFormData({
                      propertyId: "",
                      inspectorName: "",
                      scheduledDate: "",
                      type: "routine",
                      notes: "",
                    })
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
                  {loading ? "Saving..." : editingInspection ? "Update Inspection" : "Schedule Inspection"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
