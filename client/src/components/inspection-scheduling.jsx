"use client"

import { useState, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { fetchAvailableSupervisors, assignTaskToSupervisor } from "../redux/supervisorSlice"
import { createInspection } from "../redux/inspectionSlice"

const EnhancedInspectionScheduling = ({ onClose, onSuccess }) => {
  const dispatch = useDispatch()
  const { availableSupervisors, loading } = useSelector((state) => state.supervisors)
  const { user } = useSelector((state) => state.users)

  const [formData, setFormData] = useState({
    property_id: "",
    scheduled_date: "",
    inspection_type: "routine",
    supervisor_id: "",
    notes: "",
  })

  const [selectedDate, setSelectedDate] = useState("")

  useEffect(() => {
    if (selectedDate) {
      dispatch(fetchAvailableSupervisors(selectedDate))
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

    try {
      // Create the inspection with supervisor assignment
      const inspectionData = {
        ...formData,
        created_by: user?.id,
        status: "pending",
      }

      await dispatch(createInspection(inspectionData)).unwrap()

      // Also assign the task to the supervisor
      await dispatch(
        assignTaskToSupervisor({
          supervisorId: formData.supervisor_id,
          taskData: inspectionData,
        }),
      ).unwrap()

      onSuccess?.()
      onClose?.()
    } catch (error) {
      console.error("Error scheduling inspection:", error)
    }
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Schedule New Inspection</h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Property ID *</label>
              <input
                type="text"
                name="property_id"
                value={formData.property_id}
                onChange={handleInputChange}
                required
                placeholder="Enter property ID"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                min={new Date().toISOString().split("T")[0]}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Inspection Type *</label>
              <select
                name="inspection_type"
                value={formData.inspection_type}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="routine">Routine Inspection</option>
                <option value="maintenance">Maintenance Check</option>
                <option value="safety">Safety Inspection</option>
                <option value="compliance">Compliance Review</option>
                <option value="emergency">Emergency Inspection</option>
              </select>
            </div>

            {selectedDate && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Assign Supervisor *</label>
                {loading ? (
                  <div className="text-sm text-gray-500">Loading available supervisors...</div>
                ) : availableSupervisors.length > 0 ? (
                  <select
                    name="supervisor_id"
                    value={formData.supervisor_id}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select a supervisor</option>
                    {availableSupervisors.map((supervisor) => (
                      <option key={supervisor.id} value={supervisor.id}>
                        {supervisor.name} - {supervisor.specialization}({supervisor.scheduled_inspections || 0}{" "}
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
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows={3}
                placeholder="Additional notes or special instructions..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !formData.supervisor_id}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-50"
              >
                {loading ? "Scheduling..." : "Schedule Inspection"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default EnhancedInspectionScheduling
