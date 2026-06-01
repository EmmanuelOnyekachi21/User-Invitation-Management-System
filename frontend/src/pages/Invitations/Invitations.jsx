import { useState, useEffect, useCallback } from 'react'
import Navbar from '../../components/Navbar'
import api from '../../api/axios'

const STATUS_OPTIONS = ['', 'PENDING', 'ACCEPTED', 'REVOKED', 'EXPIRED']

const humanExpiry = (expiresAt, status) => {
  if (status !== 'PENDING') return '—'
  const diff = new Date(expiresAt) - new Date()
  if (diff <= 0) return 'Expired'
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  if (days > 0) return `Expires in ${days}d ${hours}h`
  return `Expires in ${hours}h`
}

const statusBadge = (status) => {
  const map = {
    PENDING: 'warning',
    ACCEPTED: 'success',
    REVOKED: 'secondary',
    EXPIRED: 'danger',
  }
  return <span className={`badge bg-${map[status] || 'secondary'}`}>{status}</span>
}

const ConfirmModal = ({ message, onConfirm, onCancel }) => (
  <div className="modal d-block" style={{ background: 'rgba(0,0,0,0.4)' }}>
    <div className="modal-dialog modal-dialog-centered">
      <div className="modal-content">
        <div className="modal-body py-4 text-center">{message}</div>
        <div className="modal-footer justify-content-center border-0">
          <button className="btn btn-secondary btn-sm" onClick={onCancel}>Cancel</button>
          <button className="btn btn-danger btn-sm" onClick={onConfirm}>Confirm</button>
        </div>
      </div>
    </div>
  </div>
)

const Invitations = () => {
  const [invitations, setInvitations] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({ count: 0, next: null, previous: null })
  const [feedback, setFeedback] = useState({ msg: '', type: 'info' })
  const [confirm, setConfirm] = useState(null)

  const fetchInvitations = useCallback(() => {
    setLoading(true)
    const params = new URLSearchParams({ page })
    if (search) params.append('search', search)
    if (status) params.append('status', status)

    api.get(`/invitations/?${params}`)
      .then(({ data }) => {
        setInvitations(data.data.results)
        setPagination({ count: data.data.count, next: data.data.next, previous: data.data.previous })
      })
      .catch(() => setFeedback({ msg: 'Failed to load invitations.', type: 'danger' }))
      .finally(() => setLoading(false))
  }, [search, status, page])

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => { setPage(1); fetchInvitations() }, 400)
    return () => clearTimeout(timer)
  }, [search])

  useEffect(() => { fetchInvitations() }, [status, page])

  const handleRevoke = (invitation) => {
    setConfirm({
      message: `Revoke invitation sent to ${invitation.email}?`,
      onConfirm: async () => {
        setConfirm(null)
        try {
          await api.delete(`/invitations/${invitation.id}/revoke/`)
          setFeedback({ msg: 'Invitation revoked.', type: 'success' })
          fetchInvitations()
        } catch (err) {
          setFeedback({ msg: err.response?.data?.message || 'Failed to revoke.', type: 'danger' })
        }
      }
    })
  }

  return (
    <div className="min-vh-100 bg-light">
      <Navbar />
      {confirm && <ConfirmModal {...confirm} onCancel={() => setConfirm(null)} />}

      <div className="container mt-4">
        <h5 className="mb-4">Invitations</h5>

        {feedback.msg && (
          <div className={`alert alert-${feedback.type} py-2 d-flex justify-content-between`}>
            {feedback.msg}
            <button className="btn-close btn-sm" onClick={() => setFeedback({ msg: '' })} />
          </div>
        )}

        {/* Filters */}
        <div className="row g-2 mb-3">
          <div className="col-md-6">
            <input
              className="form-control"
              placeholder="Search by email..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="col-md-3">
            <select
              className="form-select"
              value={status}
              onChange={e => { setStatus(e.target.value); setPage(1) }}
            >
              <option value="">All Statuses</option>
              {STATUS_OPTIONS.filter(Boolean).map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="card shadow-sm">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className="table-light">
                <tr>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Invited By</th>
                  <th>Date Sent</th>
                  <th>Expires</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={7} className="text-center py-4 text-muted">Loading...</td></tr>
                ) : invitations.length === 0 ? (
                  <tr><td colSpan={7} className="text-center py-4 text-muted">No invitations found.</td></tr>
                ) : invitations.map(inv => (
                  <tr key={inv.id}>
                    <td>{inv.email}</td>
                    <td>{inv.role}</td>
                    <td>{statusBadge(inv.status)}</td>
                    <td>{inv.invited_by || '—'}</td>
                    <td>{new Date(inv.created_at).toLocaleDateString()}</td>
                    <td className="small text-muted">{humanExpiry(inv.expires_at, inv.status)}</td>
                    <td>
                      {inv.status === 'PENDING' && (
                        <button
                          className="btn btn-outline-danger btn-sm"
                          onClick={() => handleRevoke(inv)}
                        >
                          Revoke
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        <div className="d-flex justify-content-between align-items-center mt-3">
          <small className="text-muted">{pagination.count} total invitations</small>
          <div className="d-flex gap-2">
            <button
              className="btn btn-outline-secondary btn-sm"
              disabled={!pagination.previous}
              onClick={() => setPage(p => p - 1)}
            >
              Previous
            </button>
            <span className="btn btn-light btn-sm disabled">Page {page}</span>
            <button
              className="btn btn-outline-secondary btn-sm"
              disabled={!pagination.next}
              onClick={() => setPage(p => p + 1)}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Invitations
