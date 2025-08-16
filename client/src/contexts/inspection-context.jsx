"use client"

import { createContext, useContext, useState, useEffect } from "react"

const InspectionContext = createContext()

export function InspectionProvider({ children }) {
  const [inspections, setInspections] = useState([])
  const [loading, setLoading] = useState(true)

  // Checklist templates based on property type
  const checklistTemplates = {
    residential: [
      {
        category: "Exterior",
        items: [
          { id: "ext_1", text: "Roof condition and gutters", required: true },
          { id: "ext_2", text: "Siding and exterior walls", required: true },
          { id: "ext_3", text: "Windows and doors", required: true },
          { id: "ext_4", text: "Walkways and driveways", required: false },
          { id: "ext_5", text: "Landscaping and drainage", required: false },
        ],
      },
      {
        category: "Interior",
        items: [
          { id: "int_1", text: "Flooring condition", required: true },
          { id: "int_2", text: "Wall and ceiling condition", required: true },
          { id: "int_3", text: "Lighting fixtures", required: true },
          { id: "int_4", text: "Doors and hardware", required: false },
          { id: "int_5", text: "Window treatments", required: false },
        ],
      },
      {
        category: "Kitchen",
        items: [
          { id: "kit_1", text: "Appliances functionality", required: true },
          { id: "kit_2", text: "Cabinets and countertops", required: true },
          { id: "kit_3", text: "Plumbing fixtures", required: true },
          { id: "kit_4", text: "Electrical outlets", required: true },
        ],
      },
      {
        category: "Bathrooms",
        items: [
          { id: "bath_1", text: "Toilet functionality", required: true },
          { id: "bath_2", text: "Shower/tub condition", required: true },
          { id: "bath_3", text: "Sink and faucets", required: true },
          { id: "bath_4", text: "Ventilation", required: true },
          { id: "bath_5", text: "Tile and grout condition", required: false },
        ],
      },
      {
        category: "Safety & Systems",
        items: [
          { id: "safe_1", text: "Smoke detectors", required: true },
          { id: "safe_2", text: "Carbon monoxide detectors", required: true },
          { id: "safe_3", text: "HVAC system", required: true },
          { id: "safe_4", text: "Electrical panel", required: true },
          { id: "safe_5", text: "Water heater", required: true },
        ],
      },
    ],
    commercial: [
      {
        category: "Building Exterior",
        items: [
          { id: "com_ext_1", text: "Structural integrity", required: true },
          { id: "com_ext_2", text: "Parking lot condition", required: true },
          { id: "com_ext_3", text: "Signage and lighting", required: false },
          { id: "com_ext_4", text: "Loading dock areas", required: false },
        ],
      },
      {
        category: "Interior Spaces",
        items: [
          { id: "com_int_1", text: "Common areas", required: true },
          { id: "com_int_2", text: "Office spaces", required: true },
          { id: "com_int_3", text: "Restroom facilities", required: true },
          { id: "com_int_4", text: "Storage areas", required: false },
        ],
      },
      {
        category: "Safety & Compliance",
        items: [
          { id: "com_safe_1", text: "Fire safety systems", required: true },
          { id: "com_safe_2", text: "Emergency exits", required: true },
          { id: "com_safe_3", text: "ADA compliance", required: true },
          { id: "com_safe_4", text: "Security systems", required: false },
        ],
      },
      {
        category: "Mechanical Systems",
        items: [
          { id: "com_mech_1", text: "HVAC systems", required: true },
          { id: "com_mech_2", text: "Electrical systems", required: true },
          { id: "com_mech_3", text: "Plumbing systems", required: true },
          { id: "com_mech_4", text: "Elevator systems", required: false },
        ],
      },
    ],
  }

  useEffect(() => {
    // Load mock inspections data
    const mockInspections = [
      {
        id: 1,
        propertyId: 1,
        propertyName: "Sunset Apartments",
        inspectorName: "John Smith",
        status: "completed",
        startDate: "2024-01-15",
        completedDate: "2024-01-15",
        progress: 100,
        checklist: {},
        notes: "Property in excellent condition. Minor repairs needed in unit 12.",
      },
      {
        id: 2,
        propertyId: 2,
        propertyName: "Commerce Plaza",
        inspectorName: "Sarah Johnson",
        status: "in-progress",
        startDate: "2024-02-01",
        completedDate: null,
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
      propertyType: propertyType.toLowerCase(),
      inspectorName,
      status: "in-progress",
      startDate: new Date().toISOString().split("T")[0],
      completedDate: null,
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
    const updatedInspections = inspections.map((inspection) =>
      inspection.id === id ? { ...inspection, ...updates } : inspection,
    )
    setInspections(updatedInspections)
    localStorage.setItem("inspections", JSON.stringify(updatedInspections))
  }

  const getInspection = (id) => {
    return inspections.find((inspection) => inspection.id === Number.parseInt(id))
  }

  const getChecklistTemplate = (propertyType) => {
    return checklistTemplates[propertyType.toLowerCase()] || checklistTemplates.residential
  }

  const calculateProgress = (checklist, propertyType) => {
    const template = getChecklistTemplate(propertyType)
    const totalItems = template.reduce((sum, category) => sum + category.items.length, 0)
    const completedItems = Object.keys(checklist).length
    return totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0
  }

  return (
    <InspectionContext.Provider
      value={{
        inspections,
        loading,
        createInspection,
        updateInspection,
        getInspection,
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
