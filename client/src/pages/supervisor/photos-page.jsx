"use client"

import { useState, useEffect } from "react"
import { useSelector } from "react-redux"
import SupervisorLayout from "../../components/supervisor-layout"
import PhotoGallery from "../../components/photo-gallery"

export default function SupervisorPhotosPage() {
  const { user } = useSelector((state) => state.users)
  const [assignedProperties, setAssignedProperties] = useState([])

  // Fetch supervisor's assigned properties for filtering
  useEffect(() => {
    const fetchAssignedProperties = async () => {
      if (!user || !user.id) return

      try {
        const response = await fetch(`http://localhost:4000/api/supervisors/${user.id}/properties`)
        if (!response.ok) {
          throw new Error(`Error fetching assigned properties: ${response.status}`)
        }

        const data = await response.json()
        if (data.success) {
          setAssignedProperties(data.data)
        }
      } catch (error) {
        console.error("Error fetching assigned properties:", error)
      }
    }

    fetchAssignedProperties()
  }, [user])

  return (
    <SupervisorLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Inspection Photos</h1>
        <PhotoGallery properties={assignedProperties} />
      </div>
    </SupervisorLayout>
  )
}