export const getTokenPayload = (token) => {
  try {
    return JSON.parse(atob(token.split('.')[1]))
  } catch {
    return null
  }
}

export const getRoleFromToken = (token) => {
  const payload = getTokenPayload(token)
  return payload?.role || null
}
