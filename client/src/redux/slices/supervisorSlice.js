import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"

const BASE_URL = "http://localhost:4000"

// Async thunks for supervisor API calls
export const fetchSupervisors = createAsyncThunk("supervisors/fetchAll", async (_, { rejectWithValue }) => {
  try {
    const response = await fetch(`${BASE_URL}/api/supervisors`)
    const data = await response.json()

    if (!data.success) {
      return rejectWithValue(data.msg || "Failed to fetch supervisors")
    }

    return data.data
  } catch (error) {
    return rejectWithValue(error.message)
  }
})

export const fetchSupervisorById = createAsyncThunk(
  "supervisors/fetchById",
  async (supervisorId, { rejectWithValue }) => {
    try {
      const response = await fetch(`${BASE_URL}/api/supervisors/${supervisorId}`)
      const data = await response.json()

      if (!data.success) {
        return rejectWithValue(data.msg || "Failed to fetch supervisor")
      }

      return data.data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  },
)

export const createSupervisor = createAsyncThunk("supervisors/create", async (supervisorData, { rejectWithValue }) => {
  try {
    const response = await fetch(`${BASE_URL}/api/supervisors`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(supervisorData),
    })
    const data = await response.json()

    if (!data.success) {
      return rejectWithValue(data.msg || "Failed to create supervisor")
    }

    return data.data
  } catch (error) {
    return rejectWithValue(error.message)
  }
})

export const updateSupervisor = createAsyncThunk(
  "supervisors/update",
  async ({ id, data: supervisorData }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${BASE_URL}/api/supervisors/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(supervisorData),
      })
      const data = await response.json()

      if (!data.success) {
        return rejectWithValue(data.msg || "Failed to update supervisor")
      }

      return { supervisorId: id, supervisorData }
    } catch (error) {
      return rejectWithValue(error.message)
    }
  },
)

export const deleteSupervisor = createAsyncThunk("supervisors/delete", async (supervisorId, { rejectWithValue }) => {
  try {
    const response = await fetch(`${BASE_URL}/api/supervisors/${supervisorId}`, {
      method: "DELETE",
    })
    const data = await response.json()

    if (!data.success) {
      return rejectWithValue(data.msg || "Failed to delete supervisor")
    }

    return supervisorId
  } catch (error) {
    return rejectWithValue(error.message)
  }
})

export const fetchAvailableSupervisors = createAsyncThunk(
  "supervisors/fetchAvailable",
  async (date, { rejectWithValue }) => {
    try {
      const response = await fetch(`${BASE_URL}/api/supervisors/available?date=${date}`)
      const data = await response.json()

      if (!data.success) {
        return rejectWithValue(data.msg || "Failed to fetch available supervisors")
      }

      return data.data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  },
)

export const assignTaskToSupervisor = createAsyncThunk(
  "supervisors/assignTask",
  async ({ supervisorId, taskData }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${BASE_URL}/api/supervisors/${supervisorId}/assign-task`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(taskData),
      })
      const data = await response.json()

      if (!data.success) {
        return rejectWithValue(data.msg || "Failed to assign task to supervisor")
      }

      return data.data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  },
)

export const fetchSupervisorWorkload = createAsyncThunk(
  "supervisors/fetchWorkload",
  async (supervisorId, { rejectWithValue }) => {
    try {
      const response = await fetch(`${BASE_URL}/api/supervisors/${supervisorId}/workload`)
      const data = await response.json()

      if (!data.success) {
        return rejectWithValue(data.msg || "Failed to fetch supervisor workload")
      }

      return data.data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  },
)

const supervisorSlice = createSlice({
  name: "supervisors",
  initialState: {
    supervisors: [],
    availableSupervisors: [],
    selectedSupervisor: null,
    supervisorWorkload: null,
    loading: false,
    error: null,
    totalCount: 0,
  },
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    clearSelectedSupervisor: (state) => {
      state.selectedSupervisor = null
    },
    setSelectedSupervisor: (state, action) => {
      state.selectedSupervisor = action.payload
    },
    clearAvailableSupervisors: (state) => {
      state.availableSupervisors = []
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all supervisors
      .addCase(fetchSupervisors.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchSupervisors.fulfilled, (state, action) => {
        state.loading = false
        state.supervisors = action.payload
        state.totalCount = action.payload.length
      })
      .addCase(fetchSupervisors.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      // Fetch supervisor by ID
      .addCase(fetchSupervisorById.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchSupervisorById.fulfilled, (state, action) => {
        state.loading = false
        state.selectedSupervisor = action.payload
      })
      .addCase(fetchSupervisorById.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      // Create supervisor
      .addCase(createSupervisor.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createSupervisor.fulfilled, (state, action) => {
        state.loading = false
        state.supervisors.unshift(action.payload)
        state.totalCount += 1
      })
      .addCase(createSupervisor.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      // Update supervisor
      .addCase(updateSupervisor.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateSupervisor.fulfilled, (state, action) => {
        state.loading = false
        const { supervisorId, supervisorData } = action.payload
        const index = state.supervisors.findIndex((s) => s.id === supervisorId)
        if (index !== -1) {
          state.supervisors[index] = { ...state.supervisors[index], ...supervisorData }
        }
        if (state.selectedSupervisor && state.selectedSupervisor.id === supervisorId) {
          state.selectedSupervisor = { ...state.selectedSupervisor, ...supervisorData }
        }
      })
      .addCase(updateSupervisor.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      // Delete supervisor
      .addCase(deleteSupervisor.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteSupervisor.fulfilled, (state, action) => {
        state.loading = false
        state.supervisors = state.supervisors.filter((s) => s.id !== action.payload)
        state.totalCount -= 1
        if (state.selectedSupervisor && state.selectedSupervisor.id === action.payload) {
          state.selectedSupervisor = null
        }
      })
      .addCase(deleteSupervisor.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      // Fetch available supervisors
      .addCase(fetchAvailableSupervisors.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchAvailableSupervisors.fulfilled, (state, action) => {
        state.loading = false
        state.availableSupervisors = action.payload
      })
      .addCase(fetchAvailableSupervisors.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      // Assign task to supervisor
      .addCase(assignTaskToSupervisor.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(assignTaskToSupervisor.fulfilled, (state, action) => {
        state.loading = false
        // Update supervisor's task count or workload if needed
      })
      .addCase(assignTaskToSupervisor.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      // Fetch supervisor workload
      .addCase(fetchSupervisorWorkload.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchSupervisorWorkload.fulfilled, (state, action) => {
        state.loading = false
        state.supervisorWorkload = action.payload
      })
      .addCase(fetchSupervisorWorkload.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  },
})

export const { clearError, clearSelectedSupervisor, setSelectedSupervisor, clearAvailableSupervisors } =
  supervisorSlice.actions
export default supervisorSlice.reducer
