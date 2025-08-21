"use client"

import { useState, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { fetchProperties, createProperty, updateProperty, deleteProperty } from "../redux/slices/propertySlice"
import { fetchInspections } from "../redux/slices/inspectionSlice"
import PropertyCard from "./property-card"
import PropertyForm from "./property-form"
import PropertyInspectionForm from "./PropertyInspectionForm"

export default function PropertiesPage() {
  const dispatch = useDispatch()
  const { properties, loading, error } = useSelector((state) => state.properties)
  const { inspections } = useSelector((state) => state.inspections)
  const { user } = useSelector((state) => state.users)

  const [showForm, setShowForm] = useState(false)
  const [editingProperty, setEditingProperty] = useState(null)
  const [viewingProperty, setViewingProperty] = useState(null)
  const [inspectingProperty, setInspectingProperty] = useState(null)
  const [searchTerm, setSearchTerm] = useState("") 
  const [filterType, setFilterType] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")
  const [assignedProperties, setAssignedProperties] = useState([])

  useEffect(() => {
    dispatch(fetchProperties())
    dispatch(fetchInspections())
  }, [dispatch])
  
  // Filter properties assigned to the supervisor/inspector
 useEffect(() => {
  if (user && properties.length > 0 && inspections.length > 0) {
    console.log("User:", user);

    let filteredInspections = [];

    if (user.role === "supervisor") {
      // Match inspections where this supervisor is the inspector
      filteredInspections = inspections.filter(
        insp => insp.inspector_id === user.id || insp.inspectorId === user.id
      );
    } else if (user.role === "inspector") {
      // Match inspections assigned to this inspector
      filteredInspections = inspections.filter(
        insp =>
          insp.inspectorId === user.id ||
          insp.inspector_id === user.id
      );
    }

    console.log("Filtered inspections:", filteredInspections);

    // Collect property IDs
    const assignedPropertyIds = [
      ...new Set(filteredInspections.map(insp => insp.propertyId || insp.property_id)),
    ];
    console.log("Assigned property IDs:", assignedPropertyIds);

    // Match properties
    const assignedProps = properties.filter(
      p => assignedPropertyIds.includes(p.id) || assignedPropertyIds.includes(p.property_id)
    );
    console.log("Assigned properties:", assignedProps);

    setAssignedProperties(assignedProps);
  }
}, [user, properties, inspections]);



  const hasPermission = (permission) => {
    const userRole = user?.role
    const permissions = {
      canViewAllProperties: userRole === "admin" || userRole === "supervisor",
      canCreateProperty: userRole === "admin",
      canEditProperty: userRole === "admin",
      canDeleteProperty: userRole === "admin",
      canAssignTasks: userRole === "admin" || userRole === "supervisor",
      canPerformInspections: userRole === "admin" || userRole === "supervisor",
    }
    return permissions[permission] || false
  }

  // Use assignedProperties for supervisors, otherwise use the regular properties list
  const propertiesToFilter = user?.role === "supervisor" ? assignedProperties : properties;
  
  const filteredProperties = propertiesToFilter.filter((property) => {
    if (user?.role === "client") {
      const userFullName = user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : ""
      const hasAccess =
        property.contact === user?.email ||
        (userFullName && property.owner?.toLowerCase().includes(userFullName.toLowerCase()))
      if (!hasAccess) return false
    }

    const matchesSearch =
      property.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.address.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterType === "all" || property.type.toLowerCase() === filterType.toLowerCase()
    const matchesStatus = filterStatus === "all" || property.status.toLowerCase() === filterStatus.toLowerCase()

    return matchesSearch && matchesType && matchesStatus
  })

  const handleAddProperty = () => {
    setEditingProperty(null)
    setShowForm(true)
  }

  const handleEditProperty = (property) => {
    setEditingProperty(property)
    setShowForm(true)
  }

  const handleViewProperty = (property) => {
    setViewingProperty(property)
  }

  const handleInspectProperty = (property) => {
    setInspectingProperty(property)
  }

  const handleDeleteProperty = async (property) => {
    if (window.confirm(`Are you sure you want to delete "${property.name}"?`)) {
      try {
        await dispatch(deleteProperty(property.id)).unwrap()
      } catch (err) {
        console.error("Failed to delete property:", err)
      }
    }
  }

  const handleFormSubmit = async (formData) => {
    try {
      if (editingProperty) {
        await dispatch(updateProperty({ id: editingProperty.id, data: formData })).unwrap()
      } else {
        await dispatch(createProperty(formData)).unwrap()
      }
      setShowForm(false)
      setEditingProperty(null)
    } catch (err) {
      console.error("Failed to save property:", err)
    }
  }

  const handleFormCancel = () => {
    setShowForm(false)
    setEditingProperty(null)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                Properties
              </h1>
              <p className="text-slate-600 mt-2">
                {user?.role === "admin"
                  ? "Manage your property portfolio"
                  : user?.role === "supervisor"
                    ? "View and inspect assigned properties"
                    : "View your assigned properties"}
              </p>
            </div>
            {hasPermission("canCreateProperty") && (
              <button
                onClick={handleAddProperty}
                className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span>Add Property</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl font-medium">{error}</div>
        </div>
      )}

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white border border-slate-200 rounded-2xl p-6 mb-8 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Search */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Search Properties</label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name or address..."
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>

            {/* Type Filter */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Property Type</label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              >
                <option value="all">All Types</option>
                <option value="residential">Residential</option>
                <option value="commercial">Commercial</option>
                <option value="industrial">Industrial</option>
                <option value="mixed use">Mixed Use</option>
              </select>
            </div>

            {/* Status Filter */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
          <div className="mt-4 text-sm text-slate-600 font-medium">
            Showing {filteredProperties.length} propert{filteredProperties.length !== 1 ? "ies" : "y"}
            {!hasPermission("canViewAllProperties") && " assigned to you"}
          </div>
        </div>

        {/* Properties Grid */}
        {filteredProperties.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">No properties found</h3>
            <p className="text-muted-foreground">
              {searchTerm || filterType !== "all" || filterStatus !== "all"
                ? "Try adjusting your search or filters"
                : user?.role === "supervisor"
                  ? "No properties have been assigned to you yet"
                  : user?.role === "admin"
                    ? "Get started by adding your first property"
                    : "No properties assigned to you"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProperties.map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
                userRole={user?.role}
                onEdit={handleEditProperty}
                onView={handleViewProperty}
                onDelete={handleDeleteProperty}
                onInspect={handleInspectProperty}
                canAssignTasks={hasPermission("canAssignTasks")}
                canPerformInspections={hasPermission("canPerformInspections")}
              />
            ))}
          </div>
        )}
      </div>

      {/* Property Form Modal */}
      {showForm && <PropertyForm property={editingProperty} onSubmit={handleFormSubmit} onCancel={handleFormCancel} />}

      {/* Property Details Modal */}
      {viewingProperty && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-blue-50 to-indigo-50 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-slate-800">Property Details</h2>
              <button
                onClick={() => setViewingProperty(null)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-white rounded-lg transition-all duration-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-50 rounded-xl p-4">
                  <h3 className="font-bold text-slate-800 mb-3">Property Information</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Name:</span>
                      <span className="font-medium text-slate-800">{viewingProperty.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Type:</span>
                      <span className="font-medium text-slate-800">{viewingProperty.type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Units:</span>
                      <span className="font-medium text-slate-800">{viewingProperty.units}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Status:</span>
                      <span className="font-medium text-slate-800">{viewingProperty.status}</span>
                    </div>
                  </div>
                </div>
                <div className="bg-slate-50 rounded-xl p-4">
                  <h3 className="font-bold text-slate-800 mb-3">Contact Information</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Owner:</span>
                      <span className="font-medium text-slate-800">{viewingProperty.owner}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Contact:</span>
                      <span className="font-medium text-slate-800">{viewingProperty.contact}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-slate-50 rounded-xl p-4">
                <h3 className="font-bold text-slate-800 mb-3">Address</h3>
                <p className="text-sm text-slate-700 font-medium">{viewingProperty.address}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-50 rounded-xl p-4">
                  <h3 className="font-bold text-slate-800 mb-3">Inspection Dates</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Last:</span>
                      <span className="font-medium text-slate-800">{viewingProperty.lastInspection}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Next:</span>
                      <span className="font-medium text-slate-800">{viewingProperty.nextInspection}</span>
                    </div>
                  </div>
                </div>
                <div className="bg-slate-50 rounded-xl p-4">
                  <h3 className="font-bold text-slate-800 mb-3">Created</h3>
                  <p className="text-sm text-slate-700 font-medium">{viewingProperty.createdAt}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Property Inspection Modal */}
      {inspectingProperty && (
        <PropertyInspectionForm 
          property={inspectingProperty} 
          inspections={inspections}
          onClose={() => setInspectingProperty(null)}
        />
      )}
    </div>
  )
}
