import { Routes, Route } from "react-router-dom"
import Dashboard from "./components/dashboard"
import LoginForm from "./components/login-form"
import AuthGuard from "./components/auth-guard"
import { AuthProvider } from "./contexts/auth-context"
import { InspectionProvider } from "./contexts/inspection-context"
import { PropertyProvider } from "./contexts/property-context"
import { UserProvider } from "./contexts/user-context"
import TaskAssignment from "./components/task-assignment"

export default function App() {
  return (
    <AuthProvider>
      <UserProvider>
        <PropertyProvider>
          <InspectionProvider>
            <Routes>
              <Route path="/login" element={<LoginForm />} />

              <Route
                path="/dashboard"
                element={
                  <AuthGuard>
                    <Dashboard />
                  </AuthGuard>
                }
              />

              {/* Task Assignment Route */}
              <Route
                path="/task-assignment"
                element={
                  <AuthGuard>
                    <TaskAssignment />
                  </AuthGuard>
                }
              />

              <Route
                path="/"
                element={
                  <AuthGuard>
                    <Dashboard />
                  </AuthGuard>
                }
              />

              <Route path="*" element={<h1>PAGE NOT FOUND !</h1>} />
            </Routes>
          </InspectionProvider>
        </PropertyProvider>
      </UserProvider>
    </AuthProvider>
  )
}
