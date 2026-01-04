/**
 * Google OAuth2 Authentication Service
 * Uses Google Identity Services (GIS) for OAuth2 authentication
 */

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID
const CALENDAR_ID = import.meta.env.VITE_GOOGLE_CALENDAR_ID

// Google Identity Services callback
let tokenClient = null
let accessToken = null
let tokenPromiseResolve = null
let tokenPromiseReject = null

/**
 * Initialize Google Identity Services
 */
export const initGoogleAuth = () => {
  return new Promise((resolve, reject) => {
    if (!window.google) {
      reject(new Error('Google Identity Services library not loaded. Please check index.html'))
      return
    }

    if (!CLIENT_ID) {
      reject(new Error('VITE_GOOGLE_CLIENT_ID is not set in .env.local'))
      return
    }

    try {
      tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: 'https://www.googleapis.com/auth/calendar.readonly',
        callback: (response) => {
          if (response.error) {
            console.error('OAuth error:', response.error)
            if (tokenPromiseReject) {
              tokenPromiseReject(new Error(`OAuth error: ${response.error}`))
              tokenPromiseResolve = null
              tokenPromiseReject = null
            }
            return
          }
          accessToken = response.access_token
          // Store token in localStorage (persists across sessions)
          localStorage.setItem('google_calendar_token', accessToken)
          // Store expiration time if available (Google tokens typically expire in 1 hour)
          if (response.expires_in) {
            const expiresAt = Date.now() + (response.expires_in * 1000)
            localStorage.setItem('google_calendar_token_expires', expiresAt.toString())
          }
          console.log('✅ OAuth token received')
          if (tokenPromiseResolve) {
            tokenPromiseResolve(accessToken)
            tokenPromiseResolve = null
            tokenPromiseReject = null
          }
        },
      })
      resolve()
    } catch (error) {
      console.error('Error initializing Google Auth:', error)
      reject(error)
    }
  })
}

/**
 * Check if user is already authenticated
 */
export const isAuthenticated = () => {
  const storedToken = localStorage.getItem('google_calendar_token')
  if (storedToken) {
    // Check if token is expired
    const expiresAt = localStorage.getItem('google_calendar_token_expires')
    if (expiresAt && Date.now() > parseInt(expiresAt, 10)) {
      // Token expired, clear it
      localStorage.removeItem('google_calendar_token')
      localStorage.removeItem('google_calendar_token_expires')
      accessToken = null
      return false
    }
    accessToken = storedToken
    return true
  }
  return false
}

/**
 * Get the current access token
 */
export const getAccessToken = () => {
  if (accessToken) {
    return accessToken
  }
  const storedToken = localStorage.getItem('google_calendar_token')
  if (storedToken) {
    // Check if token is expired
    const expiresAt = localStorage.getItem('google_calendar_token_expires')
    if (expiresAt && Date.now() > parseInt(expiresAt, 10)) {
      // Token expired
      localStorage.removeItem('google_calendar_token')
      localStorage.removeItem('google_calendar_token_expires')
      return null
    }
    accessToken = storedToken
    return storedToken
  }
  return null
}

/**
 * Request authentication token
 * @param {boolean} forcePrompt - If true, always show consent prompt. If false, try silent refresh first.
 */
export const requestToken = (forcePrompt = false) => {
  return new Promise((resolve, reject) => {
    if (!tokenClient) {
      initGoogleAuth()
        .then(() => {
          tokenPromiseResolve = resolve
          tokenPromiseReject = reject
          tokenClient.requestAccessToken({ prompt: forcePrompt ? 'consent' : 'none' })
        })
        .catch(reject)
    } else {
      tokenPromiseResolve = resolve
      tokenPromiseReject = reject
      // Try silent refresh first, then fall back to consent if needed
      tokenClient.requestAccessToken({ prompt: forcePrompt ? 'consent' : 'none' })
    }

    // Timeout after 60 seconds
    setTimeout(() => {
      if (tokenPromiseReject) {
        tokenPromiseReject(new Error('Authentication timeout. Please try again.'))
        tokenPromiseResolve = null
        tokenPromiseReject = null
      }
    }, 60000)
  })
}

/**
 * Sign out and clear token
 */
export const signOut = () => {
  const token = getAccessToken()
  if (token && window.google) {
    window.google.accounts.oauth2.revoke(token, () => {
      console.log('Token revoked')
    })
  }
  accessToken = null
  localStorage.removeItem('google_calendar_token')
  localStorage.removeItem('google_calendar_token_expires')
}

/**
 * Check if token is expired and refresh if needed
 */
export const ensureValidToken = async () => {
  let token = getAccessToken()
  
  // Check if token exists and is not expired
  const expiresAt = localStorage.getItem('google_calendar_token_expires')
  const isExpired = expiresAt && Date.now() > parseInt(expiresAt, 10)
  
  if (!token || isExpired) {
    // Try to refresh silently (no prompt if user is still logged into Google)
    try {
      console.log('Token expired or missing, attempting silent refresh...')
      await initGoogleAuth() // Ensure tokenClient is initialized
      token = await requestToken(false) // Try silent refresh
      console.log('✅ Token refreshed successfully')
      return token
    } catch (error) {
      console.log('Silent refresh failed, user needs to sign in again')
      // Clear invalid token
      localStorage.removeItem('google_calendar_token')
      localStorage.removeItem('google_calendar_token_expires')
      accessToken = null
      throw new Error('Please sign in to Google Calendar.')
    }
  }

  return token
}

