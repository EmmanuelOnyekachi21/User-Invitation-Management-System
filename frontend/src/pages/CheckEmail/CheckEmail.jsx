import { useNavigate } from 'react-router-dom'

const CheckEmail = () => {
  const navigate = useNavigate()

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <div className="text-center">
        <h4 className="mb-3">You're all set</h4>
        <p className="text-muted mb-4">Your account has been created. You can now sign in.</p>
        <button className="btn btn-primary" onClick={() => navigate('/login')}>
          Go to Login
        </button>
      </div>
    </div>
  )
}

export default CheckEmail
