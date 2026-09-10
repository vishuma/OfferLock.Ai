import React from 'react'
import { useAuth } from '../hooks/useAuth'
import { Navigate } from 'react-router'

// Destructure children from props
function Protected({ children }) {
  const { loading, user } = useAuth()

  if (loading) {
    return (
      <main>
        <h1>Loading...</h1>
      </main>
    )
  }

  if (!user) {
    return <Navigate to={'/login'} replace />
  }

  return children
}

export default Protected
