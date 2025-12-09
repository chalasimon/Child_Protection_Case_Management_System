// authSlice.js
import { createSlice } from '@reduxjs/toolkit'

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    token: null,
    isAuthenticated: false,
    loading: false,
    error: null,
  },
  reducers: {
    setCredentials: (state, action) => {
      const { user, token } = action.payload
      state.user = user
      state.token = token
      state.isAuthenticated = true
      localStorage.setItem('token', token)
    },
    logout: (state) => {
      state.user = null
      state.token = null
      state.isAuthenticated = false
      localStorage.removeItem('token')
    },
    // ADD THIS updateUser reducer:
    updateUser: (state, action) => {
      if (state.user) {
        // Merge existing user data with new updates
        state.user = { ...state.user, ...action.payload }
      }
    },
  },
})

// UPDATE THE EXPORT TO INCLUDE updateUser:
export const { setCredentials, logout, updateUser } = authSlice.actions
export default authSlice.reducer