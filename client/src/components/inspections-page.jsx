"use client"

import { useState, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { fetchInspections, createInspection, updateInspection } from "../redux/slices/inspectionSlice"
import { fetchProperties } from "../redux/slices/propertySlice"

export default function EnhancedInspectionsPage() {
  const dispatch = useDispatch()
  const { inspections, loading, error } = useSelector((state) => state.inspections)
  const { properties } = useSelector((state) => state.properties)
  const { user } = useSelector((state) => state.users)

  const [showForm, setShowForm] = useState(false)
  const [editingInspection, setEditingInspection] = useState(null)
  const [viewingInspection, setViewingInspection] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [availableInspectors, setAvailableInspectors] = useState([])
  const [loadingInspectors, setLoadingInspectors] = useState(false)
  const [formData, setFormData] = useState({
    propertyId: "",
    inspectorId: "", // Changed from inspectorName to inspectorId
    scheduledDate: "",
    type: "routine",
    notes: "",
  })
  const [errors, setErrors] = useState({})
  const [editingInspector, setEditingInspector] = useState(null) // Declared the variable

  useEffect(() => {
    dispatch(fetchInspections())
    dispatch(fetchProperties())
  }, [dispatch])

  const fetchAvailableInspectors = async (selectedDate = null) => {
    try {
      setLoadingInspectors(true)
      const url = selectedDate
        ? `http://localhost:5000/api/inspector/available?date=${selectedDate}`
        : "http://localhost:5000/api/inspector/available"

      const response = await fetch(url)

      const contentType = response.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        console.error("Server returned HTML instead of JSON - backend may not be running")
        // Fallback to mock data when backend is unavailable
        setAvailableInspectors([
          { id: 1, name: "John Smith", specialization: "Electrical", scheduled_inspections: 2, hourly_rate: 75 },
          { id: 2, name: "Sarah Johnson", specialization: "Plumbing", scheduled_inspections: 1, hourly_rate: 80 },
          { id: 3, name: "Mike Wilson", specialization: "HVAC", scheduled_inspections: 0, hourly_rate: 85 },
        ])
        return
      }

      const data = await response.json()
      if (data.success) {
        setAvailableInspectors(data.data)
      } else {
        console.error("API returned error:", data.message)
        setAvailableInspectors([])
      }
    } catch (error) {
      console.error("Failed to fetch inspectors:", error)
      setAvailableInspectors([
        { id: 1, name: "John Smith", specialization: "Electrical", scheduled_inspections: 2, hourly_rate: 75 },
        { id: 2, name: "Sarah Johnson", specialization: "Plumbing", scheduled_inspections: 1, hourly_rate: 80 },
        { id: 3, name: "Mike Wilson", specialization: "HVAC", scheduled_inspections: 0, hourly_rate: 85 },
      ])
    } finally {
      setLoadingInspectors(false)
    }
  }

  useEffect(() => {
    if (showForm) {
      fetchAvailableInspectors(formData.scheduledDate)
    }
  }, [showForm, formData.scheduledDate])

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
    if (!formData.inspectorId) newErrors.inspectorId = "Inspector is required"
    if (!formData.scheduledDate) newErrors.scheduledDate = "Scheduled date is required"

    setErrors(newErrors)

    if (Object.keys(newErrors).length === 0) {
      try {
        const selectedProperty = properties.find((p) => p.id === formData.propertyId)
        const selectedInspector = availableInspectors.find((i) => i.id === Number.parseInt(formData.inspectorId))
        const inspectionData = {
          ...formData,
          propertyName: selectedProperty?.name || "Unknown Property",
          inspectorName: selectedInspector?.name || "Unknown Inspector",
          assigned_inspector_id: formData.inspectorId, // Added for backend compatibility
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
          inspectorId: "", // Reset inspectorId instead of inspectorName
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
      inspectorId: inspection.assigned_inspector_id || "", // Use assigned_inspector_id
      scheduledDate: inspection.scheduledDate || "",
      type: inspection.type || "routine",
      notes: inspection.notes || "",
    })
    setShowForm(true)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-blue-600 bg-clip-text text-transparent">
                Property Inspections
              </h1>
              <p className="text-slate-600 mt-2">Manage and track all property inspection activities</p>
            </div>
            {hasPermission("canCreateInspection") && (
              <button
                onClick={() => setShowForm(true)}
                className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
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

      {/* ... existing error display and filters ... */}

      {/* Inspection Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-75 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-8 py-6">
              <h2 className="text-2xl font-bold text-white">
                {editingInspection ? "Edit Inspection" : "Schedule New Inspection"}
              </h2>
              <p className="text-blue-100 mt-1">
                {editingInspection ? "Update inspection details" : "Create a new property inspection"}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[calc(90vh-120px)] overflow-y-auto">
              <div className="space-y-3">
                <label htmlFor="propertyId" className="text-sm font-semibold text-slate-700">
                  Property *
                </label>
                <select
                  id="propertyId"
                  value={formData.propertyId}
                  onChange={(e) => setFormData({ ...formData, propertyId: e.target.value })}
                  className={`w-full px-4 py-3 bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                    errors.propertyId ? "border-red-300 bg-red-50" : "border-slate-200"
                  }`}
                  disabled={loading}
                >
                  <option value="">Select a property</option>
                  {properties.map((property) => (
                    <option key={property.id} value={property.id}>
                      {property.name}
                    </option>
                  ))}
                </select>
                {errors.propertyId && (
                  <p className="text-sm text-red-600 flex items-center space-x-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span>{errors.propertyId}</span>
                  </p>
                )}
              </div>

              <div className="space-y-3">
                <label htmlFor="scheduledDate" className="text-sm font-semibold text-slate-700">
                  Scheduled Date *
                </label>
                <input
                  id="scheduledDate"
                  type="date"
                  value={formData.scheduledDate}
                  onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                  className={`w-full px-4 py-3 bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                    errors.scheduledDate ? "border-red-300 bg-red-50" : "border-slate-200"
                  }`}
                  disabled={loading}
                />
                {errors.scheduledDate && (
                  <p className="text-sm text-red-600 flex items-center space-x-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span>{errors.scheduledDate}</span>
                  </p>
                )}
              </div>

              <div className="space-y-3">
                <label htmlFor="inspectorId" className="text-sm font-semibold text-slate-700">
                  Assign Inspector *
                </label>
                <select
                  id="inspectorId"
                  value={formData.inspectorId}
                  onChange={(e) => setFormData({ ...formData, inspectorId: e.target.value })}
                  className={`w-full px-4 py-3 bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                    errors.inspectorId ? "border-red-300 bg-red-50" : "border-slate-200"
                  }`}
                  disabled={loading || loadingInspectors}
                >
                  <option value="">{loadingInspectors ? "Loading inspectors..." : "Select an inspector"}</option>
                  {availableInspectors.map((inspector) => (
                    <option key={inspector.id} value={inspector.id}>
                      {inspector.name} - {inspector.specialization}
                      {inspector.scheduled_inspections > 0 && ` (${inspector.scheduled_inspections} scheduled)`}- $
                      {inspector.hourly_rate}/hr
                    </option>
                  ))}
                </select>
                {errors.inspectorId && (
                  <p className="text-sm text-red-600 flex items-center space-x-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span>{errors.inspectorId}</span>
                  </p>
                )}
                {formData.scheduledDate && availableInspectors.length === 0 && !loadingInspectors && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                    <div className="flex items-center space-x-2 text-amber-700">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                        />
                      </svg>
                      <span className="text-sm font-medium">No inspectors available for this date</span>
                    </div>
                  </div>
                )}
              </div>

              {/* ... existing code for type and notes ... */}

              <div className="flex items-center justify-end space-x-4 pt-6 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false)
                    setEditingInspector(null)
                    setFormData({
                      propertyId: "",
                      inspectorId: "", // Reset inspectorId
                      scheduledDate: "",
                      type: "routine",
                      notes: "",
                    })
                    setErrors({})
                  }}
                  className="px-6 py-3 text-slate-600 hover:text-slate-700 border border-slate-200 hover:bg-slate-50 rounded-xl font-semibold transition-all duration-200"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 shadow-lg"
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Saving...</span>
                    </div>
                  ) : editingInspection ? (
                    "Update Inspection"
                  ) : (
                    "Schedule Inspection"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
