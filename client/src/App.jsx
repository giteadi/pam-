import { Routes, Route } from "react-router-dom"
import Dashboard from "./components/dashboard"
import LoginForm from "./components/login-form"
import AuthGuard from "./components/auth-guard"
import { AuthProvider } from "./contexts/auth-context"
import { InspectionProvider } from "./contexts/inspection-context"
import { PropertyProvider } from "./contexts/property-context"
import { UserProvider } from "./contexts/user-context"
import TaskAssignment from "./components/task-assignment"
import InspectionsPage from "./components/inspections-page"
import PropertiesPage from "./components/properties-page"
import UserManagement from "./components/user-management"
import ProgressMonitoring from "./components/progress-monitoring"
import Navbar from "./components/Navbar"

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
                    <Navbar />
                    <Dashboard />
                  </AuthGuard>
                }
              />

              <Route
                path="/task-assignment"
                element={
                  <AuthGuard>
                    <Navbar />
                    <TaskAssignment />
                  </AuthGuard>
                }
              />

              <Route
                path="/inspections"
                element={
                  <AuthGuard>
                    <Navbar />
                    <InspectionsPage />
                  </AuthGuard>
                }
              />

              <Route
                path="/properties"
                element={
                  <AuthGuard>
                    <Navbar />
                    <PropertiesPage />
                  </AuthGuard>
                }
              />

              <Route
                path="/users"
                element={
                  <AuthGuard>
                    <Navbar />
                    <UserManagement />
                  </AuthGuard>
                }
              />

              <Route
                path="/progress"
                element={
                  <AuthGuard>
                    <Navbar />
                    <ProgressMonitoring />
                  </AuthGuard>
                }
              />

              <Route
                path="/"
                element={
                  <AuthGuard>
                    <Navbar />
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
