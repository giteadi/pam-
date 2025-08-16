"use client"

import { createContext, useContext, useState, useEffect } from "react"

const InspectionContext = createContext()

export function InspectionProvider({ children }) {
  const [inspections, setInspections] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Load mock inspections data
    const mockInspections = [
      {
        id: 1,
        propertyId: 1,
        propertyName: "Sunset Apartments",
        propertyType: "Residential",
        inspectorName: "Jane Smith",
        startDate: "2024-01-15",
        completedDate: "2024-01-15",
        status: "completed",
        progress: 100,
        checklist: {},
        notes: "Property in good condition overall.",
      },
      {
        id: 2,
        propertyId: 2,
        propertyName: "Commerce Plaza",
        propertyType: "Commercial",
        inspectorName: "Mike Johnson",
        startDate: "2024-02-01",
        completedDate: null,
        status: "in-progress",
        progress: 65,
        checklist: {},
        notes: "",
      },
    ]

    const storedInspections = localStorage.getItem("inspections")
    if (storedInspections) {
      setInspections(JSON.parse(storedInspections))
    } else {
      setInspections(mockInspections)
      localStorage.setItem("inspections", JSON.stringify(mockInspections))
    }
    setLoading(false)
  }, [])

  const createInspection = (propertyId, propertyName, propertyType, inspectorName) => {
    const newInspection = {
      id: Date.now(),
      propertyId,
      propertyName,
      propertyType,
      inspectorName,
      startDate: new Date().toISOString().split("T")[0],
      completedDate: null,
      status: "in-progress",
      progress: 0,
      checklist: {},
      notes: "",
    }
    const updatedInspections = [...inspections, newInspection]
    setInspections(updatedInspections)
    localStorage.setItem("inspections", JSON.stringify(updatedInspections))
    return newInspection
  }

  const updateInspection = (id, updates) => {
    const updatedInspections = inspections.map((inspection) => {
      if (inspection.id === id) {
        const updated = { ...inspection, ...updates }
        // Ensure progress is recalculated if checklist is updated
        if (updates.checklist) {
          updated.progress = calculateProgress(updates.checklist, inspection.propertyType)
        }
        return updated
      }
      return inspection
    })
    setInspections(updatedInspections)
    localStorage.setItem("inspections", JSON.stringify(updatedInspections))

    // Return the updated inspection for immediate use
    return updatedInspections.find((inspection) => inspection.id === id)
  }

  const getChecklistTemplate = (propertyType) => {
    const templates = {
      Residential: [
        {
          category: "Exterior",
          items: [
            { id: "ext_1", text: "Check roof condition and gutters", required: true },
            { id: "ext_2", text: "Inspect exterior walls and siding", required: true },
            { id: "ext_3", text: "Check windows and doors", required: true },
            { id: "ext_4", text: "Inspect walkways and driveways", required: false },
          ],
        },
        {
          category: "Interior",
          items: [
            { id: "int_1", text: "Check electrical systems", required: true },
            { id: "int_2", text: "Inspect plumbing fixtures", required: true },
            { id: "int_3", text: "Check HVAC systems", required: true },
            { id: "int_4", text: "Inspect flooring condition", required: false },
          ],
        },
      ],
      Commercial: [
        {
          category: "Safety Systems",
          items: [
            { id: "safe_1", text: "Check fire alarm systems", required: true },
            { id: "safe_2", text: "Inspect emergency exits", required: true },
            { id: "safe_3", text: "Check sprinkler systems", required: true },
            { id: "safe_4", text: "Inspect security systems", required: false },
          ],
        },
        {
          category: "Building Systems",
          items: [
            { id: "bld_1", text: "Check HVAC systems", required: true },
            { id: "bld_2", text: "Inspect electrical panels", required: true },
            { id: "bld_3", text: "Check plumbing systems", required: true },
            { id: "bld_4", text: "Inspect elevators", required: false },
          ],
        },
      ],
    }
    return templates[propertyType] || templates.Residential
  }

  const calculateProgress = (checklist, propertyType) => {
    const template = getChecklistTemplate(propertyType)
    const totalItems = template.reduce((sum, category) => sum + category.items.length, 0)
    const completedItems = Object.keys(checklist || {}).length
    return totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0
  }

  const getInspectionById = (id) => {
    return inspections.find((inspection) => inspection.id === id)
  }

  const deleteInspection = (id) => {
    const updatedInspections = inspections.filter((inspection) => inspection.id !== id)
    setInspections(updatedInspections)
    localStorage.setItem("inspections", JSON.stringify(updatedInspections))
  }

  return (
    <InspectionContext.Provider
      value={{
        inspections,
        loading,
        createInspection,
        updateInspection,
        deleteInspection,
        getInspectionById,
        getChecklistTemplate,
        calculateProgress,
      }}
    >
      {children}
    </InspectionContext.Provider>
  )
}

export const useInspections = () => {
  const context = useContext(InspectionContext)
  if (!context) {
    throw new Error("useInspections must be used within an InspectionProvider")
  }
  return context
}
