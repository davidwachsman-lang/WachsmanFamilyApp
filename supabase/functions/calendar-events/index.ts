// Supabase Edge Function: Calendar Events API
// Public endpoint that fetches calendar events using stored refresh token

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const {
      GOOGLE_CLIENT_ID,
      GOOGLE_CLIENT_SECRET,
      GOOGLE_CALENDAR_ID,
      SUPABASE_SERVICE_ROLE_KEY,
    } = Deno.env.toObject()

    if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
      throw new Error('Missing Google OAuth credentials')
    }

    if (!GOOGLE_CALENDAR_ID) {
      throw new Error('Missing Google Calendar ID')
    }

    // Construct Supabase URL from request hostname
    const url = new URL(req.url)
    const host = url.hostname
    const projectRef = host.split('.')[0]
    const supabaseUrl = `https://${projectRef}.supabase.co`

    if (!SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('SUPABASE_SERVICE_ROLE_KEY not found in environment')
    }

    // Get time range from query params (optional)
    const timeMin = url.searchParams.get('timeMin') || new Date().toISOString()
    const timeMax = url.searchParams.get('timeMax') || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // Default: next 30 days

    // Get stored tokens from Supabase
    const supabase = createClient(supabaseUrl, SUPABASE_SERVICE_ROLE_KEY)
    const { data: tokenData, error: tokenError } = await supabase
      .from('google_calendar_tokens')
      .select('refresh_token, access_token, expires_at')
      .eq('id', 1)
      .single()

    if (tokenError || !tokenData) {
      throw new Error('No stored refresh token found. Please complete the admin login process first.')
    }

    if (!tokenData.refresh_token) {
      throw new Error('Refresh token not found. Please re-authorize.')
    }

    // Check if access token is expired and refresh if needed
    let accessToken = tokenData.access_token
    const expiresAt = tokenData.expires_at ? new Date(tokenData.expires_at) : null
    const now = new Date()

    if (!expiresAt || now >= expiresAt) {
      // Refresh the access token
      const refreshResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: GOOGLE_CLIENT_ID,
          client_secret: GOOGLE_CLIENT_SECRET,
          refresh_token: tokenData.refresh_token,
          grant_type: 'refresh_token',
        }),
      })

      const refreshData = await refreshResponse.json()

      if (!refreshResponse.ok) {
        throw new Error(`Token refresh failed: ${refreshData.error_description || refreshData.error}. You may need to re-authorize.`)
      }

      accessToken = refreshData.access_token

      // Update stored access token
      await supabase
        .from('google_calendar_tokens')
        .update({
          access_token: refreshData.access_token,
          expires_at: new Date(Date.now() + (refreshData.expires_in * 1000)).toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', 1)
    }

    // Fetch calendar events
    const calendarUrl = new URL(`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(GOOGLE_CALENDAR_ID)}/events`)
    calendarUrl.searchParams.set('timeMin', timeMin)
    calendarUrl.searchParams.set('timeMax', timeMax)
    calendarUrl.searchParams.set('singleEvents', 'true')
    calendarUrl.searchParams.set('orderBy', 'startTime')

    const eventsResponse = await fetch(calendarUrl.toString(), {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    })

    if (!eventsResponse.ok) {
      const errorData = await eventsResponse.json()
      throw new Error(`Calendar API error: ${errorData.error?.message || 'Failed to fetch events'}`)
    }

    const eventsData = await eventsResponse.json()
    const events = eventsData.items || []

    return new Response(
      JSON.stringify({ events }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Calendar events error:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        events: [] 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})
