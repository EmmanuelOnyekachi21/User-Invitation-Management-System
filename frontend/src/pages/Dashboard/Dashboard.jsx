import { useAuth } from '../../context/AuthContext'
import { getRoleFromToken } from '../../utils/token'
import AdminDashboard from './AdminDashboard'
import UserDashboard from './UserDashboard'

const Dashboard = () => {
  const { accessToken } = useAuth()
  const role = getRoleFromToken(accessToken)

  return role === 'ADMIN' ? <AdminDashboard /> : <UserDashboard />
}

export default Dashboard
