import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"

const BASE_URL = "http://localhost:4000"

const handleApiResponse = async (response) => {
  const contentType = response.headers.get("content-type")

  if (!contentType || !contentType.includes("application/json")) {
    const text = await response.text()
    if (text.includes("<!doctype") || text.includes("<html")) {
      throw new Error("Server returned HTML instead of JSON. Check if your backend server is running on localhost:4000")
    }
    throw new Error("Server did not return JSON response")
  }

  const data = await response.json()
  return data
}

// Transform API data to match frontend expectations
const transformInspectionData = (apiData) => {
  return {
    id: apiData.id,
    propertyId: apiData.property_id,
    propertyName: apiData.property_name || "Unknown Property",
    inspectorId: apiData.inspector_id,
    assigned_inspector_id: apiData.inspector_id, // For compatibility
    inspectorName: apiData.inspector_name || "Unknown Inspector",
    startDate: apiData.start_date,
    scheduledDate: apiData.start_date, // For compatibility with frontend
    completedDate: apiData.completed_date,
    status: apiData.status || "scheduled",
    progress: apiData.progress || 0,
    type: apiData.inspection_type || "routine",
    notes: apiData.notes || "",
    totalItems: apiData.total_items || 0,
    completedItems: apiData.completed_items || 0,
    checklistItems: apiData.checklist_items || [],
    customAmenities: apiData.custom_amenities || [],
    checklist: apiData.checklist || {}
  }
}

const mockInspections = [
  {
    id: 1,
    propertyId: 1,
    propertyName: "123 Main St",
    inspectorId: 1,
    assigned_inspector_id: 1,
    inspectorName: "Jane Smith",
    startDate: "2024-01-15T09:00:00",
    scheduledDate: "2024-01-15T09:00:00",
    status: "scheduled",
    progress: 0,
    type: "routine",
    notes: "Initial inspection",
    totalItems: 0,
    completedItems: 0,
    checklistItems: [],
    customAmenities: [],
    checklist: {}
  },
  {
    id: 2,
    propertyId: 2,
    propertyName: "456 Oak Ave",
    inspectorId: 1,
    assigned_inspector_id: 1,
    inspectorName: "Jane Smith",
    startDate: "2024-01-14T10:00:00",
    scheduledDate: "2024-01-14T10:00:00",
    status: "in-progress",
    progress: 45,
    type: "maintenance",
    notes: "Follow-up inspection",
    totalItems: 0,
    completedItems: 0,
    checklistItems: [],
    customAmenities: [],
    checklist: {}
  },
]

export const fetchInspections = createAsyncThunk("inspections/fetchAll", async (filters = {}, { rejectWithValue }) => {
  try {
    const queryParams = new URLSearchParams()

    Object.keys(filters).forEach((key) => {
      if (filters[key]) {
        queryParams.append(key, filters[key])
      }
    })

    const url = `${BASE_URL}/api/inspections${queryParams.toString() ? `?${queryParams.toString()}` : ""}`
    console.log("[Redux] Fetching inspections from:", url)
    
    const response = await fetch(url)
    const data = await handleApiResponse(response)

    console.log("[Redux] API Response:", data)

    if (!data.success) {
      return rejectWithValue(data.msg || "Failed to fetch inspections")
    }

    // Transform the API data to match frontend expectations
    const transformedData = data.data.map(transformInspectionData)
    console.log("[Redux] Transformed data:", transformedData)

    return transformedData
  } catch (error) {
    console.warn("API call failed, using mock data:", error.message)
    return mockInspections
  }
})

export const fetchInspectionById = createAsyncThunk(
  "inspections/fetchById",
  async (inspectionId, { rejectWithValue }) => {
    try {
      const response = await fetch(`${BASE_URL}/api/inspections/${inspectionId}`)
      const data = await handleApiResponse(response)

      if (!data.success) {
        return rejectWithValue(data.msg || "Failed to fetch inspection")
      }

      return transformInspectionData(data.data)
    } catch (error) {
      console.warn("API call failed, using mock data:", error.message)
      return mockInspections.find((i) => i.id == inspectionId) || mockInspections[0]
    }
  },
)

export const createInspection = createAsyncThunk("inspections/create", async (inspectionData, { rejectWithValue }) => {
  try {
    console.log("[Redux] Creating inspection with data:", inspectionData)
    
    const response = await fetch(`${BASE_URL}/api/inspections`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(inspectionData),
    })
    const data = await handleApiResponse(response)

    console.log("[Redux] Create inspection response:", data)

    if (!data.success) {
      return rejectWithValue(data.msg || "Failed to create inspection")
    }

    return transformInspectionData(data.data)
  } catch (error) {
    console.error("[Redux] Create inspection error:", error)
    return rejectWithValue(error.message)
  }
})

