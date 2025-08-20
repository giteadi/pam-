"use client"

import { useState, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { fetchProperties } from "../redux/slices/propertySlice"
import { fetchInspections } from "../redux/slices/inspectionSlice"

export default function SupervisorDashboard() {
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.users)
  const { properties } = useSelector((state) => state.properties)
  const { inspections } = useSelector((state) => state.inspections)

  const [assignedProperties, setAssignedProperties] = useState([])
  const [pendingInspections, setPendingInspections] = useState([])

  useEffect(() => {
    dispatch(fetchProperties())
    dispatch(fetchInspections())
  }, [dispatch])

  useEffect(() => {
    // Filter properties assigned to this supervisor
    const userFullName = user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : ""
    const assigned = properties.filter(
      (property) =>
        property.assigned_supervisor === user?.id ||
        property.assigned_supervisor === user?.email ||
        (userFullName && property.assigned_supervisor?.toLowerCase().includes(userFullName.toLowerCase())),
    )
    setAssignedProperties(assigned)

    // Filter pending inspections for this supervisor
    const pending = inspections.filter(
      (inspection) => inspection.inspector_id === user?.id && inspection.status === "pending",
    )
    setPendingInspections(pending)
  }, [properties, inspections, user])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
            Supervisor Dashboard
          </h1>
          <p className="text-slate-600 mt-2">
            Welcome back, {user?.firstName}! Here are your assigned properties and pending tasks.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Assigned Properties</p>
                <p className="text-2xl font-bold text-slate-900">{assignedProperties.length}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Pending Inspections</p>
                <p className="text-2xl font-bold text-slate-900">{pendingInspections.length}</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-lg">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Tasks Available</p>
                <p className="text-2xl font-bold text-slate-900">
                  {assignedProperties.length + pendingInspections.length}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Assigned Properties */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 mb-8">
          <div className="p-6 border-b border-slate-200">
            <h2 className="text-xl font-semibold text-slate-900">Assigned Properties</h2>
            <p className="text-slate-600 mt-1">Properties you can inspect and manage tasks for</p>
          </div>
          <div className="p-6">
            {assignedProperties.length === 0 ? (
              <p className="text-slate-500 text-center py-8">No properties assigned to you yet.</p>
            ) : (
              <div className="space-y-4">
                {assignedProperties.slice(0, 5).map((property) => (
                  <div key={property.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <div>
                      <h3 className="font-medium text-slate-900">{property.name}</h3>
                      <p className="text-sm text-slate-600">{property.address}</p>
                      <p className="text-xs text-slate-500">Type: {property.type}</p>
                    </div>
                    <div className="flex space-x-2">
                      <button className="px-3 py-1 bg-blue-100 text-blue-700 rounded-md text-sm font-medium hover:bg-blue-200">
                        Inspect
                      </button>
                      <button className="px-3 py-1 bg-green-100 text-green-700 rounded-md text-sm font-medium hover:bg-green-200">
                        Checklist
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Pending Tasks */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200">
          <div className="p-6 border-b border-slate-200">
            <h2 className="text-xl font-semibold text-slate-900">Pending Inspections</h2>
            <p className="text-slate-600 mt-1">Inspections waiting for your attention</p>
          </div>
          <div className="p-6">
            {pendingInspections.length === 0 ? (
              <p className="text-slate-500 text-center py-8">No pending inspections.</p>
            ) : (
              <div className="space-y-4">
                {pendingInspections.map((inspection) => (
                  <div key={inspection.id} className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
                    <div>
                      <h3 className="font-medium text-slate-900">Inspection #{inspection.id}</h3>
                      <p className="text-sm text-slate-600">Property: {inspection.property_name}</p>
                      <p className="text-xs text-slate-500">Scheduled: {inspection.scheduled_date}</p>
                    </div>
                    <button className="px-4 py-2 bg-yellow-600 text-white rounded-md text-sm font-medium hover:bg-yellow-700">
                      Start Inspection
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
