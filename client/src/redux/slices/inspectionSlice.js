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

const mockInspections = [
  {
    id: 1,
    property_id: 1,
    inspector_id: 2,
    status: "scheduled",
    scheduled_date: "2024-01-15",
    property_name: "123 Main St",
    inspector_name: "Jane Smith",
    checklist_items: [
      { id: 1, item: "Check electrical systems", status: "pending", comment: "" },
      { id: 2, item: "Inspect plumbing", status: "pending", comment: "" },
      { id: 3, item: "Verify HVAC operation", status: "pending", comment: "" },
    ],
  },
  {
    id: 2,
    property_id: 2,
    inspector_id: 2,
    status: "in_progress",
    scheduled_date: "2024-01-14",
    property_name: "456 Oak Ave",
    inspector_name: "Jane Smith",
    checklist_items: [
      { id: 4, item: "Check electrical systems", status: "passed", comment: "All systems working" },
      { id: 5, item: "Inspect plumbing", status: "in_progress", comment: "" },
    ],
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
    const response = await fetch(url)
    const data = await handleApiResponse(response)

    if (!data.success) {
      return rejectWithValue(data.msg || "Failed to fetch inspections")
    }

    return data.data
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

      return data.data
    } catch (error) {
      console.warn("API call failed, using mock data:", error.message)
      return mockInspections.find((i) => i.id == inspectionId) || mockInspections[0]
    }
  },
)

export const createInspection = createAsyncThunk("inspections/create", async (inspectionData, { rejectWithValue }) => {
  try {
    const response = await fetch(`${BASE_URL}/api/inspections`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(inspectionData),
    })
    const data = await handleApiResponse(response)

    if (!data.success) {
      return rejectWithValue(data.msg || "Failed to create inspection")
    }

    return data.data
  } catch (error) {
    return rejectWithValue(error.message)
  }
})

export const updateInspection = createAsyncThunk(
  "inspections/update",
  async ({ id, data: inspectionData }, { rejectWithValue }) => {
    try {
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

      return { inspectionId: id, inspectionData }
    } catch (error) {
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

      return data.data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  },
)

export const scheduleInspection = createAsyncThunk(
  "inspections/schedule",
  async (scheduleData, { rejectWithValue }) => {
    try {
      const response = await fetch(`${BASE_URL}/api/inspections/schedule`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(scheduleData),
      })
      const data = await handleApiResponse(response)

      if (!data.success) {
        return rejectWithValue(data.msg || "Failed to schedule inspection")
      }

      return data.data
    } catch (error) {
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
