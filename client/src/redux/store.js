import { configureStore } from "@reduxjs/toolkit"
import propertyReducer from "./slices/propertySlice"
import userReducer from "./slices/userSlice"
import dashboardReducer from "./slices/dashboardSlice"
import inspectionReducer from "./slices/inspectionSlice"

export const store = configureStore({
  reducer: {
    properties: propertyReducer,
    users: userReducer,
    dashboard: dashboardReducer,
    inspections: inspectionReducer,
  },
})

export default store
