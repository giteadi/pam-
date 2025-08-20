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
  const [showTaskAssignmentModal, setShowTaskAssignmentModal] = useState(false)
  const [selectedInspectorForTask, setSelectedInspectorForTask] = useState(null)
  const [selectedInspection, setSelectedInspection] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState(null)
  const [submitMessage, setSubmitMessage] = useState("")

  const [taskFormData, setTaskFormData] = useState({
    title: "",
    description: "",
    priority: "medium",
    dueDate: "",
    category: "inspection",
    propertyId: "",
  })
  const [taskErrors, setTaskErrors] = useState({})
  const [properties, setProperties] = useState([])
  const [loadingProperties, setLoadingProperties] = useState(false)

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

  const fetchProperties = async () => {
    try {
      setLoadingProperties(true)
      const response = await fetch("http://localhost:4000/api/property")

      if (!response.ok) {
        throw new Error("Failed to fetch properties")
      }

      const data = await response.json()
      if (data.success && data.data) {
        setProperties(data.data)
      } else {
        console.warn("Property API returned unexpected format")
        setProperties([])
      }
    } catch (error) {
      console.error("Failed to fetch properties:", error)
      setProperties([])
    } finally {
      setLoadingProperties(false)
    }
  }

  const handleInspectorCardClick = (inspector) => {
    setSelectedInspectorForTask(inspector)
    setShowTaskAssignmentModal(true)
    setTaskErrors({})
    setSubmitStatus(null)
    setSubmitMessage("")
    fetchProperties()
  }

  const handleTaskInputChange = (e) => {
    const { name, value } = e.target
    setTaskFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleTaskAssignmentSubmit = async (e) => {
    e.preventDefault()

    const newErrors = {}
    if (!taskFormData.title.trim()) newErrors.title = "Title is required"
    if (!taskFormData.description.trim()) newErrors.description = "Description is required"
    if (!taskFormData.dueDate) newErrors.dueDate = "Due date is required"

    setTaskErrors(newErrors)

    if (Object.keys(newErrors).length === 0) {
      setIsSubmitting(true)
      setSubmitStatus(null)
      setSubmitMessage("Assigning task...")

      try {
        const taskData = {
          ...taskFormData,
          assignedTo: selectedInspectorForTask.id,
          assignedToName: selectedInspectorForTask.name,
          assignedToEmail: selectedInspectorForTask.email,
          createdAt: new Date().toISOString(),
        }

        console.log("[v0] Creating task:", taskData)

        const response = await fetch("http://localhost:4000/api/tasks", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(taskData),
        })

        if (!response.ok) {
          throw new Error("Failed to assign task")
        }

        setSubmitStatus("success")
        setSubmitMessage("Task assigned successfully!")

        setTimeout(() => {
          setShowTaskAssignmentModal(false)
          setSelectedInspectorForTask(null)
          setTaskFormData({
            title: "",
            description: "",
            priority: "medium",
            dueDate: "",
            category: "inspection",
            propertyId: "",
          })
          setSubmitStatus(null)
          setSubmitMessage("")
        }, 1500)
      } catch (error) {
        console.error("[v0] Error assigning task:", error)
        setSubmitStatus("error")
        setSubmitMessage("Failed to assign task. Please try again.")
      } finally {
        setIsSubmitting(false)
      }
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    setIsSubmitting(true)
    setSubmitStatus(null)
    setSubmitMessage(selectedInspector ? "Updating inspector..." : "Creating inspector...")

    try {
      if (selectedInspector) {
        await dispatch(updateInspector({ id: selectedInspector.id, inspectorData: formData })).unwrap()
        setSubmitMessage("Inspector updated successfully!")
      } else {
        await dispatch(createInspector(formData)).unwrap()
        setSubmitMessage("Inspector created successfully!")
      }

      setSubmitStatus("success")

      setTimeout(() => {
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
        setSubmitStatus(null)
        setSubmitMessage("")
      }, 1500)
    } catch (error) {
      setSubmitStatus("error")
      setSubmitMessage(error.message || "Failed to save inspector. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = (inspector) => {
    dispatch(setSelectedInspector(inspector))
    setFormData(inspector)
    setShowCreateForm(true)
    setSubmitStatus(null)
    setSubmitMessage("")
  }

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this inspector?")) {
      try {
        await dispatch(deleteInspector(id)).unwrap()
        setSubmitStatus("success")
        setSubmitMessage("Inspector deleted successfully!")
        setTimeout(() => {
          setSubmitStatus(null)
          setSubmitMessage("")
        }, 3000)
      } catch (error) {
        setSubmitStatus("error")
        setSubmitMessage("Failed to delete inspector. Please try again.")
      }
    }
  }

  const handleAssignTask = async (inspectorId) => {
    if (selectedInspection) {
      try {
        await dispatch(
          assignInspectionTask({
            inspectionId: selectedInspection.id,
            inspectorId: inspectorId,
          }),
        ).unwrap()

        setShowAssignmentModal(false)
        setSelectedInspection(null)

        setSubmitStatus("success")
        setSubmitMessage("Inspector assigned successfully!")
        setTimeout(() => {
          setSubmitStatus(null)
          setSubmitMessage("")
        }, 3000)
      } catch (error) {
        setSubmitStatus("error")
        setSubmitMessage("Failed to assign inspector. Please try again.")
      }
    }
  }

  const openAssignmentModal = (inspection) => {
    setSelectedInspection(inspection)
    setShowAssignmentModal(true)
    dispatch(fetchAvailableInspectors())
  }

  const renderMessage = (message, status) => {
    return (
      <div
        className={`mb-4 p-4 rounded-md ${
          status === "success"
            ? "bg-green-100 border border-green-400 text-green-700"
            : "bg-red-100 border border-red-400 text-red-700"
        }`}
      >
        <div className="flex justify-between items-center">
          <span>{message}</span>
          <button
            onClick={() => {
              dispatch(clearError())
              setSubmitStatus(null)
              setSubmitMessage("")
            }}
            className="text-current hover:opacity-75"
          >
            ×
          </button>
        </div>
      </div>
    )
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
          onClick={() => {
            setShowCreateForm(true)
            setSubmitStatus(null)
            setSubmitMessage("")
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          Add Inspector
        </button>
      </div>

      {(error || submitMessage) && renderMessage(submitMessage || error, submitStatus)}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {Array.isArray(inspectors) && inspectors.length > 0 ? (
          inspectors.map((inspector) => (
            <div
              key={inspector.id}
              className="bg-white rounded-lg shadow-md p-6 border border-gray-200 cursor-pointer hover:shadow-lg hover:border-blue-300 transition-all duration-200 transform hover:scale-105"
              onClick={() => handleInspectorCardClick(inspector)}
            >
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
                <p className="text-sm">
                  <span className="font-medium">Total Inspections:</span> {inspector.total_inspections || 0}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Completed:</span> {inspector.completed_inspections || 0}
                </p>
              </div>

              <div className="mb-4 p-2 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-xs text-blue-600 font-medium text-center">Click to assign task directly</p>
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleEdit(inspector)
                  }}
                  className="flex-1 bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-2 rounded text-sm font-medium transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDelete(inspector.id)
                  }}
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

      {showTaskAssignmentModal && selectedInspectorForTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900">Assign Task</h2>
                <p className="text-gray-600 mt-1">
                  Assigning to: <span className="font-medium text-blue-600">{selectedInspectorForTask.name}</span>
                </p>
              </div>
              <button
                onClick={() => {
                  setShowTaskAssignmentModal(false)
                  setSelectedInspectorForTask(null)
                  setTaskFormData({
                    title: "",
                    description: "",
                    priority: "medium",
                    dueDate: "",
                    category: "inspection",
                    propertyId: "",
                  })
                  setTaskErrors({})
                  setSubmitStatus(null)
                  setSubmitMessage("")
                }}
                className="text-gray-400 hover:text-gray-600 text-2xl"
                disabled={isSubmitting}
              >
                ×
              </button>
            </div>

            {submitMessage && (
              <div
                className={`mb-4 p-3 rounded-md ${
                  submitStatus === "success"
                    ? "bg-green-100 border border-green-400 text-green-700"
                    : "bg-red-100 border border-red-400 text-red-700"
                }`}
              >
                <div className="flex items-center">
                  {isSubmitting && (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                  )}
                  {submitMessage}
                </div>
              </div>
            )}

            <form onSubmit={handleTaskAssignmentSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Task Title *</label>
                <input
                  type="text"
                  name="title"
                  value={taskFormData.title}
                  onChange={handleTaskInputChange}
                  disabled={isSubmitting}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  placeholder="Enter task title"
                  required
                />
                {taskErrors.title && <p className="text-sm text-red-600 mt-1">{taskErrors.title}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                <textarea
                  name="description"
                  value={taskFormData.description}
                  onChange={handleTaskInputChange}
                  disabled={isSubmitting}
                  rows={4}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  placeholder="Enter task description"
                  required
                />
                {taskErrors.description && <p className="text-sm text-red-600 mt-1">{taskErrors.description}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Property</label>
                <select
                  name="propertyId"
                  value={taskFormData.propertyId}
                  onChange={handleTaskInputChange}
                  disabled={isSubmitting || loadingProperties}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="">
                    {loadingProperties ? "Loading properties..." : "Select a property (optional)"}
                  </option>
                  {properties.map((property) => (
                    <option key={property.id} value={property.id}>
                      {property.name} - {property.address}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <select
                    name="priority"
                    value={taskFormData.priority}
                    onChange={handleTaskInputChange}
                    disabled={isSubmitting}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    name="category"
                    value={taskFormData.category}
                    onChange={handleTaskInputChange}
                    disabled={isSubmitting}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option value="inspection">Inspection</option>
                    <option value="documentation">Documentation</option>
                    <option value="compliance">Compliance</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Due Date *</label>
                  <input
                    type="date"
                    name="dueDate"
                    value={taskFormData.dueDate}
                    onChange={handleTaskInputChange}
                    disabled={isSubmitting}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    required
                  />
                  {taskErrors.dueDate && <p className="text-sm text-red-600 mt-1">{taskErrors.dueDate}</p>}
                </div>
              </div>

              <div className="flex space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowTaskAssignmentModal(false)
                    setSelectedInspectorForTask(null)
                    setTaskFormData({
                      title: "",
                      description: "",
                      priority: "medium",
                      dueDate: "",
                      category: "inspection",
                      propertyId: "",
                    })
                    setTaskErrors({})
                    setSubmitStatus(null)
                    setSubmitMessage("")
                  }}
                  disabled={isSubmitting}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 px-4 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isSubmitting && (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  )}
                  {isSubmitting ? "Assigning..." : "Assign Task"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">{selectedInspector ? "Edit Inspector" : "Add New Inspector"}</h2>

            {submitMessage && (
              <div
                className={`mb-4 p-3 rounded-md ${
                  submitStatus === "success"
                    ? "bg-green-100 border border-green-400 text-green-700"
                    : "bg-red-100 border border-red-400 text-red-700"
                }`}
              >
                <div className="flex items-center">
                  {isSubmitting && (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                  )}
                  {submitMessage}
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  disabled={isSubmitting}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
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
                  disabled={isSubmitting}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
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
                  disabled={isSubmitting}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Specialization</label>
                <input
                  type="text"
                  name="specialization"
                  value={formData.specialization}
                  onChange={handleInputChange}
                  disabled={isSubmitting}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Certification</label>
                <input
                  type="text"
                  name="certification"
                  value={formData.certification}
                  onChange={handleInputChange}
                  disabled={isSubmitting}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
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
                    disabled={isSubmitting}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
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
                    disabled={isSubmitting}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
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
                    disabled={isSubmitting}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
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
                    disabled={isSubmitting}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div className="flex space-x-4 pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isSubmitting && (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  )}
                  {isSubmitting
                    ? selectedInspector
                      ? "Updating..."
                      : "Creating..."
                    : selectedInspector
                      ? "Update"
                      : "Create"}
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
                    setSubmitStatus(null)
                    setSubmitMessage("")
                  }}
                  disabled={isSubmitting}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 px-4 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showAssignmentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Assign Inspector</h2>
            {assignmentError && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {assignmentError}
              </div>
            )}

            {assignmentLoading && (
              <div className="flex items-center justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-2"></div>
                <span>Assigning inspector...</span>
              </div>
            )}

            <div className="space-y-3">
              {Array.isArray(availableInspectors) && availableInspectors.length > 0 ? (
                availableInspectors.map((inspector) => (
                  <div
                    key={inspector.id}
                    className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
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
                <div className="text-center py-4 text-gray-500">
                  {loading ? "Loading available inspectors..." : "No available inspectors found"}
                </div>
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

function getStatusBadge(status) {
  const statusColors = {
    active: "bg-green-100 text-green-800",
    inactive: "bg-red-100 text-red-800",
  }
  return `px-2 py-1 rounded-full text-xs font-medium ${statusColors[status] || "bg-gray-100 text-gray-800"}`
}

function getAvailabilityBadge(availability) {
  const availabilityColors = {
    available: "bg-green-100 text-green-800",
    busy: "bg-yellow-100 text-yellow-800",
    unavailable: "bg-red-100 text-red-800",
  }
  return `px-2 py-1 rounded-full text-xs font-medium ${availabilityColors[availability] || "bg-gray-100 text-gray-800"}`
}
