import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"

const BASE_URL = "http://localhost:4000"

// Async thunks for API calls
export const fetchAllProperties = createAsyncThunk("properties/fetchAll", async (_, { rejectWithValue }) => {
  try {
    const response = await fetch(`${BASE_URL}/api/properties`)
    const data = await response.json()

    if (!data.success) {
      return rejectWithValue(data.msg || "Failed to fetch properties")
    }

    return data.data
  } catch (error) {
    return rejectWithValue(error.message)
  }
})

export const fetchPropertyById = createAsyncThunk("properties/fetchById", async (propertyId, { rejectWithValue }) => {
  try {
    const response = await fetch(`${BASE_URL}/api/properties/${propertyId}`)
    const data = await response.json()

    if (!data.success) {
      return rejectWithValue(data.msg || "Failed to fetch property")
    }

    return data.data
  } catch (error) {
    return rejectWithValue(error.message)
  }
})

export const createProperty = createAsyncThunk("properties/create", async (propertyData, { rejectWithValue }) => {
  try {
    const response = await fetch(`${BASE_URL}/api/properties`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(propertyData),
    })
    const data = await response.json()

    if (!data.success) {
      return rejectWithValue(data.msg || "Failed to create property")
    }

    return data.data
  } catch (error) {
    return rejectWithValue(error.message)
  }
})

export const updateProperty = createAsyncThunk(
  "properties/update",
  async ({ propertyId, propertyData }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${BASE_URL}/api/properties/${propertyId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(propertyData),
      })
      const data = await response.json()

      if (!data.success) {
        return rejectWithValue(data.msg || "Failed to update property")
      }

      return { propertyId, propertyData }
    } catch (error) {
      return rejectWithValue(error.message)
    }
  },
)

export const deleteProperty = createAsyncThunk("properties/delete", async (propertyId, { rejectWithValue }) => {
  try {
    const response = await fetch(`${BASE_URL}/api/properties/${propertyId}`, {
      method: "DELETE",
    })
    const data = await response.json()

    if (!data.success) {
      return rejectWithValue(data.msg || "Failed to delete property")
    }

    return propertyId
  } catch (error) {
    return rejectWithValue(error.message)
  }
})

const propertySlice = createSlice({
  name: "properties",
  initialState: {
    properties: [],
    selectedProperty: null,
    loading: false,
    error: null,
    totalCount: 0,
  },
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    clearSelectedProperty: (state) => {
      state.selectedProperty = null
    },
    setSelectedProperty: (state, action) => {
      state.selectedProperty = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all properties
      .addCase(fetchAllProperties.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchAllProperties.fulfilled, (state, action) => {
        state.loading = false
        state.properties = action.payload
        state.totalCount = action.payload.length
      })
      .addCase(fetchAllProperties.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      // Fetch property by ID
      .addCase(fetchPropertyById.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchPropertyById.fulfilled, (state, action) => {
        state.loading = false
        state.selectedProperty = action.payload
      })
      .addCase(fetchPropertyById.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      // Create property
      .addCase(createProperty.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createProperty.fulfilled, (state, action) => {
        state.loading = false
        state.properties.unshift(action.payload)
        state.totalCount += 1
      })
      .addCase(createProperty.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      // Update property
      .addCase(updateProperty.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateProperty.fulfilled, (state, action) => {
        state.loading = false
        const { propertyId, propertyData } = action.payload
        const index = state.properties.findIndex((p) => p.id === propertyId)
        if (index !== -1) {
          state.properties[index] = { ...state.properties[index], ...propertyData }
        }
        if (state.selectedProperty && state.selectedProperty.id === propertyId) {
          state.selectedProperty = { ...state.selectedProperty, ...propertyData }
        }
      })
      .addCase(updateProperty.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      // Delete property
      .addCase(deleteProperty.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteProperty.fulfilled, (state, action) => {
        state.loading = false
        state.properties = state.properties.filter((p) => p.id !== action.payload)
        state.totalCount -= 1
        if (state.selectedProperty && state.selectedProperty.id === action.payload) {
          state.selectedProperty = null
        }
      })
      .addCase(deleteProperty.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  },
})

export const { clearError, clearSelectedProperty, setSelectedProperty } = propertySlice.actions
export default propertySlice.reducer
