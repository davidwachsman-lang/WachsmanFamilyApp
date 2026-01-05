// New Calendar API Service - fetches from backend instead of direct OAuth
import axios from 'axios'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

/**
 * Get the base URL for Supabase Edge Functions
 */
const getFunctionsUrl = () => {
  if (!SUPABASE_URL) {
    throw new Error('VITE_SUPABASE_URL is not configured')
  }
  // Supabase Edge Functions are at: https://{project-ref}.supabase.co/functions/v1/{function-name}
  return `${SUPABASE_URL}/functions/v1`
}

/**
 * Get calendar events from the backend API
 * @param {Date} timeMin - Start time for events
 * @param {Date} timeMax - End time for events
 * @returns {Promise<Array>} Array of calendar events
 */
export const fetchCalendarEvents = async (timeMin, timeMax) => {
  try {
    const timeMinISO = timeMin.toISOString()
    const timeMaxISO = timeMax.toISOString()

    const functionsUrl = getFunctionsUrl()
    const response = await axios.get(`${functionsUrl}/calendar-events`, {
      params: {
        timeMin: timeMinISO,
        timeMax: timeMaxISO,
      },
      headers: {
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'apikey': SUPABASE_ANON_KEY,
      },
    })

    return response.data.events || []
  } catch (error) {
    console.error('Error fetching calendar events:', error)
    const errorMessage = error.response?.data?.error || error.message || 'Failed to fetch calendar events'
    throw new Error(errorMessage)
  }
}

/**
 * Get events for the current week (Monday-Friday view)
 */
export const getWeekEvents = async () => {
  const now = new Date()
  const startOfWeek = new Date(now)
  const dayOfWeek = now.getDay()

  // Calculate Monday of the week
  if (dayOfWeek === 0) {
    startOfWeek.setDate(now.getDate() + 1)
  } else if (dayOfWeek === 6) {
    startOfWeek.setDate(now.getDate() + 2)
  } else {
    startOfWeek.setDate(now.getDate() - (dayOfWeek - 1))
  }
  startOfWeek.setHours(0, 0, 0, 0)

  const endOfWeek = new Date(startOfWeek)
  endOfWeek.setDate(startOfWeek.getDate() + 6)
  endOfWeek.setHours(23, 59, 59, 999)

  return fetchCalendarEvents(startOfWeek, endOfWeek)
}

/**
 * Get events for the current month
 */
export const getMonthEvents = async () => {
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  startOfMonth.setHours(0, 0, 0, 0)

  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)
  endOfMonth.setHours(23, 59, 59, 999)

  return fetchCalendarEvents(startOfMonth, endOfMonth)
}

