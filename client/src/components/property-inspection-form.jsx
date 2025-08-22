"use client"

import { useState, useEffect, useRef } from "react"
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
  
  // Photo capture and location state
  const [photos, setPhotos] = useState([])
  const [showCamera, setShowCamera] = useState(false)
  const [currentLocation, setCurrentLocation] = useState(null)
  const [uploading, setUploading] = useState(false)
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const [stream, setStream] = useState(null)
  
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
    setUploading(true)
    
    try {
      // Find existing inspection or create new one
      const existingInspection = propertyInspections.length > 0 ? propertyInspections[0] : null
      
      if (!existingInspection) {
        console.error("No existing inspection found")
        setUploading(false)
        return
      }
      
      // Upload photos to server if there are any
      const uploadedPhotos = []
      
      if (photos.length > 0) {
        for (const photo of photos) {
          try {
            console.log("Processing photo:", photo)
            
            // Create a new Image to load the data URL
            const img = new Image()
            img.src = photo.dataUrl
            
            // Wait for the image to load
            await new Promise((resolve) => {
              img.onload = resolve
            })
            
            // Create a canvas with the same dimensions as the image
            const canvas = document.createElement('canvas')
            canvas.width = img.width
            canvas.height = img.height
            
            // Draw the image on the canvas
            const ctx = canvas.getContext('2d')
            ctx.drawImage(img, 0, 0)
            
            // Convert canvas to blob directly
            const blob = await new Promise(resolve => {
              canvas.toBlob(resolve, 'image/jpeg', 0.95)
            })
            
            console.log("Created blob:", blob)
            
            // Create FormData
            const formData = new FormData()
            formData.append('photo', blob, 'photo.jpg')
            
            if (photo.location) {
              formData.append('latitude', photo.location.latitude)
              formData.append('longitude', photo.location.longitude)
            }
            
            // Upload to server
            const BASE_URL = "http://localhost:4000";
            const uploadUrl = `${BASE_URL}/api/photos/upload/${existingInspection.id}`;
            const uploadResponse = await fetch(uploadUrl, {
              method: 'POST',
              body: formData
            })
            
            if (!uploadResponse.ok) {
              throw new Error(`Failed to upload photo: ${uploadResponse.statusText}`)
            }
            
            const uploadResult = await uploadResponse.json()
            uploadedPhotos.push(uploadResult.data)
          } catch (error) {
            console.error("Error uploading photo:", error)
          }
        }
      }
      
      // Prepare inspection data
      const inspectionData = {
        property_id: property.id,
        notes,
        checklist: {
          ...amenities,
          customAmenities
        },
        photos: uploadedPhotos,
        location: currentLocation,
        progress: calculateProgress()
      }
      
      // Update existing inspection
      await dispatch(updateInspection({
        id: existingInspection.id,
        data: inspectionData
      })).unwrap()
      
      // Call the onSave callback with the inspection data if provided
      if (typeof onSave === 'function') {
        onSave(inspectionData)
      }
      
      // Close the form
      onClose()
    } catch (error) {
      console.error("Failed to submit inspection:", error)
      alert("Failed to save inspection. Please try again.")
    } finally {
      setUploading(false)
    }
  }
  
  const calculateProgress = () => {
    const totalItems = Object.keys(amenities).length + customAmenities.length
    const checkedItems = Object.values(amenities).filter(a => a.status).length +
                         customAmenities.filter(a => a.status).length
    
    return totalItems > 0 ? Math.round((checkedItems / totalItems) * 100) : 0
  }
  
  // Camera and photo capture functions
  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true })
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
        setStream(mediaStream)
      }
      setShowCamera(true)
      // Get location when starting camera
      getCurrentLocation()
    } catch (error) {
      console.error("Error accessing camera:", error)
      alert("Unable to access camera. Please check permissions.")
    }
  }
  
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
      setStream(null)
    }
    setShowCamera(false)
  }
  
  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current
      const canvas = canvasRef.current
      const context = canvas.getContext('2d')
      
      // Set canvas dimensions to match video at full resolution
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      
      // Draw the current video frame to the canvas
      context.drawImage(video, 0, 0, canvas.width, canvas.height)
      
      // Convert canvas to data URL with high quality (0.9)
      const dataUrl = canvas.toDataURL('image/jpeg', 0.9)
      
      // Add the photo to the photos array with location and timestamp
      setPhotos(prevPhotos => [...prevPhotos, {
        id: Date.now().toString(),
        dataUrl,
        timestamp: new Date().toISOString(),
        location: currentLocation
      }])
    }
  }
  
  const removePhoto = (index) => {
    setPhotos(prev => prev.filter((_, i) => i !== index))
  }
  
  // Location tracking
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy
          })
        },
        (error) => {
          console.error("Error getting location:", error)
          alert("Unable to get your location. Please check permissions.")
        }
      )
    } else {
      alert("Geolocation is not supported by this browser.")
    }
  }
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-blue-50 to-indigo-50 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-800">Inspect Site: {property.name}</h2>
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
            <h3 className="font-bold text-slate-800 mb-3">Site Information</h3>
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
            <div className="mb-2 text-sm text-slate-600">Add notes line by line for better visibility</div>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add general notes about the site inspection..."
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 min-h-[100px]"
            />
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
          
          {/* Photo Documentation */}
          <div className="bg-slate-50 rounded-xl p-4">
            <h3 className="font-bold text-slate-800 mb-3">Photo Documentation</h3>
            
            {/* Camera controls */}
            <div className="mb-4">
              {!showCamera ? (
                <button
                  type="button"
                  onClick={startCamera}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center space-x-2 hover:bg-blue-700 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>Open Camera</span>
                </button>
              ) : (
                <div className="space-y-4">
                  <div className="relative bg-black rounded-lg overflow-hidden">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      className="w-full h-auto"
                    />
                    <canvas ref={canvasRef} className="hidden" />
                    
                    {/* Location indicator */}
                    {currentLocation && (
                      <div className="absolute bottom-2 left-2 bg-black bg-opacity-70 text-white text-xs p-2 rounded">
                        <div>Lat: {currentLocation.latitude.toFixed(6)}</div>
                        <div>Lng: {currentLocation.longitude.toFixed(6)}</div>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex space-x-2">
                    <button
                      type="button"
                      onClick={capturePhoto}
                      className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg flex items-center justify-center space-x-2 hover:bg-green-700 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Capture Photo</span>
                    </button>
                    <button
                      type="button"
                      onClick={stopCamera}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Close Camera
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            {/* Photo gallery */}
            {photos.length > 0 && (
              <div>
                <h4 className="font-medium text-slate-700 mb-2">Captured Photos ({photos.length})</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {photos.map((photo, index) => (
                    <div key={index} className="relative group">
                      <img 
                        src={photo.dataUrl} 
                        alt={`Photo ${index + 1}`} 
                        className="w-full h-32 object-cover rounded-lg border border-slate-200" 
                      />
                      <button
                        type="button"
                        onClick={() => removePhoto(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                      {photo.location && (
                        <div className="absolute bottom-1 left-1 right-1 bg-black bg-opacity-70 text-white text-xs p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="truncate">{new Date(photo.timestamp).toLocaleString()}</div>
                          <div className="truncate">GPS: {photo.location.latitude.toFixed(4)}, {photo.location.longitude.toFixed(4)}</div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
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
              disabled={uploading}
              className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium transition-colors duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploading}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white rounded-xl font-medium transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {uploading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Uploading...</span>
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