"use client"

import { useState, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { updateInspection } from "../redux/slices/inspectionSlice"

export default function PropertyInspectionForm({ property, onClose, onSave }) {
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.users)
  const { inspections, loading } = useSelector((state) => state.inspections)
  
  // Find inspections related to this property
  const propertyInspections = inspections.filter(inspection => 
    inspection.property_id === property.id
  )

  // State for the form
  const [notes, setNotes] = useState("")
  const [amenities, setAmenities] = useState({
    // Default amenities to check
    cooler: { status: false, comment: "" },
    ac: { status: false, comment: "" },
    lighting: { status: false, comment: "" },
    plumbing: { status: false, comment: "" },
    electrical: { status: false, comment: "" },
    security: { status: false, comment: "" },
  })
  const [customAmenities, setCustomAmenities] = useState([])
  const [newAmenityName, setNewAmenityName] = useState("")
  const [newAmenityComment, setNewAmenityComment] = useState("")
  
  const handleAmenityChange = (name, checked) => {
    setAmenities(prev => ({
      ...prev,
      [name]: {
        ...prev[name],
        status: checked
      }
    }))
  }
  
  const handleAmenityCommentChange = (name, comment) => {
    setAmenities(prev => ({
      ...prev,
      [name]: {
        ...prev[name],
        comment
      }
    }))
  }
  
  const handleAddCustomAmenity = () => {
    if (newAmenityName.trim()) {
      setCustomAmenities(prev => [
        ...prev,
        {
          name: newAmenityName.trim(),
          status: false,
          comment: newAmenityComment.trim()
        }
      ])
      setNewAmenityName("")
      setNewAmenityComment("")
    }
  }
  
  const handleCustomAmenityChange = (index, checked) => {
    setCustomAmenities(prev => {
      const updated = [...prev]
      updated[index] = {
        ...updated[index],
        status: checked
      }
      return updated
    })
  }
  
  const handleCustomAmenityCommentChange = (index, comment) => {
    setCustomAmenities(prev => {
      const updated = [...prev]
      updated[index] = {
        ...updated[index],
        comment
      }
      return updated
    })
  }
  
  const handleRemoveCustomAmenity = (index) => {
    setCustomAmenities(prev => prev.filter((_, i) => i !== index))
  }
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Prepare data for saving
    const inspectionData = {
      property_id: property.id,
      notes,
      amenities: Object.entries(amenities).map(([name, details]) => ({
        name,
        status: details.status,
        comment: details.comment
      })),
      customAmenities
    }
    
    // If there's an existing inspection for this property, update it
    if (propertyInspections.length > 0) {
      const inspectionId = propertyInspections[0].id
      try {
        await dispatch(updateInspection({
          id: inspectionId,
          data: {
            notes,
            checklist: {
              ...amenities,
              customAmenities
            },
            progress: calculateProgress()
          }
        })).unwrap()
      } catch (error) {
        console.error("Failed to update inspection:", error)
      }
    }
    
    // Call the onSave callback with the inspection data
    onSave(inspectionData)
  }
  
  const calculateProgress = () => {
    const totalItems = Object.keys(amenities).length + customAmenities.length
    const checkedItems = Object.values(amenities).filter(a => a.status).length +
                         customAmenities.filter(a => a.status).length
    
    return totalItems > 0 ? Math.round((checkedItems / totalItems) * 100) : 0
  }
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-blue-50 to-indigo-50 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-800">Inspect Property: {property.name}</h2>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-white rounded-lg transition-all duration-200"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Property Info */}
          <div className="bg-slate-50 rounded-xl p-4">
            <h3 className="font-bold text-slate-800 mb-3">Property Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-slate-600">Name:</span>
                <span className="font-medium text-slate-800 ml-2">{property.name}</span>
              </div>
              <div>
                <span className="text-slate-600">Address:</span>
                <span className="font-medium text-slate-800 ml-2">{property.address}</span>
              </div>
              <div>
                <span className="text-slate-600">Type:</span>
                <span className="font-medium text-slate-800 ml-2">{property.type}</span>
              </div>
            </div>
          </div>
          
          {/* Inspection Notes */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Inspection Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add general notes about the property inspection..."
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 min-h-[100px]"
            />
          </div>
          
          {/* Standard Amenities */}
          <div className="bg-slate-50 rounded-xl p-4">
            <h3 className="font-bold text-slate-800 mb-3">Standard Amenities</h3>
            <div className="space-y-4">
              {Object.entries(amenities).map(([name, details]) => (
                <div key={name} className="border-b border-slate-200 pb-3 last:border-0 last:pb-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id={`amenity-${name}`}
                        checked={details.status}
                        onChange={(e) => handleAmenityChange(name, e.target.checked)}
                        className="h-5 w-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <label htmlFor={`amenity-${name}`} className="font-medium text-slate-700 capitalize">
                        {name}
                      </label>
                    </div>
                  </div>
                  {details.status && (
                    <div className="mt-2 pl-8">
                      <input
                        type="text"
                        value={details.comment}
                        onChange={(e) => handleAmenityCommentChange(name, e.target.value)}
                        placeholder="Add comments..."
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent text-sm"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          
          {/* Custom Amenities */}
          <div className="bg-slate-50 rounded-xl p-4">
            <h3 className="font-bold text-slate-800 mb-3">Custom Amenities</h3>
            
            {/* Add new custom amenity */}
            <div className="mb-4 p-3 border border-dashed border-slate-300 rounded-lg bg-white">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                <input
                  type="text"
                  value={newAmenityName}
                  onChange={(e) => setNewAmenityName(e.target.value)}
                  placeholder="Amenity name..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent text-sm"
                />
                <input
                  type="text"
                  value={newAmenityComment}
                  onChange={(e) => setNewAmenityComment(e.target.value)}
                  placeholder="Comments (optional)..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>
              <button
                type="button"
                onClick={handleAddCustomAmenity}
                disabled={!newAmenityName.trim()}
                className="w-full py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg text-sm font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add Custom Amenity
              </button>
            </div>
            
            {/* List of custom amenities */}
            {customAmenities.length > 0 ? (
              <div className="space-y-4">
                {customAmenities.map((amenity, index) => (
                  <div key={index} className="border-b border-slate-200 pb-3 last:border-0 last:pb-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          id={`custom-amenity-${index}`}
                          checked={amenity.status}
                          onChange={(e) => handleCustomAmenityChange(index, e.target.checked)}
                          className="h-5 w-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        />
                        <label htmlFor={`custom-amenity-${index}`} className="font-medium text-slate-700">
                          {amenity.name}
                        </label>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveCustomAmenity(index)}
                        className="text-red-500 hover:text-red-700 p-1"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    {amenity.status && (
                      <div className="mt-2 pl-8">
                        <input
                          type="text"
                          value={amenity.comment}
                          onChange={(e) => handleCustomAmenityCommentChange(index, e.target.value)}
                          placeholder="Add comments..."
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent text-sm"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500 italic">No custom amenities added yet.</p>
            )}
          </div>
          
          {/* Progress */}
          <div className="bg-slate-50 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-slate-800">Inspection Progress</h3>
              <span className="text-sm font-medium text-slate-700">{calculateProgress()}%</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2.5">
              <div 
                className="bg-blue-600 h-2.5 rounded-full" 
                style={{ width: `${calculateProgress()}%` }}
              ></div>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white rounded-xl font-medium transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Saving...</span>
                </>
              ) : (
                <span>Save Inspection</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}