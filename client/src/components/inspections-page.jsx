"use client"

import { useState, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { fetchInspections, createInspection, updateInspection, scheduleInspection } from "../redux/slices/inspectionSlice"
import { fetchProperties } from "../redux/slices/propertySlice"
import { fetchInspectors } from "../redux/slices/inspectorSlice"

export default function EnhancedInspectionsPage() {
  const dispatch = useDispatch()
  const { inspections, loading, error } = useSelector((state) => state.inspections)
  const { properties } = useSelector((state) => state.properties)
  const { user } = useSelector((state) => state.users)
  const { inspectors, loading: loadingInspectors } = useSelector((state) => state.inspectors)

  const [showForm, setShowForm] = useState(false)
  const [editingInspection, setEditingInspection] = useState(null)
  const [viewingInspection, setViewingInspection] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [formData, setFormData] = useState({
    propertyId: "",
    inspectorId: "",
    scheduledDate: "",
    type: "routine",
    notes: "",
  })
  const [errors, setErrors] = useState({})

  useEffect(() => {
    console.log("[Page] Component mounted, fetching data...")
    dispatch(fetchInspections())
    dispatch(fetchProperties())
  }, [dispatch])

  useEffect(() => {
    if (showForm) {
      console.log("[Page] Form opened, fetching inspectors...")
      dispatch(fetchInspectors())
    }
  }, [showForm, dispatch])

  // Debug logs
  useEffect(() => {
    console.log("[Page] Inspections updated:", inspections)
    console.log("[Page] Loading state:", loading)
    console.log("[Page] Error state:", error)
  }, [inspections, loading, error])

  const filteredInspections = inspections.filter((inspection) => {
    const matchesSearch =
      inspection.propertyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (inspection.inspector_name || inspection.inspectorName)?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === "all" || inspection.status === filterStatus
    
    // Filter inspections by client ID if the user is a client
    const isClientProperty = user?.role === "client" ? 
      String(inspection.owner) === String(user.id) : true
    
    return matchesSearch && matchesStatus && isClientProperty
  })

  const handleSubmit = async (e) => {
    e.preventDefault()

    console.log("[Page] Form data before validation:", formData)

    const newErrors = {}

    if (!formData.propertyId) newErrors.propertyId = "Property is required"
    if (!formData.inspectorId) newErrors.inspectorId = "Inspector is required"
    if (!formData.scheduledDate) newErrors.scheduledDate = "Scheduled date is required"

    setErrors(newErrors)

    if (Object.keys(newErrors).length === 0) {
      try {
        const selectedProperty = properties.find((p) => p.id === Number.parseInt(formData.propertyId))
        const selectedInspector = inspectors.find((i) => i.id === Number.parseInt(formData.inspectorId))

        console.log("[Page] Selected property:", selectedProperty)
        console.log("[Page] Selected inspector:", selectedInspector)

        if (!selectedInspector) {
          setErrors({ inspectorId: "Selected inspector not found. Please refresh and try again." })
          return
        }

        const inspectionData = {
          property_id: Number.parseInt(formData.propertyId),
          inspector_id: Number.parseInt(formData.inspectorId),
          start_date: formData.scheduledDate,
          notes: formData.notes || "",
          inspection_type: formData.type,
          // Include frontend display fields for immediate UI update
          propertyName: selectedProperty?.name || "Unknown Property",
          inspectorName: selectedInspector?.name || "Unknown Inspector",
          status: "scheduled",
          progress: 0,
        }

        console.log("[Page] Final inspection data being sent:", inspectionData)

        if (editingInspection) {
          await dispatch(updateInspection({ id: editingInspection.id, data: inspectionData })).unwrap()
        } else {
          // Use scheduleInspection for new inspections as it matches your backend API
          const scheduleData = {
            ...inspectionData,
            scheduled_date: formData.scheduledDate,
            created_by: user?.id || 1, // Use actual user ID or default
          }
          await dispatch(scheduleInspection(scheduleData)).unwrap()
        }

        // Reset form and close modal
        setShowForm(false)
        setEditingInspection(null)
        setFormData({
          propertyId: "",
          inspectorId: "",
          scheduledDate: "",
          type: "routine",
          notes: "",
        })
        setErrors({})

        // Refresh the inspections list
        dispatch(fetchInspections())
      } catch (err) {
        console.error("[Page] Failed to save inspection:", err)

        if (err.message && err.message.includes("foreign key constraint")) {
          if (err.message.includes("inspector_id")) {
            setErrors({ inspectorId: "Selected inspector not found in system. Please refresh and try again." })
          } else {
            setErrors({ general: "Invalid data reference. Please check your selections." })
          }
        } else if (err.message && err.message.includes("Inspector with ID")) {
          setErrors({ inspectorId: err.message })
        } else {
          setErrors({ general: err.message || "Failed to save inspection. Please try again." })
          console.error("[Page] Error details:", err)
        }
      }
    } else {
      console.log("[Page] Validation errors:", newErrors)
    }
  }

  const handleEdit = (inspection) => {
  console.log("[Page] Editing inspection:", inspection)
  setEditingInspection(inspection)
  
  // Helper function to format date for datetime-local input
  const formatDateForInput = (dateString) => {
    if (!dateString) return ""
    
    try {
      // Clean up the date string - remove any NULL values or extra characters
      const cleanDate = dateString.replace(/\*NULL\*/g, '').trim()
      
      // Parse the date
      const date = new Date(cleanDate)
      
      // Check if the date is valid
      if (isNaN(date.getTime())) {
        console.warn("Invalid date:", dateString)
        return ""
      }
      
      // Format to YYYY-MM-DDTHH:MM format required by datetime-local
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      const hours = String(date.getHours()).padStart(2, '0')
      const minutes = String(date.getMinutes()).padStart(2, '0')
      
      return `${year}-${month}-${day}T${hours}:${minutes}`
    } catch (error) {
      console.error("Error formatting date:", error, dateString)
      return ""
    }
  }

  const scheduledDate = formatDateForInput(inspection.scheduledDate || inspection.startDate || inspection.start_date)
  
  setFormData({
    propertyId: inspection.propertyId?.toString() || "",
    inspectorId: inspection.inspectorId?.toString() || inspection.assigned_inspector_id?.toString() || "",
    scheduledDate: scheduledDate,
    type: inspection.type || "routine",
    notes: inspection.notes || "",
  })
  setShowForm(true)
}

  const handleView = (inspection) => {
    setViewingInspection(inspection)
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "in-progress":
      case "in_progress":
        return "bg-blue-100 text-blue-800"
      case "scheduled":
        return "bg-yellow-100 text-yellow-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return "N/A"
    try {
      return new Date(dateString).toLocaleDateString()
    } catch (error) {
      return "Invalid Date"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Property Inspections</h1>
              <p className="text-slate-600 mt-1">Manage and track all property inspections</p>
              {error && (
                <div className="mt-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                  {error}
                </div>
              )}
            </div>
            {user?.role !== "client" && (
              <button
                onClick={() => setShowForm(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors duration-200 flex items-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span>Schedule New Inspection</span>
              </button>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search by property or inspector..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="scheduled">Scheduled</option>
              <option value="in-progress">In Progress</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Inspections Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-slate-600">Loading inspections...</span>
            </div>
          ) : filteredInspections.length === 0 ? (
            <div className="text-center py-12">
              <svg
                className="w-12 h-12 text-slate-400 mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">No inspections found</h3>
              <p className="text-slate-600">
                {searchTerm || filterStatus !== "all" 
                  ? "Try adjusting your search or filter criteria."
                  : "Get started by scheduling your first inspection."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="text-left py-4 px-6 font-semibold text-slate-700">Property</th>
                    <th className="text-left py-4 px-6 font-semibold text-slate-700">Inspector</th>
                    <th className="text-left py-4 px-6 font-semibold text-slate-700">Date</th>
                    <th className="text-left py-4 px-6 font-semibold text-slate-700">Type</th>
                    <th className="text-left py-4 px-6 font-semibold text-slate-700">Status</th>
                    <th className="text-left py-4 px-6 font-semibold text-slate-700">Progress</th>
                    <th className="text-left py-4 px-6 font-semibold text-slate-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredInspections.map((inspection) => (
                    <tr key={inspection.id} className="hover:bg-slate-50 transition-colors duration-150">
                      <td className="py-4 px-6">
                        <div className="font-semibold text-slate-900">{inspection.propertyName || 'N/A'}</div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="text-slate-700">{inspection.inspector_name || inspection.inspectorName || 'N/A'}</div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="text-slate-700">
                          {formatDate(inspection.scheduledDate || inspection.startDate)}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="text-slate-700 capitalize">{inspection.type || 'routine'}</div>
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(inspection.status)}`}
                        >
                          {inspection.status || 'scheduled'}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-2">
                          <div className="w-16 bg-slate-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${inspection.progress || 0}%` }}
                            ></div>
                          </div>
                          <span className="text-xs text-slate-600">{inspection.progress || 0}%</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleView(inspection)}
                            className="text-blue-600 hover:text-blue-800 p-1 rounded transition-colors duration-150"
                            title="View Details"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                              />
                            </svg>
                          </button>
                          {user?.role !== "client" && (
                            <button
                              onClick={() => handleEdit(inspection)}
                              className="text-amber-600 hover:text-amber-800 p-1 rounded transition-colors duration-150"
                              title="Edit"
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
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Schedule/Edit Inspection Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-slate-900">
                    {editingInspection ? "Edit Inspection" : "Schedule New Inspection"}
                  </h2>
                  <button
                    onClick={() => {
                      setShowForm(false)
                      setEditingInspection(null)
                      setFormData({
                        propertyId: "",
                        inspectorId: "",
                        scheduledDate: "",
                        type: "routine",
                        notes: "",
                      })
                      setErrors({})
                    }}
                    className="text-slate-400 hover:text-slate-600 transition-colors duration-150"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* General Error Display */}
                {errors.general && (
                  <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                    {errors.general}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Property Selection */}
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

                  {/* Scheduled Date */}
                  <div className="space-y-3">
                    <label htmlFor="scheduledDate" className="text-sm font-semibold text-slate-700">
                      Scheduled Date *
                    </label>
                    <input
                      type="datetime-local"
                      id="scheduledDate"
                      value={formData.scheduledDate}
                      onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                      className={`w-full px-4 py-3 bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                        errors.scheduledDate ? "border-red-300 bg-red-50" : "border-slate-200"
                      }`}
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

                  {/* Inspector Selection */}
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
                      {inspectors.map((inspector) => (
                        <option key={inspector.id} value={inspector.id}>
                          {inspector.name} - {inspector.specialization}
                          {inspector.scheduled_inspections > 0 && ` (${inspector.scheduled_inspections} scheduled)`} - $
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
                    {formData.scheduledDate && inspectors.length === 0 && !loadingInspectors && (
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

                  {/* Inspection Type */}
                  <div className="space-y-3">
                    <label htmlFor="type" className="text-sm font-semibold text-slate-700">
                      Inspection Type
                    </label>
                    <select
                      id="type"
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    >
                      <option value="routine">Routine</option>
                      <option value="maintenance">Maintenance</option>
                      <option value="emergency">Emergency</option>
                      <option value="pre-purchase">Pre-Purchase</option>
                    </select>
                  </div>

                  {/* Notes */}
                  <div className="space-y-3">
                    <label htmlFor="notes" className="text-sm font-semibold text-slate-700">
                      Notes
                    </label>
                    <textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                      placeholder="Add any special instructions or notes..."
                    />
                  </div>

                  {/* Form Actions */}
                  <div className="flex space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowForm(false)
                        setEditingInspection(null)
                        setFormData({
                          propertyId: "",
                          inspectorId: "",
                          scheduledDate: "",
                          type: "routine",
                          notes: "",
                        })
                        setErrors({})
                      }}
                      className="flex-1 px-6 py-3 border border-slate-300 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition-colors duration-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-3 rounded-xl font-semibold transition-colors duration-200 flex items-center justify-center space-x-2"
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span>Saving...</span>
                        </>
                      ) : (
                        <span>{editingInspection ? "Update Inspection" : "Schedule Inspection"}</span>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* View Inspection Modal */}
        {viewingInspection && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-slate-900">Inspection Details</h2>
                  <button
                    onClick={() => setViewingInspection(null)}
                    className="text-slate-400 hover:text-slate-600 transition-colors duration-150"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-semibold text-slate-700">Property</label>
                    <p className="text-slate-900 mt-1">{viewingInspection.propertyName || 'N/A'}</p>
                  </div>
                  {user?.role !== "client" && (
                    <div>
                      <label className="text-sm font-semibold text-slate-700">Inspector</label>
                      <p className="text-slate-900 mt-1">
                        {viewingInspection.inspector_name || viewingInspection.inspectorName || 'N/A'}
                      </p>
                    </div>
                  )}
                  <div>
                    <label className="text-sm font-semibold text-slate-700">Scheduled Date</label>
                    <p className="text-slate-900 mt-1">
                      {formatDate(viewingInspection.scheduledDate || viewingInspection.startDate)}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-slate-700">Type</label>
                    <p className="text-slate-900 mt-1 capitalize">{viewingInspection.type || 'routine'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-slate-700">Status</label>
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mt-1 ${getStatusColor(viewingInspection.status)}`}
                    >
                      {viewingInspection.status || 'scheduled'}
                    </span>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-slate-700">Progress</label>
                    <div className="flex items-center space-x-2 mt-1">
                      <div className="flex-1 bg-slate-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${viewingInspection.progress || 0}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-slate-600">{viewingInspection.progress || 0}%</span>
                    </div>
                  </div>
                  {viewingInspection.notes && (
                    <div>
                      <label className="text-sm font-semibold text-slate-700">Notes</label>
                      <div className="bg-slate-50 rounded-lg p-3 mt-2 border border-slate-200">
                        {viewingInspection.notes.split('\n').map((note, index) => (
                          <p key={index} className="text-slate-900 py-1 border-b border-slate-100 last:border-0">
                            {note}
                          </p>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-end pt-6">
                  <button
                    onClick={() => setViewingInspection(null)}
                    className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold transition-colors duration-200"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
