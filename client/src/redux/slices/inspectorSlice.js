import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"

const BASE_URL = "http://localhost:4000"

// Helper function to handle API responses and detect HTML errors
const handleApiResponse = async (response) => {
  const contentType = response.headers.get("content-type")
  if (contentType && contentType.includes("application/json")) {
    return await response.json()
  } else {
    // If we get HTML instead of JSON, it's likely a 404 or server error
    const text = await response.text()
    if (text.includes("<!doctype") || text.includes("<html")) {
      throw new Error(`API endpoint not found: ${response.url}`)
    }
    throw new Error(`Invalid response format: ${text}`)
  }
}

export const fetchInspectors = createAsyncThunk("inspectors/fetchAll", async (_, { rejectWithValue }) => {
  try {
    const response = await fetch(`${BASE_URL}/api/inspector`)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const result = await handleApiResponse(response)
    return result.success ? result.data : []
  } catch (error) {
    console.error("Failed to fetch inspectors:", error)
    return rejectWithValue(error.message)
  }
})

export const fetchAvailableInspectors = createAsyncThunk(
  "inspectors/fetchAvailable",
  async (date = null, { rejectWithValue }) => {
    try {
      const url = date ? `${BASE_URL}/api/inspector/available?date=${date}` : `${BASE_URL}/api/inspector/available`
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const result = await handleApiResponse(response)
      return result.success ? result.data : []
    } catch (error) {
      console.error("Failed to fetch available inspectors:", error)
      const mockInspectors = [
        {
          id: 1,
          name: "Jane Smith",
          email: "jane.smith@example.com",
          phone: "(555) 123-4567",
          specialization: "Residential",
          certification: "Certified Home Inspector",
          experience_years: 8,
          hourly_rate: 75,
          availability: "available",
          status: "active",
          scheduled_inspections: 0,
        },
      ]
      return mockInspectors
    }
  },
)

export const createInspector = createAsyncThunk("inspectors/create", async (inspectorData, { rejectWithValue }) => {
  try {
    const response = await fetch(`${BASE_URL}/api/inspector`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(inspectorData),
    })
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const result = await handleApiResponse(response)
    return result.success ? result.data : result
  } catch (error) {
    console.error("Failed to create inspector:", error)
    return rejectWithValue(error.message)
  }
})

export const updateInspector = createAsyncThunk(
  "inspectors/update",
  async ({ id, inspectorData }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${BASE_URL}/api/inspector/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(inspectorData),
      })
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const result = await handleApiResponse(response)
      return { id, ...inspectorData }
    } catch (error) {
      console.error("Failed to update inspector:", error)
      return rejectWithValue(error.message)
    }
  },
)

export const deleteInspector = createAsyncThunk("inspectors/delete", async (id, { rejectWithValue }) => {
  try {
    const response = await fetch(`${BASE_URL}/api/inspector/${id}`, {
      method: "DELETE",
    })
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    return id
  } catch (error) {
    console.error("Failed to delete inspector:", error)
    return rejectWithValue(error.message)
  }
})

export const assignInspectionTask = createAsyncThunk(
  "inspectors/assignTask",
  async ({ inspectionId, inspectorId }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${BASE_URL}/api/inspection/${inspectionId}/assign`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inspector_id: inspectorId }),
      })
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      return await handleApiResponse(response)
    } catch (error) {
      console.error("Failed to assign inspection task:", error)
      return rejectWithValue(error.message)
    }
  },
)

const inspectorSlice = createSlice({
  name: "inspectors",
  initialState: {
    inspectors: [],
    availableInspectors: [],
    selectedInspector: null,
    loading: false,
    error: null,
    assignmentLoading: false,
    assignmentError: null,
  },
  reducers: {
    setSelectedInspector: (state, action) => {
      state.selectedInspector = action.payload
    },
    clearSelectedInspector: (state) => {
      state.selectedInspector = null
    },
    clearError: (state) => {
      state.error = null
      state.assignmentError = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchInspectors.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchInspectors.fulfilled, (state, action) => {
        state.loading = false
        state.inspectors = action.payload
      })
      .addCase(fetchInspectors.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
        state.inspectors = [
          {
            id: 1,
            name: "Jane Smith",
            email: "jane.smith@example.com",
            phone: "(555) 123-4567",
            specialization: "Residential",
            certification: "Certified Home Inspector",
            experience_years: 8,
            hourly_rate: 75,
            availability: "available",
            status: "active",
            total_inspections: 15,
            completed_inspections: 12,
          },
          {
            id: 2,
            name: "Bob Johnson",
            email: "bob.johnson@example.com",
            phone: "(555) 987-6543",
            specialization: "Commercial",
            certification: "Commercial Building Inspector",
            experience_years: 12,
            hourly_rate: 95,
            availability: "busy",
            status: "active",
            total_inspections: 28,
            completed_inspections: 25,
          },
        ]
      })
      .addCase(fetchAvailableInspectors.fulfilled, (state, action) => {
        state.availableInspectors = action.payload
      })
      .addCase(fetchAvailableInspectors.rejected, (state, action) => {
        state.error = action.payload
      })
      .addCase(createInspector.fulfilled, (state, action) => {
        state.inspectors.push(action.payload)
      })
      .addCase(createInspector.rejected, (state, action) => {
        state.error = action.payload
      })
      .addCase(updateInspector.fulfilled, (state, action) => {
        const index = state.inspectors.findIndex((inspector) => inspector.id === action.payload.id)
        if (index !== -1) {
          state.inspectors[index] = action.payload
        }
      })
      .addCase(updateInspector.rejected, (state, action) => {
        state.error = action.payload
      })
      .addCase(deleteInspector.fulfilled, (state, action) => {
        state.inspectors = state.inspectors.filter((inspector) => inspector.id !== action.payload)
      })
      .addCase(deleteInspector.rejected, (state, action) => {
        state.error = action.payload
      })
      .addCase(assignInspectionTask.pending, (state) => {
        state.assignmentLoading = true
        state.assignmentError = null
      })
      .addCase(assignInspectionTask.fulfilled, (state, action) => {
        state.assignmentLoading = false
        const inspector = state.inspectors.find((i) => i.id === action.payload.inspector_id)
        if (inspector) {
          inspector.availability = "busy"
        }
      })
      .addCase(assignInspectionTask.rejected, (state, action) => {
        state.assignmentLoading = false
        state.assignmentError = action.payload
      })
  },
})

export const { setSelectedInspector, clearSelectedInspector, clearError } = inspectorSlice.actions
export default inspectorSlice.reducer
