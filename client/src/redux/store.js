import { configureStore } from "@reduxjs/toolkit"
import propertyReducer from "./slices/propertySlice"
import userReducer from "./slices/userSlice"
import dashboardReducer from "./slices/dashboardSlice"
import inspectionReducer from "./slices/inspectionSlice"
import inspectorReducer from "./slices/inspectorSlice"

export const store = configureStore({
  reducer: {
    properties: propertyReducer,
    users: userReducer,
    dashboard: dashboardReducer,
    inspections: inspectionReducer,
    inspectors: inspectorReducer,
  },
})

export default store
