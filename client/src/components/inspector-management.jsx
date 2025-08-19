"use client"

import { useState, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import {
  fetchInspectors,
  fetchAvailableInspectors,
  createInspector,
  updateInspector,
  deleteInspector,
  assignInspectionTask,
  clearError,
  setSelectedInspector,
  clearSelectedInspector,
} from "../redux/slices/inspectorSlice"

export default function InspectorManagement() {
  const dispatch = useDispatch()
  const { inspectors, availableInspectors, selectedInspector, loading, error, assignmentLoading, assignmentError } =
    useSelector((state) => state.inspectors)
  const { inspections } = useSelector((state) => state.inspections)

  const [showCreateForm, setShowCreateForm] = useState(false)
  const [showAssignmentModal, setShowAssignmentModal] = useState(false)
  const [selectedInspection, setSelectedInspection] = useState(null)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    specialization: "",
    certification: "",
    experience_years: 0,
    hourly_rate: 0,
    availability: "available",
    status: "active",
  })

  useEffect(() => {
    dispatch(fetchInspectors())
    dispatch(fetchAvailableInspectors())
  }, [dispatch])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (selectedInspector) {
      await dispatch(updateInspector({ id: selectedInspector.id, inspectorData: formData }))
    } else {
      await dispatch(createInspector(formData))
    }
    setShowCreateForm(false)
    setFormData({
      name: "",
      email: "",
      phone: "",
      specialization: "",
      certification: "",
      experience_years: 0,
      hourly_rate: 0,
      availability: "available",
      status: "active",
    })
    dispatch(clearSelectedInspector())
  }

  const handleEdit = (inspector) => {
    dispatch(setSelectedInspector(inspector))
    setFormData(inspector)
    setShowCreateForm(true)
  }

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this inspector?")) {
      await dispatch(deleteInspector(id))
    }
  }

  const handleAssignTask = async (inspectorId) => {
    if (selectedInspection) {
      await dispatch(
        assignInspectionTask({
          inspectionId: selectedInspection.id,
          inspectorId: inspectorId,
        }),
      )
      setShowAssignmentModal(false)
      setSelectedInspection(null)
    }
  }

  const openAssignmentModal = (inspection) => {
    setSelectedInspection(inspection)
    setShowAssignmentModal(true)
    dispatch(fetchAvailableInspectors())
  }

  const getStatusBadge = (status) => {
    const statusColors = {
      active: "bg-green-100 text-green-800",
      inactive: "bg-red-100 text-red-800",
    }
    return `px-2 py-1 rounded-full text-xs font-medium ${statusColors[status] || "bg-gray-100 text-gray-800"}`
  }

  const getAvailabilityBadge = (availability) => {
    const availabilityColors = {
      available: "bg-green-100 text-green-800",
      busy: "bg-yellow-100 text-yellow-800",
      unavailable: "bg-red-100 text-red-800",
    }
    return `px-2 py-1 rounded-full text-xs font-medium ${availabilityColors[availability] || "bg-gray-100 text-gray-800"}`
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Inspector Management</h1>
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          Add Inspector
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
          <button onClick={() => dispatch(clearError())} className="float-right text-red-700 hover:text-red-900">
            ×
          </button>
        </div>
      )}

      {/* Inspectors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {Array.isArray(inspectors) && inspectors.length > 0 ? (
          inspectors.map((inspector) => (
            <div key={inspector.id} className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{inspector.name}</h3>
                  <p className="text-gray-600">{inspector.email}</p>
                  <p className="text-gray-600">{inspector.phone}</p>
                </div>
                <div className="flex space-x-2">
                  <span className={getStatusBadge(inspector.status)}>{inspector.status}</span>
                  <span className={getAvailabilityBadge(inspector.availability)}>{inspector.availability}</span>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <p className="text-sm">
                  <span className="font-medium">Specialization:</span> {inspector.specialization}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Experience:</span> {inspector.experience_years} years
                </p>
                <p className="text-sm">
                  <span className="font-medium">Rate:</span> ${inspector.hourly_rate}/hr
                </p>
                <p className="text-sm">
                  <span className="font-medium">Certification:</span> {inspector.certification}
                </p>
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(inspector)}
                  className="flex-1 bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-2 rounded text-sm font-medium transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(inspector.id)}
                  className="flex-1 bg-red-50 text-red-600 hover:bg-red-100 px-3 py-2 rounded text-sm font-medium transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-8 text-gray-500">
            {loading ? "Loading inspectors..." : "No inspectors found"}
          </div>
        )}
      </div>

      {/* Pending Inspections for Assignment */}
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Assign Inspections</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Property
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Start Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Assigned Inspector
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {Array.isArray(inspections) && inspections.length > 0 ? (
                inspections
                  .filter((inspection) => inspection.status === "pending")
                  .map((inspection) => (
                    <tr key={inspection.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {inspection.property_name || `Property #${inspection.property_id}`}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          {inspection.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(inspection.start_date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {inspection.assigned_inspector_name || "Unassigned"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => openAssignmentModal(inspection)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Assign Inspector
                        </button>
                      </td>
                    </tr>
                  ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                    No pending inspections found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create/Edit Inspector Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">{selectedInspector ? "Edit Inspector" : "Add New Inspector"}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Specialization</label>
                <input
                  type="text"
                  name="specialization"
                  value={formData.specialization}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Certification</label>
                <input
                  type="text"
                  name="certification"
                  value={formData.certification}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Experience (years)</label>
                  <input
                    type="number"
                    name="experience_years"
                    value={formData.experience_years}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hourly Rate</label>
                  <input
                    type="number"
                    step="0.01"
                    name="hourly_rate"
                    value={formData.hourly_rate}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Availability</label>
                  <select
                    name="availability"
                    value={formData.availability}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="available">Available</option>
                    <option value="busy">Busy</option>
                    <option value="unavailable">Unavailable</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div className="flex space-x-4 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                >
                  {selectedInspector ? "Update" : "Create"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateForm(false)
                    dispatch(clearSelectedInspector())
                    setFormData({
                      name: "",
                      email: "",
                      phone: "",
                      specialization: "",
                      certification: "",
                      experience_years: 0,
                      hourly_rate: 0,
                      availability: "available",
                      status: "active",
                    })
                  }}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 px-4 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assignment Modal */}
      {showAssignmentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Assign Inspector</h2>
            {assignmentError && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {assignmentError}
              </div>
            )}
            <div className="space-y-3">
              {Array.isArray(availableInspectors) && availableInspectors.length > 0 ? (
                availableInspectors.map((inspector) => (
                  <div
                    key={inspector.id}
                    className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleAssignTask(inspector.id)}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-medium text-gray-900">{inspector.name}</h3>
                        <p className="text-sm text-gray-600">{inspector.specialization}</p>
                        <p className="text-sm text-gray-600">{inspector.experience_years} years experience</p>
                      </div>
                      <div className="text-right">
                        <span className={getAvailabilityBadge(inspector.availability)}>{inspector.availability}</span>
                        <p className="text-sm text-gray-600 mt-1">${inspector.hourly_rate}/hr</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-gray-500">No available inspectors found</div>
              )}
            </div>
            <div className="flex space-x-4 pt-4">
              <button
                onClick={() => {
                  setShowAssignmentModal(false)
                  setSelectedInspection(null)
                }}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 px-4 rounded-lg font-medium transition-colors"
                disabled={assignmentLoading}
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
