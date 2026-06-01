import { createContext, useContext, useState, useEffect } from 'react'
import api from '../api/axios'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [accessToken, setAccessToken] = useState(localStorage.getItem('access_token'))
  const [loading, setLoading] = useState(true)

  // On app load, if a token exists try to refresh it to confirm it's still valid
  useEffect(() => {
    const init = async () => {
      if (accessToken) {
        try {
          const { data } = await api.post('/auth/token/refresh/')
          const newToken = data.data.access
          localStorage.setItem('access_token', newToken)
          setAccessToken(newToken)
        } catch {
          // Refresh failed — token is dead, clear everything
          localStorage.removeItem('access_token')
          setAccessToken(null)
        }
      }
      setLoading(false)
    }
    init()
  }, [])

  const login = (token) => {
    localStorage.setItem('access_token', token)
    setAccessToken(token)
  }

  const logout = async () => {
    try {
      await api.post('/auth/logout/')
    } catch {
      // Even if logout call fails, clear local state
    }
    localStorage.removeItem('access_token')
    setAccessToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, setUser, accessToken, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
