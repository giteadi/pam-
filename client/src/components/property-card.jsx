"use client"

import { useState } from "react"

export default function PropertyCard({ property, userRole, onEdit, onView, onDelete, onInspect }) {
  const [showActions, setShowActions] = useState(false)

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "active":
        return "bg-green-100 text-green-800 border-green-200"
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "inactive":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const canEdit = userRole === "admin" || userRole === "supervisor"
  const canDelete = userRole === "admin"
  const canInspect = userRole === "supervisor" && onInspect

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-slate-900 mb-1">{property.name}</h3>
            <p className="text-sm text-slate-600 mb-2">{property.address}</p>
            <div className="flex items-center space-x-2">
              <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(property.status)}`}>
                {property.status}
              </span>
              <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full border border-blue-200">
                {property.type}
              </span>
            </div>
          </div>
          <div className="relative">
            <button
              onClick={() => setShowActions(!showActions)}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01" />
              </svg>
            </button>

            {showActions && (
              <div className="absolute right-0 top-10 bg-white border border-slate-200 rounded-lg shadow-lg py-1 z-10 min-w-[120px]">
                <button
                  onClick={() => {
                    onView(property)
                    setShowActions(false)
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                  View Details
                </button>

                {canInspect && (
                  <button
                    onClick={() => {
                      onInspect(property)
                      setShowActions(false)
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-green-700 hover:bg-green-50 flex items-center"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    Inspect Property
                  </button>
                )}

                {canEdit && !canInspect && (
                  <button
                    onClick={() => {
                      onEdit(property)
                      setShowActions(false)
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-blue-700 hover:bg-blue-50 flex items-center"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                    Edit
                  </button>
                )}

                {canDelete && (
                  <button
                    onClick={() => {
                      onDelete(property)
                      setShowActions(false)
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-red-700 hover:bg-red-50 flex items-center"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                    Delete
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-600">Units:</span>
            <span className="font-medium text-slate-900">{property.units}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-600">Owner:</span>
            <span className="font-medium text-slate-900">{property.owner}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-600">Next Inspection:</span>
            <span className="font-medium text-slate-900">{property.nextInspection || "Not scheduled"}</span>
          </div>
        </div>

        {property.amenities && property.amenities.length > 0 && (
          <div className="mt-4 pt-4 border-t border-slate-200">
            <div className="flex items-center text-sm text-slate-600">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              {property.amenities.length} amenities available
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
