"use client"

import { useState, useEffect, useRef } from "react"
import { useDispatch, useSelector } from "react-redux"
import { updateChecklistItem } from "../redux/slices/inspectionSlice"

export default function InspectionChecklist({ inspection, onSave, onComplete }) {
  const dispatch = useDispatch()
  const { loading } = useSelector((state) => state.inspections)

  const [checklist, setChecklist] = useState(inspection.checklist || {})
  const [notes, setNotes] = useState(inspection.notes || "")
  const [expandedCategories, setExpandedCategories] = useState({})
  const [isAutoSaving, setIsAutoSaving] = useState(false)
  const [customAmenities, setCustomAmenities] = useState(inspection.customAmenities || [])
  const [newCustomAmenity, setNewCustomAmenity] = useState("")
  const [showCustomAmenityInput, setShowCustomAmenityInput] = useState(false)
  const [photos, setPhotos] = useState(inspection.photos || [])
  const [showCamera, setShowCamera] = useState(false)
  const [currentLocation, setCurrentLocation] = useState(inspection.location || null)
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const [stream, setStream] = useState(null)
  const [uploading, setUploading] = useState(false)

  // Mock template - in real app this would come from Redux or API
  const template = [
    {
      category: "Exterior",
      items: [
        { id: "ext_1", text: "Building structure is sound", required: true },
        { id: "ext_2", text: "Roof condition is acceptable", required: true },
        { id: "ext_3", text: "Windows and doors function properly", required: false },
        { id: "ext_4", text: "Exterior lighting is adequate", required: false },
      ],
    },
    {
      category: "Interior",
      items: [
        { id: "int_1", text: "Flooring is in good condition", required: true },
        { id: "int_2", text: "Walls and ceilings are intact", required: true },
        { id: "int_3", text: "Electrical systems are functional", required: true },
        { id: "int_4", text: "Plumbing systems work properly", required: true },
      ],
    },
    {
      category: "Safety",
      items: [
        { id: "saf_1", text: "Fire safety equipment is present", required: true },
        { id: "saf_2", text: "Emergency exits are clearly marked", required: true },
        { id: "saf_3", text: "Security systems are operational", required: false },
      ],
    },
  ]

  const calculateProgress = () => {
    const totalItems = template.reduce((acc, category) => acc + category.items.length, 0) + customAmenities.length
    const completedItems = Object.keys(checklist).length
    return totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0
  }

  const progress = calculateProgress()

  useEffect(() => {
    const interval = setInterval(() => {
      handleAutoSave()
    }, 30000)

    return () => clearInterval(interval)
  }, [checklist, notes])

  const handleAutoSave = async () => {
    setIsAutoSaving(true)
    const updatedProgress = calculateProgress()
    onSave({
      checklist,
      notes,
      customAmenities,
      progress: updatedProgress,
      photos,
      location: currentLocation,
    })
    await new Promise((resolve) => setTimeout(resolve, 500))
    setIsAutoSaving(false)
  }

  const handleItemChange = async (itemId, status, comment = "") => {
    console.log("[v0] handleItemChange called:", { itemId, status, comment })
    const newChecklist = { ...checklist }

    if (status === "unchecked" && !comment) {
      delete newChecklist[itemId]
    } else {
      newChecklist[itemId] = {
        status: status === "unchecked" ? "pending" : status,
        comment,
        timestamp: new Date().toISOString(),
      }
    }

    console.log("[v0] Updated checklist:", newChecklist)
    setChecklist(newChecklist)

    try {
      await dispatch(
        updateChecklistItem({
          inspectionId: inspection.id,
          itemId,
          status: status === "unchecked" ? "pending" : status,
          comment,
        }),
      ).unwrap()
    } catch (err) {
      console.error("Failed to update checklist item:", err)
    }
  }

  const handleSave = () => {
    const updatedProgress = calculateProgress()
    onSave({
      checklist,
      notes,
      customAmenities,
      progress: updatedProgress,
      photos,
      location: currentLocation,
    })
  }

  const handleComplete = () => {
    const updatedProgress = calculateProgress()
    onComplete({
      checklist,
      notes,
      customAmenities,
      progress: updatedProgress,
      status: "completed",
      completedDate: new Date().toISOString().split("T")[0],
      photos,
      location: currentLocation,
    })
  }

  const toggleCategory = (categoryIndex) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [categoryIndex]: !prev[categoryIndex],
    }))
  }

  const getItemStatus = (itemId) => {
    const status = checklist[itemId]?.status || "unchecked"
    return status === "pending" ? "unchecked" : status
  }

  const getItemComment = (itemId) => {
    return checklist[itemId]?.comment || ""
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "pass":
        return "text-emerald-600"
      case "fail":
        return "text-red-600"
      case "na":
        return "text-slate-500"
      default:
        return "text-slate-400"
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case "pass":
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        )
      case "fail":
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        )
      case "na":
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
          </svg>
        )
      default:
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        )
    }
  }

  const handleAddCustomAmenity = () => {
    if (newCustomAmenity.trim()) {
      const customAmenityId = `custom_${Date.now()}`
      const newAmenity = {
        id: customAmenityId,
        text: newCustomAmenity.trim(),
        isCustom: true,
      }
      setCustomAmenities([...customAmenities, newAmenity])
      setNewCustomAmenity("")
      setShowCustomAmenityInput(false)
      console.log("[v0] Added custom amenity:", newAmenity)
    }
  }

  const handleRemoveCustomAmenity = (amenityId) => {
    setCustomAmenities(customAmenities.filter((amenity) => amenity.id !== amenityId))
    const newChecklist = { ...checklist }
    delete newChecklist[amenityId]
    setChecklist(newChecklist)
    console.log("[v0] Removed custom amenity:", amenityId)
  }

  // Photo capture functions
  const startCamera = async () => {
    try {
      // Get location first
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setCurrentLocation({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              timestamp: new Date().toISOString(),
            })
          },
          (error) => {
            console.error("Error getting location:", error)
          }
        )
      }

      // Then start camera
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true })
      setStream(mediaStream)
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
      }
      setShowCamera(true)
    } catch (error) {
      console.error("Error accessing camera:", error)
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
      
      // Set canvas dimensions to match video
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      
      // Draw the current video frame to the canvas
      context.drawImage(video, 0, 0, canvas.width, canvas.height)
      
      // Convert canvas to data URL
      const photoDataUrl = canvas.toDataURL('image/jpeg')
      
      // Upload to Cloudinary
      uploadToCloudinary(photoDataUrl)
    }
  }

  const uploadToCloudinary = async (dataUrl) => {
    try {
      setUploading(true)
      
      // Convert data URL to blob
      const response = await fetch(dataUrl)
      const blob = await response.blob()
      
      // Create form data for upload
      const formData = new FormData()
      formData.append('file', blob, 'inspection-photo.jpg')
      formData.append('inspectionId', inspection.id)
      
      // Send to server
      const BASE_URL = "http://localhost:4000";
      const uploadUrl = `${BASE_URL}/api/upload-photo`;
      const uploadResponse = await fetch(uploadUrl, {
        method: 'POST',
        body: formData,
      })
      
      if (!uploadResponse.ok) {
        throw new Error('Failed to upload photo')
      }
      
      const result = await uploadResponse.json()
      
      // Add the new photo to the photos array
      const newPhoto = {
        id: `photo_${Date.now()}`,
        url: result.url,
        timestamp: new Date().toISOString(),
        location: currentLocation,
      }
      
      setPhotos([...photos, newPhoto])
      setUploading(false)
      
      // Auto-save after adding a photo
      handleAutoSave()
      
    } catch (error) {
      console.error('Error uploading photo:', error)
      setUploading(false)
    }
  }

  const removePhoto = (photoId) => {
    setPhotos(photos.filter(photo => photo.id !== photoId))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-800">{inspection.propertyName}</h1>
              <p className="text-sm text-slate-600 mt-1">
                Site Supervisor: <span className="font-medium">{inspection.inspector_name || inspection.inspectorName}</span> • Started:{" "}
                <span className="font-medium">{inspection.startDate}</span>
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-sm font-semibold text-slate-700 flex items-center space-x-2">
                  <span>{progress}% Complete</span>
                  {(isAutoSaving || loading) && (
                    <div className="w-4 h-4 border-2 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
                  )}
                </div>
                <div className="w-32 h-3 bg-slate-200 rounded-full overflow-hidden mt-1">
                  <div
                    className="h-full bg-gradient-to-r from-blue-400 to-blue-500 transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>
              <button
                onClick={handleSave}
                disabled={loading}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium transition-all duration-200 disabled:opacity-50"
              >
                Save
              </button>
              <button
                onClick={handleComplete}
                disabled={loading}
                className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-xl font-medium transition-all duration-200 disabled:opacity-50 shadow-lg"
              >
                Complete
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Checklist Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {template.map((category, categoryIndex) => (
            <div key={categoryIndex} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
              <button
                onClick={() => toggleCategory(categoryIndex)}
                className="w-full px-6 py-5 bg-gradient-to-r from-slate-50 to-slate-100 hover:from-slate-100 hover:to-slate-200 transition-all duration-200 flex items-center justify-between"
              >
                <h3 className="text-xl font-bold text-slate-800">{category.category}</h3>
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-slate-600 font-medium bg-white px-3 py-1 rounded-full">
                    {category.items.filter((item) => checklist[item.id]).length} / {category.items.length}
                  </span>
                  <svg
                    className={`w-5 h-5 text-slate-500 transition-transform duration-200 ${
                      expandedCategories[categoryIndex] ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>

              {expandedCategories[categoryIndex] !== false && (
                <div className="p-6 space-y-4">
                  {category.items.map((item, itemIndex) => (
                    <div
                      key={item.id}
                      className="border border-slate-200 rounded-xl p-5 bg-slate-50 hover:bg-white transition-all duration-200"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start space-x-3">
                          {item.required && (
                            <span className="text-xs bg-red-100 text-red-700 px-3 py-1 rounded-full font-semibold border border-red-200">
                              Required
                            </span>
                          )}
                          <div>
                            <p className="font-semibold text-slate-800">{item.text}</p>
                          </div>
                        </div>
                        <div className={`${getStatusColor(getItemStatus(item.id))}`}>
                          {getStatusIcon(getItemStatus(item.id))}
                        </div>
                      </div>

                      {/* Status Buttons */}
                      <div className="flex items-center space-x-2 mb-4">
                        {[
                          { status: "pass", label: "Pass", color: "emerald" },
                          { status: "fail", label: "Fail", color: "red" },
                          { status: "na", label: "N/A", color: "slate" },
                        ].map(({ status, label, color }) => (
                          <button
                            key={status}
                            onClick={() => handleItemChange(item.id, status, getItemComment(item.id))}
                            disabled={loading}
                            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 disabled:opacity-50 ${
                              getItemStatus(item.id) === status
                                ? `bg-${color}-500 text-white shadow-lg`
                                : `bg-${color}-100 text-${color}-700 hover:bg-${color}-200 border border-${color}-200`
                            }`}
                          >
                            {label}
                          </button>
                        ))}
                        {getItemStatus(item.id) !== "unchecked" && (
                          <button
                            onClick={() => handleItemChange(item.id, "unchecked")}
                            disabled={loading}
                            className="px-4 py-2 rounded-xl text-sm font-semibold bg-slate-100 text-slate-600 hover:bg-slate-200 transition-all duration-200 disabled:opacity-50 border border-slate-200"
                          >
                            Clear
                          </button>
                        )}
                      </div>

                      {/* Comment Field */}
                      <textarea
                        value={getItemComment(item.id)}
                        onChange={(e) => {
                          console.log("[v0] Checklist comment change:", e.target.value)
                          handleItemChange(item.id, getItemStatus(item.id), e.target.value)
                        }}
                        placeholder="Add comments or notes..."
                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
                        rows={2}
                        disabled={loading}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* Custom Amenities Section */}
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="px-6 py-4 bg-gradient-to-r from-slate-50 to-slate-100 flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-800">Custom Amenities</h3>
              <button
                onClick={() => setShowCustomAmenityInput(!showCustomAmenityInput)}
                className="px-3 py-1 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg text-sm font-medium transition-colors"
              >
                {showCustomAmenityInput ? "Cancel" : "Add Custom"}
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Custom Amenity Input */}
              {showCustomAmenityInput && (
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                  <div className="flex items-center space-x-3">
                    <input
                      type="text"
                      value={newCustomAmenity}
                      onChange={(e) => {
                        console.log("[v0] Custom amenity input change:", e.target.value)
                        setNewCustomAmenity(e.target.value)
                      }}
                      placeholder="Enter custom amenity (e.g., Wine Cellar, Elevator, Solar Panels)"
                      className="flex-1 px-3 py-2 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-colors text-sm"
                      onKeyPress={(e) => e.key === "Enter" && handleAddCustomAmenity()}
                    />
                    <button
                      onClick={handleAddCustomAmenity}
                      disabled={!newCustomAmenity.trim()}
                      className="px-4 py-2 bg-primary hover:bg-primary/90 disabled:bg-muted disabled:text-muted-foreground text-primary-foreground rounded-lg text-sm font-medium transition-colors"
                    >
                      Add
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Add site-specific amenities discovered during inspection
                  </p>
                </div>
              )}

              {/* Custom Amenities List */}
              {customAmenities.length > 0 ? (
                <div className="space-y-3">
                  {customAmenities.map((amenity, index) => (
                    <div
                      key={amenity.id}
                      className="border border-slate-200 rounded-lg p-5 bg-slate-50 hover:bg-white transition-all duration-200"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start space-x-3">
                          <span className="text-xs bg-primary/10 text-primary px-3 py-1 rounded-full font-semibold border border-primary-200">
                            Custom
                          </span>
                          <div className="flex-1">
                            <p className="font-semibold text-slate-800">{amenity.text}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className={`${getStatusColor(getItemStatus(amenity.id))}`}>
                            {getStatusIcon(getItemStatus(amenity.id))}
                          </div>
                          <button
                            onClick={() => handleRemoveCustomAmenity(amenity.id)}
                            className="text-muted-foreground hover:text-destructive transition-colors duration-200"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                          </button>
                        </div>
                      </div>

                      {/* Status Buttons */}
                      <div className="flex items-center space-x-2 mb-4">
                        {[
                          { status: "pass", label: "Pass", color: "emerald" },
                          { status: "fail", label: "Fail", color: "red" },
                          { status: "na", label: "N/A", color: "slate" },
                        ].map(({ status, label, color }) => (
                          <button
                            key={status}
                            onClick={() => handleItemChange(amenity.id, status, getItemComment(amenity.id))}
                            disabled={loading}
                            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 disabled:opacity-50 ${
                              getItemStatus(amenity.id) === status
                                ? `bg-${color}-500 text-white shadow-lg`
                                : `bg-${color}-100 text-${color}-700 hover:bg-${color}-200 border border-${color}-200`
                            }`}
                          >
                            {label}
                          </button>
                        ))}
                        {getItemStatus(amenity.id) !== "unchecked" && (
                          <button
                            onClick={() => handleItemChange(amenity.id, "unchecked")}
                            disabled={loading}
                            className="px-4 py-2 rounded-xl text-sm font-semibold bg-slate-100 text-slate-600 hover:bg-slate-200 transition-all duration-200 disabled:opacity-50 border border-slate-200"
                          >
                            Clear
                          </button>
                        )}
                      </div>

                      {/* Comment Field */}
                      <textarea
                        value={getItemComment(amenity.id)}
                        onChange={(e) => {
                          console.log("[v0] Custom amenity comment change:", e.target.value)
                          handleItemChange(amenity.id, getItemStatus(amenity.id), e.target.value)
                        }}
                        placeholder="Add comments about this custom amenity..."
                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
                        rows={2}
                        disabled={loading}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <svg
                    className="w-12 h-12 mx-auto mb-3 opacity-50"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <p>No custom amenities added yet</p>
                  <p className="text-sm">Click "Add Custom" to add site-specific amenities</p>
                </div>
              )}
            </div>
          </div>

          {/* General Notes */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h3 className="text-xl font-bold text-slate-800 mb-4">General Notes</h3>
            <div className="mb-2 text-sm text-slate-600">Add notes line by line for better visibility</div>
            <textarea
              value={notes}
              onChange={(e) => {
                console.log("[v0] General notes change:", e.target.value)
                setNotes(e.target.value)
              }}
              placeholder="Add general inspection notes, observations, or recommendations..."
              className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              rows={5}
              disabled={loading}
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

          {/* Photo Documentation */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-slate-800">Photo Documentation</h3>
              <button
                onClick={showCamera ? stopCamera : startCamera}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${showCamera 
                  ? 'bg-red-500 text-white shadow-lg' 
                  : 'bg-blue-500 text-white hover:bg-blue-600 shadow-lg'}`}
                disabled={loading || uploading}
              >
                {showCamera ? 'Close Camera' : 'Take Photo'}
              </button>
            </div>

            {/* Camera View */}
            {showCamera && (
              <div className="mb-6 bg-slate-900 rounded-xl p-4 relative">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full rounded-lg shadow-lg"
                />
                <canvas ref={canvasRef} className="hidden" />
                <div className="mt-4 flex justify-center">
                  <button
                    onClick={capturePhoto}
                    className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-medium transition-all duration-200 shadow-lg flex items-center space-x-2"
                    disabled={uploading}
                  >
                    {uploading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Uploading...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span>Capture Photo</span>
                      </>
                    )}
                  </button>
                </div>
                {currentLocation && (
                  <div className="mt-2 text-xs text-slate-300 text-center">
                    <p>Location: {currentLocation.latitude.toFixed(6)}, {currentLocation.longitude.toFixed(6)}</p>
                  </div>
                )}
              </div>
            )}

            {/* Photos Gallery */}
            <div className="mt-4">
              {photos.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {photos.map((photo) => (
                    <div key={photo.id} className="relative group">
                      <img
                        src={photo.url}
                        alt="Inspection photo"
                        className="w-full h-48 object-cover rounded-lg shadow-md"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200 rounded-lg flex items-center justify-center">
                        <button
                          onClick={() => removePhoto(photo.id)}
                          className="opacity-0 group-hover:opacity-100 p-2 bg-red-500 text-white rounded-full transition-all duration-200"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                      <div className="mt-1 text-xs text-slate-500">
                        <p>{new Date(photo.timestamp).toLocaleString()}</p>
                        {photo.location && (
                          <p className="truncate">GPS: {photo.location.latitude.toFixed(6)}, {photo.location.longitude.toFixed(6)}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground bg-slate-50 rounded-lg border border-dashed border-slate-200">
                  <svg
                    className="w-12 h-12 mx-auto mb-3 opacity-50"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <p>No photos added yet</p>
                  <p className="text-sm">Click "Take Photo" to capture site documentation</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
