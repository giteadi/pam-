import { Routes, Route } from 'react-router-dom'
import Dashboard from "./components/dashboard"
import LoginForm from './components/login-form'
import { AuthProvider } from './contexts/auth-context' // Ensure correct import

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path='/' element={<Dashboard />} />
        <Route path='/login' element={<LoginForm />} />
        <Route path='*' element={<h1>PAGE NOT FOUND !</h1>} />
      </Routes>
        </AuthProvider>
  )
}