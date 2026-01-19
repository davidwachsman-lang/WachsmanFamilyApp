#!/usr/bin/env node

// Script to test the calendar API and diagnose issues
import axios from 'axios'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Read .env.local file
function loadEnv() {
  try {
    const envPath = join(__dirname, '.env.local')
    const envFile = readFileSync(envPath, 'utf-8')
    const env = {}
    
    envFile.split('\n').forEach(line => {
      const trimmed = line.trim()
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=')
        if (key && valueParts.length > 0) {
          env[key.trim()] = valueParts.join('=').trim().replace(/^["']|["']$/g, '')
        }
      }
    })
    
    return env
  } catch (error) {
    console.error('Could not read .env.local file:', error.message)
    return {}
  }
}

// Get environment variables
const env = loadEnv()
const supabaseUrl = process.env.VITE_SUPABASE_URL || env.VITE_SUPABASE_URL
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase credentials!')
  console.error('Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY')
  process.exit(1)
}

async function testCalendarAPI() {
  console.log('🔍 Testing Calendar API...\n')
  console.log(`Supabase URL: ${supabaseUrl}`)
  console.log(`Anon Key: ${supabaseAnonKey ? '✅ Present' : '❌ Missing'}\n`)
  
  const functionsUrl = `${supabaseUrl}/functions/v1`
  const calendarEndpoint = `${functionsUrl}/calendar-events`
  
  // Set up time range (next 7 days)
  const timeMin = new Date()
  const timeMax = new Date()
  timeMax.setDate(timeMax.getDate() + 7)
  
  console.log(`Testing endpoint: ${calendarEndpoint}`)
  console.log(`Time range: ${timeMin.toISOString()} to ${timeMax.toISOString()}\n`)
  
  try {
    const response = await axios.get(calendarEndpoint, {
      params: {
        timeMin: timeMin.toISOString(),
        timeMax: timeMax.toISOString(),
      },
      headers: {
        'Authorization': `Bearer ${supabaseAnonKey}`,
        'apikey': supabaseAnonKey,
      },
    })
    
    console.log('✅ Calendar API call successful!')
    console.log(`📅 Found ${response.data.events?.length || 0} events\n`)
    
    if (response.data.events && response.data.events.length > 0) {
      console.log('Sample events:')
      response.data.events.slice(0, 3).forEach((event, index) => {
        console.log(`\n${index + 1}. ${event.summary || '(No title)'}`)
        console.log(`   Start: ${event.start?.dateTime || event.start?.date || 'Unknown'}`)
        console.log(`   End: ${event.end?.dateTime || event.end?.date || 'Unknown'}`)
      })
    }
    
  } catch (error) {
    console.error('❌ Calendar API call failed!\n')
    
    if (error.response) {
      console.error(`Status: ${error.response.status}`)
      console.error(`Error: ${JSON.stringify(error.response.data, null, 2)}`)
      
      if (error.response.status === 401) {
        console.error('\n💡 This usually means:')
        console.error('   - Missing or invalid Supabase anon key')
        console.error('   - Edge Function requires authentication')
      } else if (error.response.status === 500) {
        const errorMsg = error.response.data?.error || 'Unknown error'
        console.error(`\n💡 Server error: ${errorMsg}`)
        
        if (errorMsg.includes('No stored refresh token')) {
          console.error('\n   You need to complete the admin login process:')
          console.error('   1. Visit your app and click "Admin Calendar Setup"')
          console.error('   2. Authorize with Google Calendar')
          console.error('   3. The refresh token will be stored automatically')
        } else if (errorMsg.includes('Token refresh failed')) {
          console.error('\n   The stored refresh token may be invalid or expired.')
          console.error('   You may need to re-authorize:')
          console.error('   1. Visit your app and click "Admin Calendar Setup" again')
          console.error('   2. Re-authorize with Google Calendar')
        } else if (errorMsg.includes('Missing Google OAuth credentials')) {
          console.error('\n   Edge Function secrets are not set. Set these in Supabase Dashboard:')
          console.error('   1. Go to Project Settings > Edge Functions > Secrets')
          console.error('   2. Add: GOOGLE_CLIENT_ID')
          console.error('   3. Add: GOOGLE_CLIENT_SECRET')
          console.error('   4. Add: GOOGLE_CALENDAR_ID')
        }
      }
    } else if (error.request) {
      console.error('❌ No response received from server')
      console.error('   This could mean:')
      console.error('   - Network connectivity issue')
      console.error('   - Supabase URL is incorrect')
      console.error('   - Edge Function is not deployed')
    } else {
      console.error('❌ Error:', error.message)
    }
    
    process.exit(1)
  }
}

testCalendarAPI()
