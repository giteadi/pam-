"use client"

import { useState, useEffect } from "react"
import { useSelector } from "react-redux"

export default function SupervisorInspectionForm({ property, onSubmit, onCancel }) {
  const { user } = useSelector((state) => state.users)
  const [loading, setLoading] = useState(false)

  const [inspectionData, setInspectionData] = useState({
    propertyId: property?.id || "",
    inspectorId: user?.id || "",
    amenityChecks: {},
    overallRating: 5,
    review: "",
    recommendations: "",
    issuesFound: [],
    photosRequired: false,
    followUpRequired: false,
    completedDate: new Date().toISOString().split("T")[0],
  })

  const [customIssue, setCustomIssue] = useState("")
  const [showCustomIssue, setShowCustomIssue] = useState(false)

  // Common property issues
  const commonIssues = [
    "Plumbing leaks",
    "Electrical problems",
    "HVAC not working",
    "Structural damage",
    "Pest infestation",
    "Safety hazards",
    "Maintenance needed",
    "Cleanliness issues",
  ]

  useEffect(() => {
    if (property?.amenities) {
      // Initialize amenity checks - all start as working (true)
      const initialChecks = {}
      property.amenities.forEach((amenity) => {
        initialChecks[amenity] = true
      })
      setInspectionData((prev) => ({
        ...prev,
        amenityChecks: initialChecks,
      }))
    }
  }, [property])

  const handleAmenityCheck = (amenity, isWorking) => {
    setInspectionData((prev) => ({
      ...prev,
      amenityChecks: {
        ...prev.amenityChecks,
        [amenity]: isWorking,
      },
    }))
  }

  const handleIssueToggle = (issue) => {
    setInspectionData((prev) => ({
      ...prev,
      issuesFound: prev.issuesFound.includes(issue)
        ? prev.issuesFound.filter((i) => i !== issue)
        : [...prev.issuesFound, issue],
    }))
  }

  const addCustomIssue = () => {
    if (customIssue.trim() && !inspectionData.issuesFound.includes(customIssue.trim())) {
      setInspectionData((prev) => ({
        ...prev,
        issuesFound: [...prev.issuesFound, customIssue.trim()],
      }))
      setCustomIssue("")
      setShowCustomIssue(false)
    }
  }

  const removeIssue = (issue) => {
    setInspectionData((prev) => ({
      ...prev,
      issuesFound: prev.issuesFound.filter((i) => i !== issue),
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const inspectionRecord = {
        ...inspectionData,
        status: "completed",
        progress: 100,
        notes: `Review: ${inspectionData.review}\n\nRecommendations: ${inspectionData.recommendations}\n\nIssues Found: ${inspectionData.issuesFound.join(", ")}`,
      }

      console.log("[v0] Submitting supervisor inspection:", inspectionRecord)
      await onSubmit(inspectionRecord)
    } catch (error) {
      console.error("[v0] Failed to submit inspection:", error)
    } finally {
      setLoading(false)
    }
  }

  const nonWorkingAmenities = Object.entries(inspectionData.amenityChecks)
    .filter(([_, isWorking]) => !isWorking)
    .map(([amenity]) => amenity)

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-green-50 to-blue-50">
          <h2 className="text-2xl font-bold text-gray-900">Property Inspection</h2>
          <p className="text-gray-600 mt-1">
            {property?.name} - {property?.address}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          {/* Amenities Checklist */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Amenities Status Check
            </h3>

            {property?.amenities && property.amenities.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {property.amenities.map((amenity) => (
                  <div key={amenity} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-medium text-gray-900">{amenity}</span>
                    </div>
                    <div className="flex space-x-4">
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="radio"
                          name={`amenity-${amenity}`}
                          checked={inspectionData.amenityChecks[amenity] === true}
                          onChange={() => handleAmenityCheck(amenity, true)}
                          className="w-4 h-4 text-green-600 bg-white border-gray-300 focus:ring-green-500"
                        />
                        <span className="ml-2 text-sm text-green-700 font-medium">Working</span>
                      </label>
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="radio"
                          name={`amenity-${amenity}`}
                          checked={inspectionData.amenityChecks[amenity] === false}
                          onChange={() => handleAmenityCheck(amenity, false)}
                          className="w-4 h-4 text-red-600 bg-white border-gray-300 focus:ring-red-500"
                        />
                        <span className="ml-2 text-sm text-red-700 font-medium">Not Working</span>
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 italic">No amenities listed for this property.</p>
            )}
          </div>

          {/* Issues Found */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <svg className="w-5 h-5 mr-2 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
                Issues Found (Optional)
              </h3>
              <button
                type="button"
                onClick={() => setShowCustomIssue(true)}
                className="text-sm bg-orange-100 text-orange-700 px-3 py-1 rounded-lg hover:bg-orange-200 transition-colors"
                disabled={showCustomIssue}
              >
                Add Custom Issue
              </button>
            </div>

            {showCustomIssue && (
              <div className="flex items-center space-x-2 p-4 bg-orange-50 border-2 border-orange-200 rounded-lg">
                <input
                  type="text"
                  value={customIssue}
                  onChange={(e) => setCustomIssue(e.target.value)}
                  placeholder="Describe the issue found..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      addCustomIssue()
                    }
                  }}
                  autoFocus
                />
                <button
                  type="button"
                  onClick={addCustomIssue}
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                  disabled={!customIssue.trim()}
                >
                  Add
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCustomIssue(false)
                    setCustomIssue("")
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
              </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {commonIssues.map((issue) => (
                <label key={issue} className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                  <input
                    type="checkbox"
                    checked={inspectionData.issuesFound.includes(issue)}
                    onChange={() => handleIssueToggle(issue)}
                    className="w-4 h-4 text-orange-600 bg-white border-gray-300 rounded focus:ring-orange-500"
                  />
                  <span className="text-sm text-gray-700">{issue}</span>
                </label>
              ))}
            </div>

            {/* Custom Issues Display */}
            {inspectionData.issuesFound.filter((issue) => !commonIssues.includes(issue)).length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-700">Custom Issues:</h4>
                <div className="flex flex-wrap gap-2">
                  {inspectionData.issuesFound
                    .filter((issue) => !commonIssues.includes(issue))
                    .map((issue) => (
                      <span
                        key={issue}
                        className="inline-flex items-center px-3 py-1 bg-red-100 text-red-800 text-sm rounded-full border border-red-200"
                      >
                        {issue}
                        <button
                          type="button"
                          onClick={() => removeIssue(issue)}
                          className="ml-2 text-red-600 hover:text-red-800 font-bold text-lg leading-none"
                          title="Remove issue"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                </div>
              </div>
            )}
          </div>

          {/* Overall Rating */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <svg className="w-5 h-5 mr-2 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                />
              </svg>
              Overall Property Rating
            </h3>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Poor</span>
              <input
                type="range"
                min="1"
                max="10"
                value={inspectionData.overallRating}
                onChange={(e) =>
                  setInspectionData((prev) => ({ ...prev, overallRating: Number.parseInt(e.target.value) }))
                }
                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <span className="text-sm text-gray-600">Excellent</span>
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-semibold">
                {inspectionData.overallRating}/10
              </span>
            </div>
          </div>

          {/* Review */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <svg className="w-5 h-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
              Inspection Review *
            </h3>
            <div className="mb-2 text-sm text-gray-600">Add review notes line by line for better visibility</div>
            <textarea
              value={inspectionData.review}
              onChange={(e) => setInspectionData((prev) => ({ ...prev, review: e.target.value }))}
              placeholder="Write your detailed review of the property condition, cleanliness, and overall state..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              rows={4}
              required
            />
            {inspectionData.review && (
              <div className="mt-4">
                <h4 className="font-semibold text-gray-700 mb-2">Review Preview</h4>
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                  {inspectionData.review.split('\n').map((note, index) => (
                    <p key={index} className="text-gray-900 py-1 border-b border-gray-100 last:border-0">
                      {note || ' '}
                    </p>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Recommendations */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                />
              </svg>
              Recommendations (Optional)
            </h3>
            <div className="mb-2 text-sm text-gray-600">Add recommendations line by line for better visibility</div>
            <textarea
              value={inspectionData.recommendations}
              onChange={(e) => setInspectionData((prev) => ({ ...prev, recommendations: e.target.value }))}
              placeholder="Provide recommendations for improvements, maintenance, or follow-up actions..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              rows={3}
            />
            {inspectionData.recommendations && (
              <div className="mt-4">
                <h4 className="font-semibold text-gray-700 mb-2">Recommendations Preview</h4>
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                  {inspectionData.recommendations.split('\n').map((note, index) => (
                    <p key={index} className="text-gray-900 py-1 border-b border-gray-100 last:border-0">
                      {note || ' '}
                    </p>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Additional Options */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Additional Actions</h3>
            <div className="space-y-3">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={inspectionData.photosRequired}
                  onChange={(e) => setInspectionData((prev) => ({ ...prev, photosRequired: e.target.checked }))}
                  className="w-4 h-4 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Photos required for documentation</span>
              </label>
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={inspectionData.followUpRequired}
                  onChange={(e) => setInspectionData((prev) => ({ ...prev, followUpRequired: e.target.checked }))}
                  className="w-4 h-4 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Follow-up inspection required</span>
              </label>
            </div>
          </div>

          {/* Summary */}
          {(nonWorkingAmenities.length > 0 || inspectionData.issuesFound.length > 0) && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-semibold text-yellow-800 mb-2">Inspection Summary</h4>
              {nonWorkingAmenities.length > 0 && (
                <p className="text-sm text-yellow-700 mb-1">
                  <strong>Non-working amenities:</strong> {nonWorkingAmenities.join(", ")}
                </p>
              )}
              {inspectionData.issuesFound.length > 0 && (
                <p className="text-sm text-yellow-700">
                  <strong>Issues found:</strong> {inspectionData.issuesFound.join(", ")}
                </p>
              )}
            </div>
          )}

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !inspectionData.review.trim()}
              className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Complete Inspection</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
