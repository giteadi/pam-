"use client"

import { useState, useEffect } from "react"
import { useSelector } from "react-redux"
import ClientLayout from "../../components/client-layout"
import PhotoGallery from "../../components/photo-gallery"

export default function ClientPhotosPage() {
  const { user } = useSelector((state) => state.users)
  const [clientProperties, setClientProperties] = useState([])

  // Fetch client's properties for filtering
  useEffect(() => {
    const fetchClientProperties = async () => {
      if (!user || !user.id) return

      try {
        const response = await fetch(`http://localhost:4000/api/clients/${user.id}/properties`)
        if (!response.ok) {
          throw new Error(`Error fetching client properties: ${response.status}`)
        }

        const data = await response.json()
        if (data.success) {
          setClientProperties(data.data)
        }
      } catch (error) {
        console.error("Error fetching client properties:", error)
      }
    }

    fetchClientProperties()
  }, [user])

  return (
    <ClientLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">My Property Photos</h1>
        <PhotoGallery properties={clientProperties} />
      </div>
    </ClientLayout>
  )
}