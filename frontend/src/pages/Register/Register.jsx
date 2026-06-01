import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import api from '../../api/axios'

const Register = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get('token')

  const [tokenState, setTokenState] = useState('validating') // validating | valid | invalid
  const [invitedEmail, setInvitedEmail] = useState('')
  const [form, setForm] = useState({ first_name: '', last_name: '', password: '', confirm_password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!token) {
      setTokenState('invalid')
      return
    }

    const validateToken = async () => {
      try {
        const { data } = await api.post('/invitations/validate-token/', { token })
        setInvitedEmail(data.data.email)
        setTokenState('valid')
      } catch {
        setTokenState('invalid')
      }
    }

    validateToken()
  }, [token])

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setError('')
  }

  const validate = () => {
    if (!form.first_name || !form.last_name) return 'First and last name are required.'
    if (!form.password) return 'Password is required.'
    if (form.password.length < 8) return 'Password must be at least 8 characters.'
    if (form.password !== form.confirm_password) return 'Passwords do not match.'
    return null
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const validationError = validate()
    if (validationError) return setError(validationError)

    setLoading(true)
    try {
      await api.post('/invitations/accept/', {
        token,
        first_name: form.first_name,
        last_name: form.last_name,
        password: form.password,
      })
      navigate('/check-email')
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Loading state while validating token
  if (tokenState === 'validating') {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center">
        <div className="text-center text-muted">Validating your invitation...</div>
      </div>
    )
  }

  // Invalid or expired token
  if (tokenState === 'invalid') {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center">
        <div className="text-center">
          <h5 className="text-danger mb-2">Invalid Invitation</h5>
          <p className="text-muted">This invitation link is invalid or has expired.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <div className="card shadow-sm p-4" style={{ width: '100%', maxWidth: 440 }}>
        <h4 className="mb-4 text-center fw-semibold">Complete Registration</h4>

        {error && <div className="alert alert-danger py-2">{error}</div>}

        <form onSubmit={handleSubmit} noValidate>
          <div className="mb-3">
            <label className="form-label">Email</label>
            {/* Read-only — email is bound to the invitation token */}
            <input
              type="email"
              className="form-control bg-light"
              value={invitedEmail}
              readOnly
            />
          </div>

          <div className="mb-3">
            <label className="form-label">First Name</label>
            <input
              type="text"
              name="first_name"
              className="form-control"
              value={form.first_name}
              onChange={handleChange}
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Last Name</label>
            <input
              type="text"
              name="last_name"
              className="form-control"
              value={form.last_name}
              onChange={handleChange}
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Password</label>
            <input
              type="password"
              name="password"
              className="form-control"
              value={form.password}
              onChange={handleChange}
            />
          </div>

          <div className="mb-4">
            <label className="form-label">Confirm Password</label>
            <input
              type="password"
              name="confirm_password"
              className="form-control"
              value={form.confirm_password}
              onChange={handleChange}
            />
          </div>

          <button type="submit" className="btn btn-primary w-100" disabled={loading}>
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default Register
