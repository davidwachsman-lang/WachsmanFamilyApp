// Admin Authentication Component
// One-time setup to get and store Google OAuth refresh token

import { useState, useEffect } from 'react'
import axios from 'axios'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

const getFunctionsUrl = () => {
  if (!SUPABASE_URL) {
    throw new Error('VITE_SUPABASE_URL is not configured')
  }
  return `${SUPABASE_URL}/functions/v1`
}

const AdminAuth = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Check if environment variables are set
  useEffect(() => {
    if (!SUPABASE_URL) {
      setError('VITE_SUPABASE_URL is not configured. Please check your .env.local file.')
    }
    if (!SUPABASE_ANON_KEY) {
      setError('VITE_SUPABASE_ANON_KEY is not configured. Please check your .env.local file and restart the dev server.')
    }
  }, [])

  const handleAdminLogin = async () => {
    setLoading(true)
    setError(null)

    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      setError('Missing environment variables. Please check your .env.local file and restart the dev server.')
      setLoading(false)
      return
    }

    try {
      const functionsUrl = getFunctionsUrl()
      console.log('Calling:', `${functionsUrl}/admin-login`)
      console.log('With headers:', {
        'Authorization': `Bearer ${SUPABASE_ANON_KEY?.substring(0, 20)}...`,
        'apikey': SUPABASE_ANON_KEY?.substring(0, 20) + '...'
      })
      
      const response = await axios.get(`${functionsUrl}/admin-login`, {
        headers: {
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'apikey': SUPABASE_ANON_KEY,
        },
      })

      if (response.data.authUrl) {
        // Redirect to Google OAuth
        window.location.href = response.data.authUrl
      } else {
        throw new Error('No auth URL received')
      }
    } catch (err) {
      console.error('Admin login error:', err)
      const errorMsg = err.response?.data?.error || err.response?.data?.message || err.message || 'Failed to initiate login'
      setError(`Error: ${errorMsg}. ${err.response?.status === 401 ? 'Make sure VITE_SUPABASE_ANON_KEY is set in .env.local and the dev server has been restarted.' : ''}`)
      setLoading(false)
    }
  }

  return (
    <div style={{
      padding: '20px',
      maxWidth: '600px',
      margin: '40px auto',
      background: 'white',
      borderRadius: '8px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
    }}>
      <h2>Admin Calendar Setup</h2>
      <p>
        This is a one-time setup to authorize access to your Google Calendar.
        After completing this, all users will be able to view calendar events without logging in.
      </p>

      {error && (
        <div style={{
          background: '#ffebee',
          border: '1px solid #f44336',
          padding: '12px',
          borderRadius: '4px',
          marginBottom: '20px',
          color: '#c62828'
        }}>
          {error}
        </div>
      )}

      <button
        onClick={handleAdminLogin}
        disabled={loading}
        style={{
          background: '#4caf50',
          color: 'white',
          border: 'none',
          padding: '12px 24px',
          borderRadius: '4px',
          fontSize: '16px',
          cursor: loading ? 'not-allowed' : 'pointer',
          opacity: loading ? 0.6 : 1
        }}
      >
        {loading ? 'Loading...' : 'Authorize Google Calendar Access'}
      </button>

      <div style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
        <p><strong>What happens:</strong></p>
        <ol>
          <li>You'll be redirected to Google to authorize access</li>
          <li>Grant permission to view your calendar</li>
          <li>A refresh token will be stored securely</li>
          <li>Calendar events will be available to all users</li>
        </ol>
      </div>
    </div>
  )
}

export default AdminAuth

