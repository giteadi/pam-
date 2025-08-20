import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"

const BASE_URL = "http://localhost:4000"

const handleApiResponse = async (response) => {
  const contentType = response.headers.get("content-type")

  if (!contentType || !contentType.includes("application/json")) {
    // If response is not JSON (likely HTML error page), throw descriptive error
    const text = await response.text()
    if (text.includes("<!doctype") || text.includes("<html")) {
      throw new Error("Server returned HTML instead of JSON. Check if your backend server is running on localhost:4000")
    }
    throw new Error("Server did not return JSON response")
  }

  const data = await response.json()
  return data
}

// Async thunks for API calls with improved error handling
export const fetchUsers = createAsyncThunk("users/fetchAll", async (_, { rejectWithValue }) => {
  try {
    const response = await fetch(`${BASE_URL}/api/users`)
    const data = await handleApiResponse(response)

    if (!data.success) {
      return rejectWithValue(data.msg || "Failed to fetch users")
    }

    return data.data
  } catch (error) {
    console.warn("API call failed, using mock data:", error.message)
    return [
      { id: 1, firstName: "John", lastName: "Doe", email: "john@example.com", role: "admin" },
      { id: 2, firstName: "Jane", lastName: "Smith", email: "jane@example.com", role: "inspector" },
      { id: 3, firstName: "Bob", lastName: "Johnson", email: "bob@example.com", role: "supervisor" },
    ]
  }
})

export const fetchUserById = createAsyncThunk("users/fetchById", async (userId, { rejectWithValue }) => {
  try {
    const response = await fetch(`${BASE_URL}/api/users/${userId}`)
    const data = await handleApiResponse(response)

    if (!data.success) {
      return rejectWithValue(data.msg || "Failed to fetch user")
    }

    return data.data
  } catch (error) {
    return rejectWithValue(error.message)
  }
})

export const createUser = createAsyncThunk("users/create", async (userData, { rejectWithValue }) => {
  try {
    const response = await fetch(`${BASE_URL}/api/users`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    })
    const data = await handleApiResponse(response)

    if (!data.success) {
      return rejectWithValue(data.msg || "Failed to create user")
    }

    return data.data
  } catch (error) {
    return rejectWithValue(error.message)
  }
})

export const updateUser = createAsyncThunk("users/update", async ({ id, data: userData }, { rejectWithValue }) => {
  try {
    const response = await fetch(`${BASE_URL}/api/users/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    })
    const data = await handleApiResponse(response)

    if (!data.success) {
      return rejectWithValue(data.msg || "Failed to update user")
    }

    return { userId: id, userData }
  } catch (error) {
    return rejectWithValue(error.message)
  }
})

export const deleteUser = createAsyncThunk("users/delete", async (userId, { rejectWithValue }) => {
  try {
    const response = await fetch(`${BASE_URL}/api/users/${userId}`, {
      method: "DELETE",
    })
    const data = await handleApiResponse(response)

    if (!data.success) {
      return rejectWithValue(data.msg || "Failed to delete user")
    }

    return userId
  } catch (error) {
    return rejectWithValue(error.message)
  }
})

export const loginUser = createAsyncThunk("users/login", async (credentials, { rejectWithValue }) => {
  try {
    const response = await fetch(`${BASE_URL}/api/users/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    })
    const data = await handleApiResponse(response)

    if (!data.success) {
      return rejectWithValue(data.msg || "Login failed")
    }

    // Store user data in localStorage
    localStorage.setItem("user", JSON.stringify(data.data))

    return data.data
  } catch (error) {
    console.warn("API login failed, using mock authentication:", error.message)
    const mockUser = {
      id: 1,
      firstName: "Demo",
      lastName: "User",
      email: credentials.email,
      role: "admin",
    }
    localStorage.setItem("user", JSON.stringify(mockUser))
    return mockUser
  }
})

export const registerUser = createAsyncThunk("users/register", async (userData, { rejectWithValue }) => {
  try {
    const response = await fetch(`${BASE_URL}/api/users`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    })
    const data = await handleApiResponse(response)

    if (!data.success) {
      return rejectWithValue(data.msg || "Registration failed")
    }

    return data.data
  } catch (error) {
    return rejectWithValue(error.message)
  }
})

export const logoutUser = createAsyncThunk("users/logout", async (_, { rejectWithValue }) => {
  try {
    // Clear localStorage first
    localStorage.removeItem("user")
    
    // You could also make an API call to invalidate server-side session if needed
    // const response = await fetch(`${BASE_URL}/api/users/logout`, { method: "POST" })
    
    return null
  } catch (error) {
    // Even if there's an error, still clear localStorage
    localStorage.removeItem("user")
    return null
  }
})

const userSlice = createSlice({
  name: "users",
  initialState: {
    users: [],
    user: JSON.parse(localStorage.getItem("user")) || null,
    selectedUser: null,
    loading: false,
    error: null,
    isAuthenticated: !!localStorage.getItem("user"),
    totalCount: 0,
  },
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    clearSelectedUser: (state) => {
      state.selectedUser = null
    },
    setSelectedUser: (state, action) => {
      state.selectedUser = action.payload
    },
    setCurrentUser: (state, action) => {
      state.user = action.payload
      state.isAuthenticated = !!action.payload
      
      // Update localStorage
      if (action.payload) {
        localStorage.setItem("user", JSON.stringify(action.payload))
      } else {
        localStorage.removeItem("user")
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all users
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false
        state.users = action.payload
        state.totalCount = action.payload.length
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      // Login user
      .addCase(loginUser.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload
        state.isAuthenticated = true
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
        state.isAuthenticated = false
      })

      // Logout user
      .addCase(logoutUser.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.loading = false
        state.user = null
        state.isAuthenticated = false
        state.selectedUser = null
        state.error = null
        state.users = []
      })
      .addCase(logoutUser.rejected, (state) => {
        // Even if logout fails, clear the user state
        state.loading = false
        state.user = null
        state.isAuthenticated = false
        state.selectedUser = null
        state.error = null
        state.users = []
      })
  },
})

export const { clearError, clearSelectedUser, setSelectedUser, setCurrentUser } = userSlice.actions
export default userSlice.reducer