"use client"

import { useState, useEffect } from "react"
import { useSelector } from "react-redux"

export default function PhotoGallery({ propertyId = null, properties = [] }) {
  const { user } = useSelector((state) => state.users)
  const [photos, setPhotos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filters, setFilters] = useState({
    property: propertyId || "",
    startDate: "",
    endDate: "",
  })

  // Check for propertyId in URL parameters on component mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const propertyIdFromUrl = urlParams.get('propertyId')
    
    if (propertyIdFromUrl) {
      console.log('PropertyId detected in URL:', propertyIdFromUrl)
      setFilters(prev => ({
        ...prev,
        property: propertyIdFromUrl
      }))
    }
  }, [])

  // Fetch photos based on filters
  useEffect(() => {
    const fetchPhotos = async () => {
      setLoading(true)
      setError(null)

      try {
        let apiUrl
        
        // If property filter is set, use the property-specific endpoint
        if (filters.property) {
          apiUrl = `http://localhost:4000/api/photos/property/${filters.property}`
          console.log("Fetching photos for specific property:", apiUrl)
        } else {
          // Otherwise use the general endpoint with query parameters
          const queryParams = new URLSearchParams()
          if (filters.startDate) queryParams.append("startDate", filters.startDate)
          if (filters.endDate) queryParams.append("endDate", filters.endDate)
          apiUrl = `http://localhost:4000/api/photos/all?${queryParams.toString()}`
          console.log("Fetching all photos with filters:", apiUrl)
        }
        
        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          credentials: 'include'
        })
        
        if (!response.ok) {
          throw new Error(`Error fetching photos: ${response.status}`)
        }

        const data = await response.json()
        console.log("Photos API response:", data)
        
        if (data.success) {
          console.log("Photos loaded successfully:", data.data.length, "photos")
          if (data.data.length > 0) {
            console.log("First photo details:", JSON.stringify(data.data[0], null, 2))
            console.log("First photo URL:", data.data[0]?.url)
            console.log("Is URL valid string?", typeof data.data[0]?.url === 'string')
          }
          setPhotos(data.data)
        } else {
          throw new Error(data.msg || "Failed to fetch photos")
        }
      } catch (err) {
        console.error("Error fetching photos:", err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchPhotos()
  }, [filters])

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target
    setFilters(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // Format date for display
  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit'
    }
    return new Date(dateString).toLocaleDateString(undefined, options)
  }

  // Debug function to check image loading
  const testImageLoad = (url) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
      img.src = url;
    });
  };

  // Test image loading on component mount
  useEffect(() => {
    const testImages = async () => {
      try {
        const testUrl1 = 'https://res.cloudinary.com/bazeercloud/image/upload/v1755852661/inspection-photos/ctu3qs33rftaapct1ume.jpg';
        const testUrl2 = 'https://res.cloudinary.com/bazeercloud/image/upload/v1755852659/inspection-photos/at8fdyipvbtxwfvgkeir.jpg';
        
        console.log('Testing image loading...');
        await testImageLoad(testUrl1)
          .then(() => console.log('Test image 1 preload successful'))
          .catch(err => console.error('Test image 1 preload failed:', err.message));
        
        await testImageLoad(testUrl2)
          .then(() => console.log('Test image 2 preload successful'))
          .catch(err => console.error('Test image 2 preload failed:', err.message));
      } catch (error) {
        console.error('Image testing error:', error);
      }
    };
    
    testImages();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-slate-800 mb-6">Property Inspection Photos</h1>
        
        {/* Test images directly from Cloudinary */}
        <div className="mb-4 p-4 border border-gray-200 rounded-lg">
          <h3 className="text-md font-medium mb-2">Test Images from Database</h3>
          <div className="flex flex-wrap gap-4">
            <div>
              <p className="text-sm mb-1">Image 1 (ID: 1):</p>
              <img 
                src="https://res.cloudinary.com/bazeercloud/image/upload/v1755852659/inspection-photos/at8fdyipvbtxwfvgkeir.jpg" 
                alt="Test Cloudinary Image 1"
                className="w-64 h-auto border-2 border-blue-500"
                onLoad={() => console.log("Test image 1 loaded successfully")}
                onError={(e) => {
                  console.error("Test image 1 failed to load");
                  e.target.src = "https://via.placeholder.com/400x300?text=Test+Image+Failed";
                }}
                style={{ maxHeight: '200px', objectFit: 'contain' }}
              />
            </div>
            <div>
              <p className="text-sm mb-1">Image 2 (ID: 2):</p>
              <img 
                src="https://res.cloudinary.com/bazeercloud/image/upload/v1755852661/inspection-photos/ctu3qs33rftaapct1ume.jpg" 
                alt="Test Cloudinary Image 2"
                className="w-64 h-auto border-2 border-green-500"
                onLoad={() => console.log("Test image 2 loaded successfully")}
                onError={(e) => {
                  console.error("Test image 2 failed to load");
                  e.target.src = "https://via.placeholder.com/400x300?text=Test+Image+Failed";
                }}
                style={{ maxHeight: '200px', objectFit: 'contain' }}
              />
            </div>
          </div>
          <p className="mt-4 text-sm text-red-600 font-medium">If you can see these test images but not the gallery images below, there may be an issue with how the images are being loaded from the API.</p>
        </div>
        
        {/* Filters */}
        <div className="bg-white rounded-xl p-6 shadow-sm mb-8">
          <h2 className="text-lg font-semibold text-slate-700 mb-4">Filter Photos</h2>
          
          {/* Property filter with active indicator */}
          <div className="mb-4">
            {filters.property ? (
              <div className="flex items-center justify-between bg-blue-50 p-3 rounded-lg border border-blue-200">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <span className="font-medium text-blue-700">
                    Viewing photos for property: {properties.find(p => p.id === filters.property)?.name || filters.property}
                  </span>
                </div>
                <button 
                  onClick={() => setFilters(prev => ({ ...prev, property: "" }))}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Clear Filter
                </button>
              </div>
            ) : (
              <div>
                <label htmlFor="property" className="block text-sm font-medium text-slate-700 mb-1">
                  Property
                </label>
                <select
                  id="property"
                  name="property"
                  value={filters.property}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">All Properties</option>
                  {properties.map((property) => (
                    <option key={property.id} value={property.id}>
                      {property.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
          
          {/* Date filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-slate-700 mb-1">
                From Date
              </label>
              <input
                type="date"
                id="startDate"
                name="startDate"
                value={filters.startDate}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-slate-700 mb-1">
                To Date
              </label>
              <input
                type="date"
                id="endDate"
                name="endDate"
                value={filters.endDate}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
          
          {/* Active filters summary */}
          {(filters.startDate || filters.endDate) && (
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
              <div className="text-sm text-slate-600">
                <span className="font-medium">Active Filters:</span>
                {filters.startDate && <span className="ml-2">From {filters.startDate}</span>}
                {filters.endDate && <span className="ml-2">To {filters.endDate}</span>}
              </div>
              <button 
                onClick={() => setFilters(prev => ({ ...prev, startDate: "", endDate: "" }))}
                className="text-slate-600 hover:text-slate-800 text-xs font-medium"
              >
                Clear Dates
              </button>
            </div>
          )}
        </div>

        {/* Loading and Error States */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Photo Gallery */}
        {!loading && !error && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-slate-800">
                {photos.length} {photos.length === 1 ? "Photo" : "Photos"} Found
              </h2>
            </div>

            {photos.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {photos.map((photo) => (
                  <div key={photo.id} className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200">
                    <div className="relative aspect-video">
                      {photo.url ? (
                        <>
                          <img 
                            src={photo.url} 
                            alt={`Property: ${photo.property.name}`}
                            className="w-full h-full object-cover"
                            onLoad={() => console.log("Image loaded successfully:", photo.url)}
                            onError={(e) => {
                              console.error("Image failed to load:", photo.url);
                              e.target.src = "https://via.placeholder.com/400x300?text=Image+Not+Available";
                            }}
                            style={{ border: '1px solid #e2e8f0', borderRadius: '4px' }}
                          />
                          <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-white p-2">
                            <div className="text-sm font-medium truncate">{photo.property.name}</div>
                            <div className="text-xs truncate">{photo.url.split('/').pop()}</div>
                          </div>
                        </>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-100">
                          <p className="text-gray-500">Image not available</p>
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-slate-800">{photo.property.name}</h3>
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                          {formatDate(photo.timestamp)}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 mb-2">{photo.property.address}</p>
                      <p className="text-xs text-slate-500">Inspector: {photo.inspector || "Not assigned"}</p>
                      
                      {photo.location && photo.location.latitude && photo.location.longitude && (
                        <div className="mt-3 pt-3 border-t border-slate-100">
                          <p className="text-xs text-slate-500 flex items-center">
                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            Location: {photo.location.latitude.toFixed(6)}, {photo.location.longitude.toFixed(6)}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-xl p-12 text-center">
                <svg className="w-16 h-16 text-slate-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-slate-500">No photos found matching your criteria.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}