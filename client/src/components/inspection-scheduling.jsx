"use client"

import { useState, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { fetchAvailableSupervisors, assignTaskToSupervisor } from "../redux/supervisorSlice"
import { createInspection } from "../redux/slices/inspectionSlice"

function EnhancedInspectionScheduling({ onClose, onSuccess }) {
  const dispatch = useDispatch()
  const { availableSupervisors, loading } = useSelector((state) => state.supervisors)
  const { user } = useSelector((state) => state.users)
  const { loading: inspectionLoading } = useSelector((state) => state.inspections)

  const [availableInspectors, setAvailableInspectors] = useState([])
  const [loadingInspectors, setLoadingInspectors] = useState(false)

  const [formData, setFormData] = useState({
    property_id: "",
    scheduled_date: "",
    inspection_type: "routine",
    supervisor_id: "",
    inspector_id: "", // Added inspector_id field
    notes: "",
  })

  const [selectedDate, setSelectedDate] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState(null) // 'success', 'error', or null
  const [submitMessage, setSubmitMessage] = useState("")

  const fetchAvailableInspectors = async (selectedDate = null) => {
    try {
      setLoadingInspectors(true)
      const url = selectedDate
        ? `http://localhost:4000/api/inspector/available?date=${selectedDate}`
        : "http://localhost:4000/api/inspector/available"

      const response = await fetch(url)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (data.success) {
        setAvailableInspectors(data.data)
      } else {
        console.error("API returned error:", data.msg)
        setAvailableInspectors([])
      }
    } catch (error) {
      console.error("Failed to fetch inspectors:", error)
      setAvailableInspectors([])
    } finally {
      setLoadingInspectors(false)
    }
  }

  useEffect(() => {
    if (selectedDate) {
      dispatch(fetchAvailableSupervisors(selectedDate))
      fetchAvailableInspectors(selectedDate)
    }
  }, [selectedDate, dispatch])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))

    if (name === "scheduled_date") {
      setSelectedDate(value)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    setIsSubmitting(true)
    setSubmitStatus(null)
    setSubmitMessage("Submitting inspection...")

    try {
      // Create the inspection with supervisor assignment
      const inspectionData = {
        ...formData,
        created_by: user?.id,
        status: "pending",
      }

      setSubmitMessage("Creating inspection...")
      await dispatch(createInspection(inspectionData)).unwrap()

      setSubmitMessage("Assigning to supervisor...")
      // Also assign the task to the supervisor
      await dispatch(
        assignTaskToSupervisor({
          supervisorId: formData.supervisor_id,
          taskData: inspectionData,
        }),
      ).unwrap()

      setSubmitStatus("success")
      setSubmitMessage("Inspection scheduled successfully!")

      // Wait a moment to show success message
      setTimeout(() => {
        onSuccess?.()
        onClose?.()
      }, 1500)
    } catch (error) {
      console.error("Error scheduling inspection:", error)
      setSubmitStatus("error")
      setSubmitMessage(error.message || "Failed to schedule inspection. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Schedule New Inspection</h3>

          {submitMessage && (
            <div
              className={`mb-4 p-3 rounded-md ${
                submitStatus === "success"
                  ? "bg-green-100 border border-green-400 text-green-700"
                  : submitStatus === "error"
                    ? "bg-red-100 border border-red-400 text-red-700"
                    : "bg-blue-100 border border-blue-400 text-blue-700"
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Property ID *</label>
              <input
                type="text"
                name="property_id"
                value={formData.property_id}
                onChange={handleInputChange}
                required
                disabled={isSubmitting}
                placeholder="Enter property ID"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Scheduled Date *</label>
              <input
                type="date"
                name="scheduled_date"
                value={formData.scheduled_date}
                onChange={handleInputChange}
                required
                disabled={isSubmitting}
                min={new Date().toISOString().split("T")[0]}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Inspection Type *</label>
              <select
                name="inspection_type"
                value={formData.inspection_type}
                onChange={handleInputChange}
                required
                disabled={isSubmitting}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <option value="routine">Routine Inspection</option>
                <option value="maintenance">Maintenance Check</option>
                <option value="safety">Safety Inspection</option>
                <option value="compliance">Compliance Review</option>
                <option value="emergency">Emergency Inspection</option>
              </select>
            </div>

            {selectedDate && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Assign Supervisor *</label>
                  {loading ? (
                    <div className="flex items-center text-sm text-gray-500">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400 mr-2"></div>
                      Loading available supervisors...
                    </div>
                  ) : availableSupervisors.length > 0 ? (
                    <select
                      name="supervisor_id"
                      value={formData.supervisor_id}
                      onChange={handleInputChange}
                      required
                      disabled={isSubmitting}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    >
                      <option value="">Select a supervisor</option>
                      {availableSupervisors.map((supervisor) => (
                        <option key={supervisor.id} value={supervisor.id}>
                          {supervisor.name} - {supervisor.specialization} ({supervisor.scheduled_inspections || 0}{" "}
                          scheduled)
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="text-sm text-red-600">
                      No supervisors available for this date. Please select a different date.
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Assign Inspector *</label>
                  {loadingInspectors ? (
                    <div className="flex items-center text-sm text-gray-500">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400 mr-2"></div>
                      Loading available inspectors...
                    </div>
                  ) : availableInspectors.length > 0 ? (
                    <select
                      name="inspector_id"
                      value={formData.inspector_id}
                      onChange={handleInputChange}
                      required
                      disabled={isSubmitting}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    >
                      <option value="">Select an inspector</option>
                      {availableInspectors.map((inspector) => (
                        <option key={inspector.id} value={inspector.id}>
                          {inspector.name} - {inspector.specialization} ({inspector.scheduled_inspections || 0}{" "}
                          scheduled) - ${inspector.hourly_rate}/hr
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="text-sm text-red-600">
                      No inspectors available for this date. Please select a different date.
                    </div>
                  )}
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows={3}
                disabled={isSubmitting}
                placeholder="Additional notes or special instructions..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !formData.supervisor_id || !formData.inspector_id}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {isSubmitting && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>}
                {isSubmitting ? "Scheduling..." : "Schedule Inspection"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default EnhancedInspectionScheduling
