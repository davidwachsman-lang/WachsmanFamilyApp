import axios from 'axios'
import { getAccessToken, ensureValidToken, isAuthenticated } from './googleAuth'

const CALENDAR_ID = import.meta.env.VITE_GOOGLE_CALENDAR_ID

// Debug: Log environment variables
console.log('=== Google Calendar Configuration ===')
console.log('CALENDAR_ID loaded:', CALENDAR_ID ? '✅ Yes (' + CALENDAR_ID.substring(0, 25) + '...)' : '❌ NO')
console.log('Authentication:', isAuthenticated() ? '✅ Authenticated' : '❌ Not authenticated')
console.log('===================================')

const BASE_URL = 'https://www.googleapis.com/calendar/v3'

/**
 * Fetch events from Google Calendar using OAuth2
 * @param {Date} timeMin - Start time for events
 * @param {Date} timeMax - End time for events
 * @returns {Promise<Array>} Array of calendar events
 */
export const fetchCalendarEvents = async (timeMin, timeMax) => {
  // Check if calendar ID is set
  if (!CALENDAR_ID || CALENDAR_ID === 'your_calendar_id') {
    const errorMsg = 'Google Calendar ID is missing or contains placeholder text. Please set VITE_GOOGLE_CALENDAR_ID in your .env.local file with your actual calendar ID (usually an email address).'
    console.error('❌ Google Calendar ID not loaded!')
    console.error('CALENDAR_ID:', CALENDAR_ID ? `Present but contains placeholder: "${CALENDAR_ID.substring(0, 20)}..."` : 'Missing')
    throw new Error(errorMsg)
  }

  // Check if authenticated
  try {
    await ensureValidToken()
  } catch (error) {
    throw new Error('Please sign in to Google Calendar to view events.')
  }

  try {
    const accessToken = getAccessToken()
    if (!accessToken) {
      throw new Error('No access token. Please sign in to Google Calendar.')
    }

    const timeMinISO = timeMin.toISOString()
    const timeMaxISO = timeMax.toISOString()
    
    const url = `${BASE_URL}/calendars/${encodeURIComponent(CALENDAR_ID)}/events`
    console.log('📅 Fetching calendar events...')
    console.log('Calendar ID:', CALENDAR_ID.substring(0, 20) + '...')
    console.log('Time range:', timeMinISO, 'to', timeMaxISO)
    
    const response = await axios.get(url, {
      params: {
        timeMin: timeMinISO,
        timeMax: timeMaxISO,
        singleEvents: true,
        orderBy: 'startTime',
      },
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })

    const events = response.data.items || []
    console.log(`✅ Found ${events.length} events`)
    if (events.length > 0) {
      console.log('Sample event:', events[0])
      // Log event fields to verify what's being returned
      const sampleEvent = events[0]
      console.log('Event fields:', {
        summary: sampleEvent.summary,
        description: sampleEvent.description ? 'Present' : 'Missing',
        location: sampleEvent.location ? 'Present' : 'Missing',
        start: sampleEvent.start,
        end: sampleEvent.end
      })
    }
    return events
  } catch (error) {
    console.error('❌ Error fetching calendar events:', error)
    
    if (error.response) {
      const status = error.response.status
      const apiError = error.response.data?.error
      let errorMsg = apiError?.message || 'Failed to fetch calendar events'
      
      if (status === 401) {
        errorMsg = 'Authentication expired. Please sign in again.'
        // Clear invalid token (handled in googleAuth service)
      } else if (status === 403) {
        errorMsg = 'Access forbidden. Please ensure you have permission to view this calendar, or try signing in again.'
      } else if (status === 404) {
        errorMsg = 'Calendar not found. Please verify that VITE_GOOGLE_CALENDAR_ID in your .env.local file is correct.'
      } else if (status === 400) {
        errorMsg = 'Invalid request. Please check your calendar ID and try again.'
      }
      
      console.error('API Error Status:', status)
      console.error('API Error Response:', JSON.stringify(error.response.data, null, 2))
      throw new Error(errorMsg)
    }
    
    // Handle network errors or other non-API errors
    if (error.code === 'ERR_NETWORK' || error.message.includes('Network Error')) {
      throw new Error('Network error. Please check your internet connection and try again.')
    }
    
    throw error
  }
}

/**
 * Get events for the current week (Monday-Friday view)
 * Shows current/upcoming week (if Saturday or Sunday, show next week)
 * @returns {Promise<Array>} Array of calendar events for the week
 */
export const getWeekEvents = async () => {
  const now = new Date()
  const startOfWeek = new Date(now)
  
  // Find Monday of the week we want to show (same logic as CalendarView)
  // If today is Saturday (6) or Sunday (0), show next week's Monday-Friday
  // Otherwise, show this week's Monday-Friday
  const dayOfWeek = now.getDay()
  let diff
  if (dayOfWeek === 0) {
    // Sunday - show next week (go forward 1 day to Monday)
    diff = -1 // Negative means add days
  } else if (dayOfWeek === 6) {
    // Saturday - show next week (go forward 2 days to Monday)
    diff = -2 // Negative means add days
  } else {
    // Monday (1) through Friday (5) - show this week (go back to Monday)
    diff = dayOfWeek - 1 // Positive means subtract days
  }
  
  startOfWeek.setDate(now.getDate() - diff) // Subtracting negative = adding
  startOfWeek.setHours(0, 0, 0, 0)
  
  // Fetch through Sunday to ensure we get all events for the week
  const endOfWeek = new Date(startOfWeek)
  endOfWeek.setDate(startOfWeek.getDate() + 6) // Monday + 6 days = Sunday
  endOfWeek.setHours(23, 59, 59, 999)

  return fetchCalendarEvents(startOfWeek, endOfWeek)
}

/**
 * Get events for the current month
 * @returns {Promise<Array>} Array of calendar events for the month
 */
export const getMonthEvents = async () => {
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  startOfMonth.setHours(0, 0, 0, 0)
  
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)
  endOfMonth.setHours(23, 59, 59, 999)

  return fetchCalendarEvents(startOfMonth, endOfMonth)
}
