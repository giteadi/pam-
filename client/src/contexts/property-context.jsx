"use client"

import { createContext, useContext, useState, useEffect } from "react"

const PropertyContext = createContext()

export function PropertyProvider({ children }) {
  const [properties, setProperties] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Load mock properties data
    const mockProperties = [
      {
        id: 1,
        name: "Sunset Apartments",
        address: "123 Main St, Downtown",
        type: "Residential",
        units: 24,
        status: "Active",
        lastInspection: "2024-01-15",
        nextInspection: "2024-04-15",
        owner: "ABC Property Management",
        contact: "john@abcprop.com",
        createdAt: "2023-06-01",
      },
      {
        id: 2,
        name: "Commerce Plaza",
        address: "456 Business Ave, Commercial District",
        type: "Commercial",
        units: 12,
        status: "Active",
        lastInspection: "2024-02-01",
        nextInspection: "2024-05-01",
        owner: "XYZ Holdings",
        contact: "sarah@xyzholdings.com",
        createdAt: "2023-08-15",
      },
      {
        id: 3,
        name: "Green Valley Condos",
        address: "789 Valley Rd, Suburbs",
        type: "Residential",
        units: 36,
        status: "Pending",
        lastInspection: "2023-12-10",
        nextInspection: "2024-03-10",
        owner: "Valley Properties LLC",
        contact: "mike@valleyprop.com",
        createdAt: "2023-04-20",
      },
    ]

    const storedProperties = localStorage.getItem("properties")
    if (storedProperties) {
      setProperties(JSON.parse(storedProperties))
    } else {
      setProperties(mockProperties)
      localStorage.setItem("properties", JSON.stringify(mockProperties))
    }
    setLoading(false)
  }, [])

  const addProperty = (propertyData) => {
    const newProperty = {
      ...propertyData,
      id: Date.now(),
      createdAt: new Date().toISOString().split("T")[0],
      status: "Active",
    }
    const updatedProperties = [...properties, newProperty]
    setProperties(updatedProperties)
    localStorage.setItem("properties", JSON.stringify(updatedProperties))
  }

  const updateProperty = (id, propertyData) => {
    const updatedProperties = properties.map((prop) => (prop.id === id ? { ...prop, ...propertyData } : prop))
    setProperties(updatedProperties)
    localStorage.setItem("properties", JSON.stringify(updatedProperties))
  }

  const deleteProperty = (id) => {
    const updatedProperties = properties.filter((prop) => prop.id !== id)
    setProperties(updatedProperties)
    localStorage.setItem("properties", JSON.stringify(updatedProperties))
  }

  const getProperty = (id) => {
    return properties.find((prop) => prop.id === Number.parseInt(id))
  }

  return (
    <PropertyContext.Provider
      value={{
        properties,
        loading,
        addProperty,
        updateProperty,
        deleteProperty,
        getProperty,
      }}
    >
      {children}
    </PropertyContext.Provider>
  )
}

export const useProperties = () => {
  const context = useContext(PropertyContext)
  if (!context) {
    throw new Error("useProperties must be used within a PropertyProvider")
  }
  return context
}

