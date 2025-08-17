import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"

const BASE_URL = "http://localhost:4000"

// Async thunks for API calls
export const fetchInspections = createAsyncThunk("inspections/fetchAll", async (filters = {}, { rejectWithValue }) => {
  try {
    const queryParams = new URLSearchParams()

    // Add filters to query params
    Object.keys(filters).forEach((key) => {
      if (filters[key]) {
        queryParams.append(key, filters[key])
      }
    })

    const url = `${BASE_URL}/api/inspections${queryParams.toString() ? `?${queryParams.toString()}` : ""}`
    const response = await fetch(url)
    const data = await response.json()

    if (!data.success) {
      return rejectWithValue(data.msg || "Failed to fetch inspections")
    }

    return data.data
  } catch (error) {
    return rejectWithValue(error.message)
  }
})

export const fetchInspectionById = createAsyncThunk(
  "inspections/fetchById",
  async (inspectionId, { rejectWithValue }) => {
    try {
      const response = await fetch(`${BASE_URL}/api/inspections/${inspectionId}`)
      const data = await response.json()

      if (!data.success) {
        return rejectWithValue(data.msg || "Failed to fetch inspection")
      }

      return data.data
    } catch (error) {
      return rejectWithValue(error.message)
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
    const data = await response.json()

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
      const data = await response.json()

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
    const data = await response.json()

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
      const data = await response.json()

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
      const data = await response.json()

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
      const data = await response.json()

      if (!data.success) {
        return rejectWithValue(data.msg || "Failed to fetch inspections for property")
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
      // Fetch all inspections
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

      // Fetch inspection by ID
      .addCase(fetchInspectionById.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchInspectionById.fulfilled, (state, action) => {
        state.loading = false
        state.selectedInspection = action.payload
      })
      .addCase(fetchInspectionById.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      // Create inspection
      .addCase(createInspection.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createInspection.fulfilled, (state, action) => {
        state.loading = false
        state.inspections.unshift(action.payload)
        state.totalCount += 1
      })
      .addCase(createInspection.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      // Update inspection
      .addCase(updateInspection.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateInspection.fulfilled, (state, action) => {
        state.loading = false
        const { inspectionId, inspectionData } = action.payload
        const index = state.inspections.findIndex((i) => i.id === inspectionId)
        if (index !== -1) {
          state.inspections[index] = { ...state.inspections[index], ...inspectionData }
        }
        if (state.selectedInspection && state.selectedInspection.id === inspectionId) {
          state.selectedInspection = { ...state.selectedInspection, ...inspectionData }
        }
      })
      .addCase(updateInspection.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      // Delete inspection
      .addCase(deleteInspection.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteInspection.fulfilled, (state, action) => {
        state.loading = false
        state.inspections = state.inspections.filter((i) => i.id !== action.payload)
        state.totalCount -= 1
        if (state.selectedInspection && state.selectedInspection.id === action.payload) {
          state.selectedInspection = null
        }
      })
      .addCase(deleteInspection.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      // Update inspection status
      .addCase(updateInspectionStatus.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateInspectionStatus.fulfilled, (state, action) => {
        state.loading = false
        const { inspectionId, status } = action.payload
        const index = state.inspections.findIndex((i) => i.id === inspectionId)
        if (index !== -1) {
          state.inspections[index].status = status
        }
        if (state.selectedInspection && state.selectedInspection.id === inspectionId) {
          state.selectedInspection.status = status
        }
      })
      .addCase(updateInspectionStatus.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      // Update checklist item
      .addCase(updateChecklistItem.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateChecklistItem.fulfilled, (state, action) => {
        state.loading = false
        const { inspectionId, itemId, status, comment } = action.payload

        // Update the checklist item in selected inspection if it exists
        if (state.selectedInspection && state.selectedInspection.checklist_items) {
          const itemIndex = state.selectedInspection.checklist_items.findIndex((item) => item.id === itemId)
          if (itemIndex !== -1) {
            state.selectedInspection.checklist_items[itemIndex].status = status
            state.selectedInspection.checklist_items[itemIndex].comment = comment
          }
        }
      })
      .addCase(updateChecklistItem.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      // Fetch inspections by property
      .addCase(fetchInspectionsByProperty.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchInspectionsByProperty.fulfilled, (state, action) => {
        state.loading = false
        state.propertyInspections = action.payload
      })
      .addCase(fetchInspectionsByProperty.rejected, (state, action) => {
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
