import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"

const BASE_URL = "http://localhost:4000"

// Async thunks for API calls
export const fetchDashboardStats = createAsyncThunk(
  "dashboard/fetchStats",
  async (_, { rejectWithValue, getState }) => {
    try {
      const { users } = getState()
      const headers = {
        "Content-Type": "application/json",
      }

      // Add authorization header if user is logged in
      if (users.currentUser) {
        headers["Authorization"] = `Bearer ${users.currentUser.token}`
      }

      const response = await fetch(`${BASE_URL}/api/dashboard/stats`, {
        headers,
      })
      const data = await response.json()

      if (!data.success) {
        return rejectWithValue(data.msg || "Failed to fetch dashboard stats")
      }

      return data.data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  },
)

export const fetchRecentActivities = createAsyncThunk(
  "dashboard/fetchActivities",
  async (_, { rejectWithValue, getState }) => {
    try {
      const { users } = getState()
      const headers = {
        "Content-Type": "application/json",
      }

      // Add authorization header if user is logged in
      if (users.currentUser) {
        headers["Authorization"] = `Bearer ${users.currentUser.token}`
      }

      const response = await fetch(`${BASE_URL}/api/dashboard/activities`, {
        headers,
      })
      const data = await response.json()

      if (!data.success) {
        return rejectWithValue(data.msg || "Failed to fetch recent activities")
      }

      return data.data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  },
)

export const fetchUpcomingInspections = createAsyncThunk(
  "dashboard/fetchUpcoming",
  async (_, { rejectWithValue, getState }) => {
    try {
      const { users } = getState()
      const headers = {
        "Content-Type": "application/json",
      }

      // Add authorization header if user is logged in
      if (users.currentUser) {
        headers["Authorization"] = `Bearer ${users.currentUser.token}`
      }

      const response = await fetch(`${BASE_URL}/api/dashboard/upcoming`, {
        headers,
      })
      const data = await response.json()

      if (!data.success) {
        return rejectWithValue(data.msg || "Failed to fetch upcoming inspections")
      }

      return data.data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  },
)

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState: {
    stats: {
      total_properties: 0,
      total_inspections: 0,
      pending_inspections: 0,
      inprogress_inspections: 0,
    },
    recentActivities: [],
    upcomingInspections: [],
    loading: {
      stats: false,
      activities: false,
      upcoming: false,
    },
    error: null,
    lastUpdated: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    refreshDashboard: (state) => {
      state.lastUpdated = new Date().toISOString()
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch dashboard stats
      .addCase(fetchDashboardStats.pending, (state) => {
        state.loading.stats = true
        state.error = null
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.loading.stats = false
        state.stats = action.payload
        state.lastUpdated = new Date().toISOString()
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.loading.stats = false
        state.error = action.payload
      })

      // Fetch recent activities
      .addCase(fetchRecentActivities.pending, (state) => {
        state.loading.activities = true
        state.error = null
      })
      .addCase(fetchRecentActivities.fulfilled, (state, action) => {
        state.loading.activities = false
        state.recentActivities = action.payload
      })
      .addCase(fetchRecentActivities.rejected, (state, action) => {
        state.loading.activities = false
        state.error = action.payload
      })

      // Fetch upcoming inspections
      .addCase(fetchUpcomingInspections.pending, (state) => {
        state.loading.upcoming = true
        state.error = null
      })
      .addCase(fetchUpcomingInspections.fulfilled, (state, action) => {
        state.loading.upcoming = false
        state.upcomingInspections = action.payload
      })
      .addCase(fetchUpcomingInspections.rejected, (state, action) => {
        state.loading.upcoming = false
        state.error = action.payload
      })
  },
})

export const { clearError, refreshDashboard } = dashboardSlice.actions
export default dashboardSlice.reducer