export const updateInspection = createAsyncThunk(
  "inspections/update",
  async ({ id, data: inspectionData }, { rejectWithValue }) => {
    try {
      console.log("[Redux] Updating inspection:", id, inspectionData)
      
      const response = await fetch(`${BASE_URL}/api/inspections/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(inspectionData),
      })
      const data = await handleApiResponse(response)

      if (!data.success) {
        return rejectWithValue(data.msg || "Failed to update inspection")
      }

      return { inspectionId: id, inspectionData: transformInspectionData({ id, ...inspectionData }) }
    } catch (error) {
      console.error("[Redux] Update inspection error:", error)
      return rejectWithValue(error.message)
    }
  },
)

export const deleteInspection = createAsyncThunk("inspections/delete", async (inspectionId, { rejectWithValue }) => {
  try {
    const response = await fetch(`${BASE_URL}/api/inspections/${inspectionId}`, {
      method: "DELETE",
    })
    const data = await handleApiResponse(response)

    if (!data.success) {
      return rejectWithValue(data.msg || "Failed to delete inspection")
    }

    return inspectionId
  } catch (error) {
    return rejectWithValue(error.message)
  }
})

export const updateInspectionStatus = createAsyncThunk(
  "inspections/updateStatus",
  async ({ inspectionId, status }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${BASE_URL}/api/inspections/${inspectionId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      })
      const data = await handleApiResponse(response)

      if (!data.success) {
        return rejectWithValue(data.msg || "Failed to update inspection status")
      }

      return { inspectionId, status }
    } catch (error) {
      return rejectWithValue(error.message)
    }
  },
)

export const updateChecklistItem = createAsyncThunk(
  "inspections/updateChecklistItem",
  async ({ inspectionId, itemId, status, comment }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${BASE_URL}/api/inspections/items/${itemId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status, comment }),
      })
      const data = await handleApiResponse(response)

      if (!data.success) {
        return rejectWithValue(data.msg || "Failed to update checklist item")
      }

      return { inspectionId, itemId, status, comment }
    } catch (error) {
      return rejectWithValue(error.message)
    }
  },
)

export const fetchInspectionsByProperty = createAsyncThunk(
  "inspections/fetchByProperty",
  async (propertyId, { rejectWithValue }) => {
    try {
      const response = await fetch(`${BASE_URL}/api/inspections/property/${propertyId}`)
      const data = await handleApiResponse(response)

      if (!data.success) {
        return rejectWithValue(data.msg || "Failed to fetch inspections for property")
      }

      return data.data.map(transformInspectionData)
    } catch (error) {
      return rejectWithValue(error.message)
    }
  },
)

export const scheduleInspection = createAsyncThunk(
  "inspections/schedule",
  async (scheduleData, { rejectWithValue }) => {
    try {
      console.log("[Redux] Scheduling inspection with data:", scheduleData)
      
      const response = await fetch(`${BASE_URL}/api/inspections/schedule`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(scheduleData),
      })
      const data = await handleApiResponse(response)

      console.log("[Redux] Schedule inspection response:", data)

      if (!data.success) {
        return rejectWithValue(data.msg || "Failed to schedule inspection")
      }

      return transformInspectionData(data.data)
    } catch (error) {
      console.error("[Redux] Schedule inspection error:", error)
      return rejectWithValue(error.message)
    }
  },
)

const inspectionSlice = createSlice({
  name: "inspections",
  initialState: {
    inspections: [],
    selectedInspection: null,
    propertyInspections: [],
    scheduledInspections: [],
    loading: false,
    error: null,
    totalCount: 0,
    filters: {
      status: "",
      property_id: "",
      inspector_id: "",
      date_range: "",
    },
  },
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    clearSelectedInspection: (state) => {
      state.selectedInspection = null
    },
    setSelectedInspection: (state, action) => {
      state.selectedInspection = action.payload
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload }
    },
    clearFilters: (state) => {
      state.filters = {
        status: "",
        property_id: "",
        inspector_id: "",
        date_range: "",
      }
    },
    setPropertyInspections: (state, action) => {
      state.propertyInspections = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchInspections.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchInspections.fulfilled, (state, action) => {
        state.loading = false
        state.inspections = action.payload
        state.totalCount = action.payload.length
      })
      .addCase(fetchInspections.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
        // Set mock data on error
        state.inspections = mockInspections
        state.totalCount = mockInspections.length
      })
      .addCase(createInspection.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createInspection.fulfilled, (state, action) => {
        state.loading = false
        state.inspections.push(action.payload)
      })
      .addCase(createInspection.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      .addCase(updateInspection.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateInspection.fulfilled, (state, action) => {
        state.loading = false
        const index = state.inspections.findIndex((i) => i.id === action.payload.inspectionId)
        if (index !== -1) {
          state.inspections[index] = { ...state.inspections[index], ...action.payload.inspectionData }
        }
      })
      .addCase(updateInspection.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      .addCase(deleteInspection.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteInspection.fulfilled, (state, action) => {
        state.loading = false
        state.inspections = state.inspections.filter((i) => i.id !== action.payload)
      })
      .addCase(deleteInspection.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      .addCase(scheduleInspection.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(scheduleInspection.fulfilled, (state, action) => {
        state.loading = false
        state.scheduledInspections.push(action.payload)
        // Also add to regular inspections list for display
        state.inspections.push(action.payload)
      })
      .addCase(scheduleInspection.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  },
})

export const {
  clearError,
  clearSelectedInspection,
  setSelectedInspection,
  setFilters,
  clearFilters,
  setPropertyInspections,
} = inspectionSlice.actions

export default inspectionSlice.reducer