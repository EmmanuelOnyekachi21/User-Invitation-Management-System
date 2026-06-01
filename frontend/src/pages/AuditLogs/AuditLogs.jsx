import { useState, useEffect, useCallback } from 'react'
import Navbar from '../../components/Navbar'
import api from '../../api/axios'

// All action types — used for the filter dropdown
const ACTION_OPTIONS = [
  '', 'USER_LOGIN', 'USER_LOGOUT',
  'INVITE_CREATED', 'INVITE_ACCEPTED', 'INVITE_REVOKED',
  'ROLE_UPDATED', 'STATUS_UPDATED',
]

// Make action strings more readable in the table
const formatAction = (action) =>
  action.replace(/_/g, ' ').toLowerCase().replace(/^\w/, c => c.toUpperCase())

// Metadata cell — shows a short summary, expands to full JSON on click
const MetaCell = ({ data }) => {
  const [expanded, setExpanded] = useState(false)

  if (!data || Object.keys(data).length === 0) return <span className="text-muted">—</span>

  const summary = Object.entries(data)
    .map(([k, v]) => `${k}: ${v}`)
    .join(', ')
    .slice(0, 40)

  return (
    <span
      className="text-muted small"
      style={{ cursor: 'pointer' }}
      title="Click to expand"
      onClick={() => setExpanded(e => !e)}
    >
      {expanded
        ? <pre className="mb-0" style={{ fontSize: 11 }}>{JSON.stringify(data, null, 2)}</pre>
        : `${summary}${summary.length >= 40 ? '…' : ''}`
      }
    </span>
  )
}

const AuditLogs = () => {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [action, setAction] = useState('')
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({ count: 0, next: null, previous: null })
  const [error, setError] = useState('')

  const fetchLogs = useCallback(() => {
    setLoading(true)
    const params = new URLSearchParams({ page })
    if (action) params.append('action', action)

    api.get(`/audit-logs/?${params}`)
      .then(({ data }) => {
        setLogs(data.data.results)
        setPagination({ count: data.data.count, next: data.data.next, previous: data.data.previous })
      })
      .catch(() => setError('Failed to load audit logs.'))
      .finally(() => setLoading(false))
  }, [action, page])

  useEffect(() => { fetchLogs() }, [action, page])

  return (
    <div className="min-vh-100 bg-light">
      <Navbar />

      <div className="container mt-4">
        <h5 className="mb-4">Audit Logs</h5>

        {error && <div className="alert alert-danger py-2">{error}</div>}

        {/* Filter */}
        <div className="row g-2 mb-3">
          <div className="col-md-3">
            <select
              className="form-select"
              value={action}
              onChange={e => { setAction(e.target.value); setPage(1) }}
            >
              <option value="">All Actions</option>
              {ACTION_OPTIONS.filter(Boolean).map(a => (
                <option key={a} value={a}>{formatAction(a)}</option>
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
                  <th>Actor</th>
                  <th>Action</th>
                  <th>Target</th>
                  <th>Details</th>
                  <th>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={5} className="text-center py-4 text-muted">Loading...</td></tr>
                ) : logs.length === 0 ? (
                  <tr><td colSpan={5} className="text-center py-4 text-muted">No logs found.</td></tr>
                ) : logs.map(log => (
                  <tr key={log.id}>
                    <td className="small">{log.actor}</td>
                    <td><span className="badge bg-secondary">{formatAction(log.action)}</span></td>
                    <td className="small text-muted">{log.target_email || '—'}</td>
                    <td><MetaCell data={log.metadata} /></td>
                    <td className="small text-muted">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        <div className="d-flex justify-content-between align-items-center mt-3">
          <small className="text-muted">{pagination.count} total entries</small>
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

export default AuditLogs
