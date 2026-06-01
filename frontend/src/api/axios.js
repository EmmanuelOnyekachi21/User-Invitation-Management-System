import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1/',
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,  // required for cookies to be sent cross origin
})

// Request interceptor — attach JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Track if already trying to refresh to prevent infinite loop
let isRefreshing = false

// Response interceptor — handle 401s
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config

    // Skip refresh for auth endpoints — a 401 there is a real credential failure
    const isAuthEndpoint = original.url?.includes('/auth/login') || original.url?.includes('/auth/token/refresh')

    // If 401 and we haven't already tried refreshing
    if (error.response?.status === 401 && !isRefreshing && !isAuthEndpoint) {
      isRefreshing = true
      try {
        const { data } = await api.post('/auth/token/refresh/')
        localStorage.setItem('access_token', data.data.access)

        // Retry the original request with new token
        original.headers.Authorization = `Bearer ${data.data.access}`
        return api(original)
      } catch {
        // Refresh failed — clear storage and redirect to login
        localStorage.removeItem('access_token')
        window.location.href = '/login'
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)

export default api
