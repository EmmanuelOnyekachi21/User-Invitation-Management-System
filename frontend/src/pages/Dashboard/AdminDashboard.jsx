import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../../components/Navbar'
import api from '../../api/axios'

const StatCard = ({ label, value, loading }) => (
  <div className="col-md-4">
    <div className="card shadow-sm text-center p-3">
      <div className="fs-2 fw-bold text-primary">
        {loading ? <span className="spinner-border spinner-border-sm" /> : value}
      </div>
      <div className="text-muted small mt-1">{label}</div>
    </div>
  </div>
)

const AdminDashboard = () => {
  const navigate = useNavigate()
  const [stats, setStats] = useState(null)
  const [statsLoading, setStatsLoading] = useState(true)

  useEffect(() => {
    api.get('/dashboard/stats/')
      .then(({ data }) => setStats(data.data))
      .catch(() => setStats({ total: '-', pending: '-', accepted: '-' }))
      .finally(() => setStatsLoading(false))
  }, [])

  return (
    <div className="min-vh-100 bg-light">
      <Navbar />
      <div className="container mt-5">
        <h5 className="mb-4">Admin Dashboard</h5>

        {/* Stats */}
        <div className="row g-3 mb-5">
          <StatCard label="Total Invited" value={stats?.total} loading={statsLoading} />
          <StatCard label="Pending" value={stats?.pending} loading={statsLoading} />
          <StatCard label="Accepted" value={stats?.accepted} loading={statsLoading} />
        </div>

        {/* Actions */}
        <div className="row g-3">
          <div className="col-md-4">
            <div className="card h-100 shadow-sm">
              <div className="card-body">
                <h6 className="card-title">Invite User</h6>
                <p className="card-text text-muted small">
                  Send an invitation to onboard a new team member.
                </p>
                <button className="btn btn-primary btn-sm" onClick={() => navigate('/invite')}>
                  Send Invite
                </button>
              </div>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card h-100 shadow-sm">
              <div className="card-body">
                <h6 className="card-title">Manage Users</h6>
                <p className="card-text text-muted small">
                  View, suspend, or manage existing users.
                </p>
                <button className="btn btn-primary btn-sm" onClick={() => navigate('/users')}>
                  View Users
                </button>
              </div>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card h-100 shadow-sm">
              <div className="card-body">
                <h6 className="card-title">Invitations</h6>
                <p className="card-text text-muted small">
                  View and manage all sent invitations.
                </p>
                <button className="btn btn-primary btn-sm" onClick={() => navigate('/invitations')}>
                  View Invitations
                </button>
              </div>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card h-100 shadow-sm">
              <div className="card-body">
                <h6 className="card-title">Audit Logs</h6>
                <p className="card-text text-muted small">
                  Review a history of all actions taken across the system.
                </p>
                <button className="btn btn-outline-secondary btn-sm" disabled>
                  Coming Soon
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
