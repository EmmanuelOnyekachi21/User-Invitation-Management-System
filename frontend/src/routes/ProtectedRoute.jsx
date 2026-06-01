import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getRoleFromToken } from '../utils/token'

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { accessToken, loading } = useAuth()

  if (loading) return null
  if (!accessToken) return <Navigate to="/login" replace />

  if (adminOnly && getRoleFromToken(accessToken) !== 'ADMIN') {
    return <Navigate to="/dashboard" replace />
  }

  return children
}

export default ProtectedRoute
