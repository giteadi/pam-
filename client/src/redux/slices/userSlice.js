import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"

const BASE_URL = "http://localhost:4000"

// Async thunks for API calls
export const fetchUsers = createAsyncThunk("users/fetchAll", async (_, { rejectWithValue }) => {
  try {
    const response = await fetch(`${BASE_URL}/api/users`)
    const data = await response.json()

    if (!data.success) {
      return rejectWithValue(data.msg || "Failed to fetch users")
    }

    return data.data
  } catch (error) {
    return rejectWithValue(error.message)
  }
})

export const fetchUserById = createAsyncThunk("users/fetchById", async (userId, { rejectWithValue }) => {
  try {
    const response = await fetch(`${BASE_URL}/api/users/${userId}`)
    const data = await response.json()

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
    const data = await response.json()

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
    const data = await response.json()

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
    const data = await response.json()

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
    const data = await response.json()

    if (!data.success) {
      return rejectWithValue(data.msg || "Login failed")
    }

    // Store user data in localStorage
    localStorage.setItem("user", JSON.stringify(data.data))

    return data.data
  } catch (error) {
    return rejectWithValue(error.message)
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
    const data = await response.json()

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
    // Remove user data from localStorage
    localStorage.removeItem("user")
    return null
  } catch (error) {
    return rejectWithValue(error.message)
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

      // Fetch user by ID
      .addCase(fetchUserById.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchUserById.fulfilled, (state, action) => {
        state.loading = false
        state.selectedUser = action.payload
      })
      .addCase(fetchUserById.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      // Create user
      .addCase(createUser.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createUser.fulfilled, (state, action) => {
        state.loading = false
        state.users.unshift(action.payload)
        state.totalCount += 1
      })
      .addCase(createUser.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      // Update user
      .addCase(updateUser.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.loading = false
        const { userId, userData } = action.payload
        const index = state.users.findIndex((u) => u.id === userId)
        if (index !== -1) {
          state.users[index] = { ...state.users[index], ...userData }
        }
        if (state.selectedUser && state.selectedUser.id === userId) {
          state.selectedUser = { ...state.selectedUser, ...userData }
        }
        if (state.user && state.user.id === userId) {
          state.user = { ...state.user, ...userData }
          localStorage.setItem("user", JSON.stringify(state.user))
        }
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      // Delete user
      .addCase(deleteUser.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.loading = false
        state.users = state.users.filter((u) => u.id !== action.payload)
        state.totalCount -= 1
        if (state.selectedUser && state.selectedUser.id === action.payload) {
          state.selectedUser = null
        }
      })
      .addCase(deleteUser.rejected, (state, action) => {
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

      // Register user
      .addCase(registerUser.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false
        // Don't auto-login after registration
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      // Logout user
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null
        state.isAuthenticated = false
        state.error = null
      })
  },
})

export const { clearError, clearSelectedUser, setSelectedUser, setCurrentUser } = userSlice.actions
export default userSlice.reducer
