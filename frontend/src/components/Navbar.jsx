import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const Navbar = () => {
  const { logout } = useAuth()
  const navigate = useNavigate()

  return (
    <nav className="navbar navbar-light bg-white border-bottom px-4">
      <span
        className="navbar-brand fw-semibold"
        style={{ cursor: 'pointer' }}
        onClick={() => navigate('/dashboard')}
      >
        Elevare
      </span>
      <button className="btn btn-outline-secondary btn-sm" onClick={logout}>
        Logout
      </button>
    </nav>
  )
}

export default Navbar
