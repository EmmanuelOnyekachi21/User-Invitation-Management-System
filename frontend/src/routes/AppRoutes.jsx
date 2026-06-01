import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from './ProtectedRoute'
import Login from '../pages/Login/Login'
import Dashboard from '../pages/Dashboard/Dashboard'
import InviteUser from '../pages/Invite/InviteUser'
import Register from '../pages/Register/Register'
import CheckEmail from '../pages/CheckEmail/CheckEmail'
import Users from '../pages/Users/Users'
import Invitations from '../pages/Invitations/Invitations'

const AppRoutes = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/check-email" element={<CheckEmail />} />

      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/invite" element={<ProtectedRoute adminOnly><InviteUser /></ProtectedRoute>} />
      <Route path="/users" element={<ProtectedRoute adminOnly><Users /></ProtectedRoute>} />
      <Route path="/invitations" element={<ProtectedRoute adminOnly><Invitations /></ProtectedRoute>} />

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  </BrowserRouter>
)

export default AppRoutes