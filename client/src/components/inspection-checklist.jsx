"use client"

import { useState, useEffect } from "react"
import { useInspections } from "../contexts/inspection-context"

export default function InspectionChecklist({ inspection, onSave, onComplete }) {
  const { getChecklistTemplate, calculateProgress } = useInspections()
  const [checklist, setChecklist] = useState(inspection.checklist || {})
  const [notes, setNotes] = useState(inspection.notes || "")
  const [expandedCategories, setExpandedCategories] = useState({})
  const [isAutoSaving, setIsAutoSaving] = useState(false)

  const template = getChecklistTemplate(inspection.propertyType)
  const progress = calculateProgress(checklist, inspection.propertyType)

  useEffect(() => {
    // Auto-save every 30 seconds
    const interval = setInterval(() => {
      handleAutoSave()
    }, 30000)

    return () => clearInterval(interval)
  }, [checklist, notes])

  const handleAutoSave = async () => {
    setIsAutoSaving(true)
    const updatedProgress = calculateProgress(checklist, inspection.propertyType)
    onSave({
      checklist,
      notes,
      progress: updatedProgress,
    })
    await new Promise((resolve) => setTimeout(resolve, 500))
    setIsAutoSaving(false)
  }

  const handleItemChange = (itemId, status, comment = "") => {
    const newChecklist = { ...checklist }
    if (status === "unchecked") {
      delete newChecklist[itemId]
    } else {
      newChecklist[itemId] = {
        status,
        comment,
        timestamp: new Date().toISOString(),
      }
    }
    setChecklist(newChecklist)
  }

  const handleSave = () => {
    const updatedProgress = calculateProgress(checklist, inspection.propertyType)
    onSave({
      checklist,
      notes,
      progress: updatedProgress,
    })
  }

  const handleComplete = () => {
    const updatedProgress = calculateProgress(checklist, inspection.propertyType)
    onComplete({
      checklist,
      notes,
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
    return checklist[itemId]?.status || "unchecked"
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
                  {isAutoSaving && (
                    <div className="w-3 h-3 border border-primary/30 border-t-primary rounded-full spinner"></div>
                  )}
                </div>
                <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary progress-bar" style={{ width: `${progress}%` }}></div>
                </div>
              </div>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-secondary hover:bg-secondary/90 text-secondary-foreground rounded-lg btn-primary"
              >
                Save
              </button>
              <button
                onClick={handleComplete}
                className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg btn-primary"
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
            <div key={categoryIndex} className="bg-card border border-border rounded-xl overflow-hidden card-hover">
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
                <div className="p-6 space-y-4 height-transition">
                  {category.items.map((item, itemIndex) => (
                    <div
                      key={item.id}
                      className={`border border-border rounded-lg p-4 card-hover stagger-item`}
                      style={{ animationDelay: `${itemIndex * 0.1}s` }}
                    >
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
                        <div className={`${getStatusColor(getItemStatus(item.id))} icon-hover`}>
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
                            className={`px-3 py-1 rounded-lg text-sm font-medium transition-all duration-200 checkbox-animation ${
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
                            className="px-3 py-1 rounded-lg text-sm font-medium bg-muted text-muted-foreground hover:bg-muted/70 transition-all duration-200"
                          >
                            Clear
                          </button>
                        )}
                      </div>

                      {/* Comment Field */}
                      <textarea
                        value={getItemComment(item.id)}
                        onChange={(e) => handleItemChange(item.id, getItemStatus(item.id), e.target.value)}
                        placeholder="Add comments or notes..."
                        className="w-full px-3 py-2 bg-input border border-border rounded-lg focus-ring transition-all duration-200 text-sm hover:border-primary/50"
                        rows={2}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* General Notes */}
          <div className="bg-card border border-border rounded-xl p-6 card-hover">
            <h3 className="text-lg font-serif font-semibold text-foreground mb-4">General Notes</h3>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add general inspection notes, observations, or recommendations..."
              className="w-full px-4 py-3 bg-input border border-border rounded-lg focus-ring transition-all duration-200 hover:border-primary/50"
              rows={4}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
