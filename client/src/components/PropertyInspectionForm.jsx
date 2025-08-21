"use client"

import { useState, useEffect } from "react"
import { useDispatch } from "react-redux"
import { updateInspection } from "../redux/slices/inspectionSlice"

export default function PropertyInspectionForm({ property, inspections, onClose }) {
  const dispatch = useDispatch()
  
  // Find the inspection for this property
  const propertyInspection = inspections?.find(insp => insp.property_id === property?.id) || null
  
  const [notes, setNotes] = useState(propertyInspection?.notes || "")
  const [amenities, setAmenities] = useState({
    cooler: false,
    ac: false,
    lighting: false,
    plumbing: false,
    electrical: false,
    security: false
  })
  const [customAmenities, setCustomAmenities] = useState([])
  const [newAmenity, setNewAmenity] = useState({ name: "", status: false, message: "" })
  const [progress, setProgress] = useState(propertyInspection?.progress || 0)
  
  // Parse existing inspection data if available
  useEffect(() => {
    if (propertyInspection?.notes) {
      setNotes(propertyInspection.notes)
    }
    
    // Try to parse existing amenities data from notes or other fields
    try {
      if (propertyInspection?.inspection_items) {
        const items = propertyInspection.inspection_items
        // Set standard amenities
        const standardAmenities = {}
        const customItems = []
        
        items.forEach(item => {
          if (['cooler', 'ac', 'lighting', 'plumbing', 'electrical', 'security'].includes(item.name.toLowerCase())) {
            standardAmenities[item.name.toLowerCase()] = item.status === 'working'
          } else {
            customItems.push({
              name: item.name,
              status: item.status === 'working',
              message: item.notes || ''
            })
          }
        })
        
        if (Object.keys(standardAmenities).length > 0) {
          setAmenities({ ...amenities, ...standardAmenities })
        }
        
        if (customItems.length > 0) {
          setCustomAmenities(customItems)
        }
      }
    } catch (error) {
      console.error("Error parsing inspection data:", error)
    }
  }, [propertyInspection])
  
  // Calculate progress whenever amenities change
  useEffect(() => {
    const standardAmenitiesCount = Object.keys(amenities).length
    const checkedStandardCount = Object.values(amenities).filter(Boolean).length
    const customAmenitiesCount = customAmenities.length
    const checkedCustomCount = customAmenities.filter(item => item.status).length
    
    const totalItems = standardAmenitiesCount + customAmenitiesCount
    const totalChecked = checkedStandardCount + checkedCustomCount
    
    const calculatedProgress = totalItems > 0 ? Math.round((totalChecked / totalItems) * 100) : 0
    setProgress(calculatedProgress)
  }, [amenities, customAmenities])
  
  const handleAmenityChange = (name) => {
    setAmenities(prev => ({
      ...prev,
      [name]: !prev[name]
    }))
  }
  
  const handleCustomAmenityChange = (index, field, value) => {
    setCustomAmenities(prev => {
      const updated = [...prev]
      updated[index] = { ...updated[index], [field]: value }
      return updated
    })
  }
  
  const addCustomAmenity = () => {
    if (newAmenity.name.trim()) {
      setCustomAmenities(prev => [...prev, { ...newAmenity }])
      setNewAmenity({ name: "", status: false, message: "" })
    }
  }
  
  const removeCustomAmenity = (index) => {
    setCustomAmenities(prev => prev.filter((_, i) => i !== index))
  }
  
  const handleSave = () => {
    if (!propertyInspection) return
    
    // Prepare inspection items from amenities
    const standardItems = Object.entries(amenities).map(([name, status]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      status: status ? 'working' : 'not_working',
      notes: ''
    }))
    
    const customItems = customAmenities.map(item => ({
      name: item.name,
      status: item.status ? 'working' : 'not_working',
      notes: item.message
    }))
    
    const inspectionItems = [...standardItems, ...customItems]
    
    // Update inspection
    dispatch(updateInspection({
      id: propertyInspection.id,
      data: {
        notes,
        progress,
        inspection_items: inspectionItems
      }
    }))
    
    onClose()
  }
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-slate-800">Inspect Property</h2>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-slate-700 mb-2">{property?.name}</h3>
            <p className="text-slate-600">{property?.address}</p>
            <div className="mt-2 flex items-center">
              <div className="w-full bg-slate-200 rounded-full h-2.5">
                <div 
                  className="bg-green-600 h-2.5 rounded-full" 
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <span className="ml-2 text-sm font-medium text-slate-700">{progress}%</span>
            </div>
          </div>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 mb-2">Inspection Notes</label>
            <div className="mb-2 text-sm text-slate-600">Add notes line by line for better visibility</div>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows="3"
              placeholder="Add general notes about this property inspection"
            ></textarea>
            {notes && (
              <div className="mt-4">
                <h4 className="font-semibold text-slate-700 mb-2">Notes Preview</h4>
                <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                  {notes.split('\n').map((note, index) => (
                    <p key={index} className="text-slate-900 py-1 border-b border-slate-100 last:border-0">
                      {note || ' '}
                    </p>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-slate-700 mb-4">Standard Amenities</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(amenities).map(([name, checked]) => (
                <div key={name} className="flex items-center space-x-3 p-3 border border-slate-200 rounded-lg">
                  <input
                    type="checkbox"
                    id={`amenity-${name}`}
                    checked={checked}
                    onChange={() => handleAmenityChange(name)}
                    className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <label htmlFor={`amenity-${name}`} className="text-slate-700 capitalize">{name}</label>
                </div>
              ))}
            </div>
          </div>
          
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-slate-700 mb-4">Custom Amenities</h3>
            
            {customAmenities.map((item, index) => (
              <div key={index} className="mb-4 p-4 border border-slate-200 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={item.status}
                      onChange={() => handleCustomAmenityChange(index, 'status', !item.status)}
                      className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <span className="font-medium text-slate-700">{item.name}</span>
                  </div>
                  <button
                    onClick={() => removeCustomAmenity(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
                <textarea
                  value={item.message}
                  onChange={(e) => handleCustomAmenityChange(index, 'message', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows="2"
                  placeholder="Add notes about this amenity"
                ></textarea>
              </div>
            ))}
            
            <div className="mt-4 p-4 border border-dashed border-slate-300 rounded-lg">
              <div className="flex items-center space-x-2 mb-3">
                <input
                  type="text"
                  value={newAmenity.name}
                  onChange={(e) => setNewAmenity({ ...newAmenity, name: e.target.value })}
                  className="flex-1 px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="New amenity name"
                />
                <button
                  onClick={addCustomAmenity}
                  disabled={!newAmenity.name.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add
                </button>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 text-slate-700 rounded-md hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            >
              Save Inspection
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}