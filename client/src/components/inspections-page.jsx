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
        return "bg-emerald-100 text-emerald-700 border-emerald-200"
      case "in-progress":
        return "bg-blue-100 text-blue-700 border-blue-200"
      case "scheduled":
        return "bg-amber-100 text-amber-700 border-amber-200"
      case "overdue":
        return "bg-red-100 text-red-700 border-red-200"
      default:
        return "bg-gray-100 text-gray-700 border-gray-200"
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="text-slate-600 font-medium">Loading inspections...</span>
        </div>
      </div>
    )
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

      {/* Error Display */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl shadow-sm">
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="font-medium">{error}</span>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white border border-slate-200 rounded-2xl p-8 mb-8 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className="text-sm font-semibold text-slate-700">Search Inspections</label>
              <div className="relative">
                <svg
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by property or inspector..."
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>
            </div>
            <div className="space-y-3">
              <label className="text-sm font-semibold text-slate-700">Filter by Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              >
                <option value="all">All Status</option>
                <option value="scheduled">Scheduled</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="overdue">Overdue</option>
              </select>
            </div>
          </div>
          <div className="mt-6 flex items-center justify-between">
            <div className="text-sm text-slate-600 bg-slate-100 px-4 py-2 rounded-full">
              <span className="font-semibold">{filteredInspections.length}</span> inspection
              {filteredInspections.length !== 1 ? "s" : ""} found
            </div>
          </div>
        </div>

        {/* Inspections Grid */}
        {filteredInspections.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-gradient-to-br from-slate-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-slate-800 mb-3">No inspections found</h3>
            <p className="text-slate-600 max-w-md mx-auto">
              {searchTerm || filterStatus !== "all"
                ? "Try adjusting your search criteria or filters to find what you're looking for"
                : "Get started by scheduling your first property inspection"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredInspections.map((inspection) => (
              <div
                key={inspection.id}
                className="bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className="flex items-start justify-between mb-6">
                  <div className="flex-1">
                    <h3 className="font-bold text-slate-800 text-lg mb-2">{inspection.propertyName}</h3>
                    <p className="text-slate-600 flex items-center space-x-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                      <span>{inspection.inspectorName}</span>
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(inspection.status)}`}
                  >
                    {inspection.status}
                  </span>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500 font-medium">Type:</span>
                    <span className="text-slate-800 font-semibold capitalize">{inspection.type}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500 font-medium">Scheduled:</span>
                    <span className="text-slate-800 font-semibold">{inspection.scheduledDate}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500 font-medium">Progress:</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-16 h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-400 to-blue-500 transition-all duration-300"
                          style={{ width: `${inspection.progress || 0}%` }}
                        ></div>
                      </div>
                      <span className="text-slate-800 font-semibold text-xs">{inspection.progress || 0}%</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end space-x-2 pt-4 border-t border-slate-100">
                  <button
                    onClick={() => handleStartInspection(inspection)}
                    className="px-4 py-2 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-all duration-200 font-medium"
                  >
                    {inspection.status === "completed" ? "View Details" : "Start Inspection"}
                  </button>
                  {hasPermission("canEditInspection") && (
                    <button
                      onClick={() => handleEdit(inspection)}
                      className="px-4 py-2 text-sm text-slate-600 hover:text-slate-700 hover:bg-slate-50 rounded-lg transition-all duration-200 font-medium"
                    >
                      Edit
                    </button>
                  )}
                  {hasPermission("canDeleteInspection") && (
                    <button
                      onClick={() => handleDelete(inspection)}
                      className="px-4 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200 font-medium"
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
                <label htmlFor="inspectorName" className="text-sm font-semibold text-slate-700">
                  Inspector Name *
                </label>
                <input
                  id="inspectorName"
                  type="text"
                  value={formData.inspectorName}
                  onChange={(e) => setFormData({ ...formData, inspectorName: e.target.value })}
                  className={`w-full px-4 py-3 bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                    errors.inspectorName ? "border-red-300 bg-red-50" : "border-slate-200"
                  }`}
                  placeholder="Enter inspector's full name"
                  disabled={loading}
                />
                {errors.inspectorName && (
                  <p className="text-sm text-red-600 flex items-center space-x-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span>{errors.inspectorName}</span>
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
                <label htmlFor="type" className="text-sm font-semibold text-slate-700">
                  Inspection Type
                </label>
                <select
                  id="type"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  disabled={loading}
                >
                  <option value="routine">Routine Inspection</option>
                  <option value="maintenance">Maintenance Check</option>
                  <option value="safety">Safety Inspection</option>
                  <option value="compliance">Compliance Review</option>
                </select>
              </div>

              <div className="space-y-3">
                <label htmlFor="notes" className="text-sm font-semibold text-slate-700">
                  Additional Notes
                </label>
                <textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  rows={4}
                  placeholder="Add any special instructions or notes for this inspection..."
                  disabled={loading}
                />
              </div>

              <div className="flex items-center justify-end space-x-4 pt-6 border-t border-slate-100">
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
