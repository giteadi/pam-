"use client"

import { useState, useEffect } from "react"
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
        return "text-accent"
      case "fail":
        return "text-destructive"
      case "na":
        return "text-muted-foreground"
      default:
        return "text-muted-foreground"
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

  return (
    <div className="min-h-screen bg-background page-transition">
      {/* Header */}
      <div className="bg-card border-b border-border sticky top-0 z-10 backdrop-blur-sm bg-card/95">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-serif font-bold text-foreground">{inspection.propertyName}</h1>
              <p className="text-sm text-muted-foreground">
                Inspector: {inspection.inspectorName} • Started: {inspection.startDate}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-sm font-medium text-foreground flex items-center space-x-2">
                  <span>{progress}% Complete</span>
                  {(isAutoSaving || loading) && (
                    <div className="w-3 h-3 border border-primary/30 border-t-primary rounded-full animate-spin"></div>
                  )}
                </div>
                <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>
              <button
                onClick={handleSave}
                disabled={loading}
                className="px-4 py-2 bg-secondary hover:bg-secondary/90 text-secondary-foreground rounded-lg transition-colors disabled:opacity-50"
              >
                Save
              </button>
              <button
                onClick={handleComplete}
                disabled={loading}
                className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-colors disabled:opacity-50"
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
            <div key={categoryIndex} className="bg-card border border-border rounded-xl overflow-hidden">
              <button
                onClick={() => toggleCategory(categoryIndex)}
                className="w-full px-6 py-4 bg-muted/50 hover:bg-muted/70 transition-all duration-200 flex items-center justify-between"
              >
                <h3 className="text-lg font-serif font-semibold text-foreground">{category.category}</h3>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-muted-foreground">
                    {category.items.filter((item) => checklist[item.id]).length} / {category.items.length}
                  </span>
                  <svg
                    className={`w-5 h-5 text-muted-foreground transition-transform duration-200 ${
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
                    <div key={item.id} className="border border-border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-start space-x-3">
                          {item.required && (
                            <span className="text-xs bg-destructive/10 text-destructive px-2 py-1 rounded-full">
                              Required
                            </span>
                          )}
                          <div>
                            <p className="font-medium text-foreground">{item.text}</p>
                          </div>
                        </div>
                        <div className={`${getStatusColor(getItemStatus(item.id))}`}>
                          {getStatusIcon(getItemStatus(item.id))}
                        </div>
                      </div>

                      {/* Status Buttons */}
                      <div className="flex items-center space-x-2 mb-3">
                        {[
                          { status: "pass", label: "Pass", color: "accent" },
                          { status: "fail", label: "Fail", color: "destructive" },
                          { status: "na", label: "N/A", color: "muted" },
                        ].map(({ status, label, color }) => (
                          <button
                            key={status}
                            onClick={() => handleItemChange(item.id, status, getItemComment(item.id))}
                            disabled={loading}
                            className={`px-3 py-1 rounded-lg text-sm font-medium transition-all duration-200 disabled:opacity-50 ${
                              getItemStatus(item.id) === status
                                ? `bg-${color} text-${color === "muted" ? "foreground" : color + "-foreground"}`
                                : `bg-muted text-muted-foreground hover:bg-${color}/10 hover:text-${color}`
                            }`}
                          >
                            {label}
                          </button>
                        ))}
                        {getItemStatus(item.id) !== "unchecked" && (
                          <button
                            onClick={() => handleItemChange(item.id, "unchecked")}
                            disabled={loading}
                            className="px-3 py-1 rounded-lg text-sm font-medium bg-muted text-muted-foreground hover:bg-muted/70 transition-all duration-200 disabled:opacity-50"
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
                        className="w-full px-3 py-2 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-colors text-sm"
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
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="px-6 py-4 bg-muted/50 flex items-center justify-between">
              <h3 className="text-lg font-serif font-semibold text-foreground">Custom Amenities</h3>
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
                    Add property-specific amenities discovered during inspection
                  </p>
                </div>
              )}

              {/* Custom Amenities List */}
              {customAmenities.length > 0 ? (
                <div className="space-y-3">
                  {customAmenities.map((amenity, index) => (
                    <div key={amenity.id} className="border border-border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-start space-x-3">
                          <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">Custom</span>
                          <div className="flex-1">
                            <p className="font-medium text-foreground">{amenity.text}</p>
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
                      <div className="flex items-center space-x-2 mb-3">
                        {[
                          { status: "pass", label: "Pass", color: "accent" },
                          { status: "fail", label: "Fail", color: "destructive" },
                          { status: "na", label: "N/A", color: "muted" },
                        ].map(({ status, label, color }) => (
                          <button
                            key={status}
                            onClick={() => handleItemChange(amenity.id, status, getItemComment(amenity.id))}
                            disabled={loading}
                            className={`px-3 py-1 rounded-lg text-sm font-medium transition-all duration-200 disabled:opacity-50 ${
                              getItemStatus(amenity.id) === status
                                ? `bg-${color} text-${color === "muted" ? "foreground" : color + "-foreground"}`
                                : `bg-muted text-muted-foreground hover:bg-${color}/10 hover:text-${color}`
                            }`}
                          >
                            {label}
                          </button>
                        ))}
                        {getItemStatus(amenity.id) !== "unchecked" && (
                          <button
                            onClick={() => handleItemChange(amenity.id, "unchecked")}
                            disabled={loading}
                            className="px-3 py-1 rounded-lg text-sm font-medium bg-muted text-muted-foreground hover:bg-muted/70 transition-all duration-200 disabled:opacity-50"
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
                        className="w-full px-3 py-2 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-colors text-sm"
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
                  <p className="text-sm">Click "Add Custom" to add property-specific amenities</p>
                </div>
              )}
            </div>
          </div>

          {/* General Notes */}
          <div className="bg-card border border-border rounded-xl p-6">
            <h3 className="text-lg font-serif font-semibold text-foreground mb-4">General Notes</h3>
            <textarea
              value={notes}
              onChange={(e) => {
                console.log("[v0] General notes change:", e.target.value)
                setNotes(e.target.value)
              }}
              placeholder="Add general inspection notes, observations, or recommendations..."
              className="w-full px-4 py-3 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-colors"
              rows={4}
              disabled={loading}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
