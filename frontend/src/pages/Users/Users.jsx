import { useState, useEffect, useCallback } from 'react'
import Navbar from '../../components/Navbar'
import api from '../../api/axios'

const ROLE_OPTIONS = ['', 'ADMIN', 'USER']
const STATUS_OPTIONS = ['', 'ACTIVE', 'BANNED', 'SUSPENDED', 'PENDING_VERIFICATION']

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

const Users = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [role, setRole] = useState('')
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({ count: 0, next: null, previous: null })
  const [feedback, setFeedback] = useState('')
  const [confirm, setConfirm] = useState(null) // { message, onConfirm }

  const fetchUsers = useCallback(() => {
    setLoading(true)
    const params = new URLSearchParams({ page })
    if (search) params.append('search', search)
    if (role) params.append('role', role)
    if (status) params.append('status', status)

    api.get(`/users/?${params}`)
      .then(({ data }) => {
        setUsers(data.data.results)
        setPagination({ count: data.data.count, next: data.data.next, previous: data.data.previous })
      })
      .catch(() => setFeedback('Failed to load users.'))
      .finally(() => setLoading(false))
  }, [search, role, status, page])

  // Debounce search — wait 400ms after user stops typing
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1)
      fetchUsers()
    }, 400)
    return () => clearTimeout(timer)
  }, [search])

  // Immediate fetch on filter/page change
  useEffect(() => { fetchUsers() }, [role, status, page])

  const handleRoleChange = (user, newRole) => {
    setConfirm({
      message: `Change ${user.email}'s role to ${newRole}?`,
      onConfirm: async () => {
        setConfirm(null)
        try {
          await api.patch(`/users/${user.id}/role/`, { role: newRole })
          setFeedback('Role updated.')
          fetchUsers()
        } catch (err) {
          setFeedback(err.response?.data?.message || 'Failed to update role.')
        }
      }
    })
  }

  const handleStatusChange = (user, newStatus) => {
    setConfirm({
      message: `Change ${user.email}'s status to ${newStatus}?`,
      onConfirm: async () => {
        setConfirm(null)
        try {
          await api.patch(`/users/${user.id}/status/`, { status: newStatus })
          setFeedback('Status updated.')
          fetchUsers()
        } catch (err) {
          setFeedback(err.response?.data?.message || 'Failed to update status.')
        }
      }
    })
  }

  return (
    <div className="min-vh-100 bg-light">
      <Navbar />
      {confirm && <ConfirmModal {...confirm} onCancel={() => setConfirm(null)} />}

      <div className="container mt-4">
        <h5 className="mb-4">Users</h5>

        {feedback && (
          <div className="alert alert-info py-2 d-flex justify-content-between">
            {feedback}
            <button className="btn-close btn-sm" onClick={() => setFeedback('')} />
          </div>
        )}

        {/* Filters */}
        <div className="row g-2 mb-3">
          <div className="col-md-5">
            <input
              className="form-control"
              placeholder="Search by name or email..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="col-md-3">
            <select className="form-select" value={role} onChange={e => { setRole(e.target.value); setPage(1) }}>
              <option value="">All Roles</option>
              {ROLE_OPTIONS.filter(Boolean).map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div className="col-md-3">
            <select className="form-select" value={status} onChange={e => { setStatus(e.target.value); setPage(1) }}>
              <option value="">All Statuses</option>
              {STATUS_OPTIONS.filter(Boolean).map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="card shadow-sm">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className="table-light">
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Joined Via</th>
                  <th>Date Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={7} className="text-center py-4 text-muted">Loading...</td></tr>
                ) : users.length === 0 ? (
                  <tr><td colSpan={7} className="text-center py-4 text-muted">No users found.</td></tr>
                ) : users.map(user => (
                  <tr key={user.id}>
                    <td>{user.first_name} {user.last_name}</td>
                    <td>{user.email}</td>
                    <td>
                      <select
                        className="form-select form-select-sm"
                        value={user.role}
                        onChange={e => handleRoleChange(user, e.target.value)}
                        style={{ width: 90 }}
                      >
                        <option value="ADMIN">ADMIN</option>
                        <option value="USER">USER</option>
                      </select>
                    </td>
                    <td>
                      <select
                        className="form-select form-select-sm"
                        value={user.status}
                        onChange={e => handleStatusChange(user, e.target.value)}
                        style={{ width: 160 }}
                      >
                        {STATUS_OPTIONS.filter(Boolean).map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </td>
                    <td>{user.joined_via}</td>
                    <td>{new Date(user.date_joined).toLocaleDateString()}</td>
                    <td>
                      <span className={`badge bg-${user.is_active ? 'success' : 'secondary'}`}>
                        {user.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        <div className="d-flex justify-content-between align-items-center mt-3">
          <small className="text-muted">{pagination.count} total users</small>
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

export default Users
