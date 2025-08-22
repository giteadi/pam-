"use client"

import { useState, useEffect } from "react"
import { useSelector } from "react-redux"
import AdminLayout from "../../components/admin-layout"
import PhotoGallery from "../../components/photo-gallery"

export default function AdminPhotosPage() {
  const { user } = useSelector((state) => state.users)
  const [properties, setProperties] = useState([])

  // Fetch all properties for filtering
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const response = await fetch("http://localhost:4000/api/properties")
        if (!response.ok) {
          throw new Error(`Error fetching properties: ${response.status}`)
        }

        const data = await response.json()
        if (data.success) {
          setProperties(data.data)
        }
      } catch (error) {
        console.error("Error fetching properties:", error)
      }
    }

    fetchProperties()
  }, [])

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Inspection Photos</h1>
        <PhotoGallery properties={properties} />
      </div>
    </AdminLayout>
  )
}