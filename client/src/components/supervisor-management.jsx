"use client"

import { useState, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import {
  fetchSupervisors,
  createSupervisor,
  updateSupervisor,
  deleteSupervisor,
  clearError,
  setSelectedSupervisor,
} from "../redux/supervisorSlice"

const SupervisorManagement = () => {
  const dispatch = useDispatch()
  const { supervisors, loading, error, selectedSupervisor } = useSelector((state) => state.supervisors)
  const { user } = useSelector((state) => state.users)

  const [showModal, setShowModal] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    specialization: "",
    certification: "",
    experience_years: "",
    hourly_rate: "",
    availability_status: "available",
  })

  useEffect(() => {
    dispatch(fetchSupervisors())
  }, [dispatch])

  useEffect(() => {
    if (selectedSupervisor && editMode) {
      setFormData({
        name: selectedSupervisor.name || "",
        email: selectedSupervisor.email || "",
        phone: selectedSupervisor.phone || "",
        specialization: selectedSupervisor.specialization || "",
        certification: selectedSupervisor.certification || "",
        experience_years: selectedSupervisor.experience_years || "",
        hourly_rate: selectedSupervisor.hourly_rate || "",
        availability_status: selectedSupervisor.availability_status || "available",
      })
    }
  }, [selectedSupervisor, editMode])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      if (editMode && selectedSupervisor) {
        await dispatch(
          updateSupervisor({
            id: selectedSupervisor.id,
            data: formData,
          }),
        ).unwrap()
      } else {
        await dispatch(createSupervisor(formData)).unwrap()
      }

      resetForm()
      setShowModal(false)
    } catch (error) {
      console.error("Error saving supervisor:", error)
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      specialization: "",
      certification: "",
      experience_years: "",
      hourly_rate: "",
      availability_status: "available",
    })
    setEditMode(false)
    dispatch(setSelectedSupervisor(null))
  }

  const handleEdit = (supervisor) => {
    dispatch(setSelectedSupervisor(supervisor))
    setEditMode(true)
    setShowModal(true)
  }

  const handleDelete = async (supervisorId) => {
    if (window.confirm("Are you sure you want to delete this supervisor?")) {
      try {
        await dispatch(deleteSupervisor(supervisorId)).unwrap()
      } catch (error) {
        console.error("Error deleting supervisor:", error)
      }
    }
  }

  const openAddModal = () => {
    resetForm()
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    resetForm()
  }

  const hasPermission = (action) => {
    const userRole = user?.role
    const permissions = {
      canViewSupervisors: userRole === "admin" || userRole === "supervisor",
      canCreateSupervisor: userRole === "admin", // Only admin can create supervisors
      canEditSupervisor: userRole === "admin", // Only admin can edit supervisors
      canDeleteSupervisor: userRole === "admin", // Only admin can delete supervisors
    }
    return permissions[action] || false
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {user?.role === "admin" ? "Supervisor Management" : "Supervisors"}
        </h1>
        {hasPermission("canCreateSupervisor") && (
          <button
            onClick={openAddModal}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <span>+</span>
            Add Supervisor
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
          <button onClick={() => dispatch(clearError())} className="float-right text-red-700 hover:text-red-900">
            ×
          </button>
        </div>
      )}

      {/* Supervisors Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Supervisor
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contact
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Specialization
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Experience
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Workload
              </th>
              {hasPermission("canEditSupervisor") && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {supervisors.map((supervisor) => (
              <tr key={supervisor.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <span className="text-blue-600 font-medium">{supervisor.name?.charAt(0)?.toUpperCase()}</span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{supervisor.name}</div>
                      <div className="text-sm text-gray-500">ID: {supervisor.id}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{supervisor.email}</div>
                  <div className="text-sm text-gray-500">{supervisor.phone}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{supervisor.specialization}</div>
                  <div className="text-sm text-gray-500">{supervisor.certification}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{supervisor.experience_years} years</div>
                  <div className="text-sm text-gray-500">${supervisor.hourly_rate}/hr</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      supervisor.availability_status === "available"
                        ? "bg-green-100 text-green-800"
                        : supervisor.availability_status === "busy"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                    }`}
                  >
                    {supervisor.availability_status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <div>Active: {supervisor.active_inspections || 0}</div>
                  <div>Pending: {supervisor.pending_inspections || 0}</div>
                </td>
                {hasPermission("canEditSupervisor") && (
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button onClick={() => handleEdit(supervisor)} className="text-blue-600 hover:text-blue-900 mr-3">
                      Edit
                    </button>
                    {hasPermission("canDeleteSupervisor") && (
                      <button onClick={() => handleDelete(supervisor.id)} className="text-red-600 hover:text-red-900">
                        Delete
                      </button>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>

        {supervisors.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No supervisors found. Add your first supervisor to get started.
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && hasPermission("canCreateSupervisor") && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editMode ? "Edit Supervisor" : "Add New Supervisor"}
              </h3>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Specialization</label>
                  <select
                    name="specialization"
                    value={formData.specialization}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Specialization</option>
                    <option value="residential">Residential</option>
                    <option value="commercial">Commercial</option>
                    <option value="industrial">Industrial</option>
                    <option value="electrical">Electrical</option>
                    <option value="plumbing">Plumbing</option>
                    <option value="hvac">HVAC</option>
                    <option value="structural">Structural</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Certification</label>
                  <input
                    type="text"
                    name="certification"
                    value={formData.certification}
                    onChange={handleInputChange}
                    placeholder="e.g., Certified Inspector License #12345"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Experience (Years)</label>
                    <input
                      type="number"
                      name="experience_years"
                      value={formData.experience_years}
                      onChange={handleInputChange}
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Hourly Rate ($)</label>
                    <input
                      type="number"
                      name="hourly_rate"
                      value={formData.hourly_rate}
                      onChange={handleInputChange}
                      min="0"
                      step="0.01"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Availability Status</label>
                  <select
                    name="availability_status"
                    value={formData.availability_status}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="available">Available</option>
                    <option value="busy">Busy</option>
                    <option value="unavailable">Unavailable</option>
                  </select>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-50"
                  >
                    {loading ? "Saving..." : editMode ? "Update" : "Create"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SupervisorManagement
