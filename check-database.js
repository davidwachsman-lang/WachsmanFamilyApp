#!/usr/bin/env node

// Simple script to check what data exists in the Supabase database
import { createClient } from '@supabase/supabase-js'
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

// Get environment variables (from .env.local or process.env)
const env = loadEnv()
const supabaseUrl = process.env.VITE_SUPABASE_URL || env.VITE_SUPABASE_URL
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase credentials!')
  console.error('Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY')
  console.error('You can either:')
  console.error('  1. Set them as environment variables: export VITE_SUPABASE_URL=...')
  console.error('  2. Or manually edit this script to include your credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Helper function to get the start of the week (Monday)
function getWeekStart(date) {
  const d = new Date(date)
  const dayOfWeek = d.getDay()
  const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1
  d.setDate(d.getDate() - diff)
  d.setHours(0, 0, 0, 0)
  return d.toISOString().split('T')[0]
}

async function checkDatabase() {
  console.log('🔍 Checking Supabase database...\n')
  
  const currentWeekStart = getWeekStart(new Date())
  console.log(`📅 Current week starts: ${currentWeekStart}\n`)
  
  try {
    // Check todos table
    console.log('📝 Checking todos table...')
    const { data: todos, error: todosError } = await supabase
      .from('todos')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (todosError) {
      console.error('❌ Error fetching todos:', todosError.message)
    } else {
      console.log(`✅ Found ${todos?.length || 0} todos total`)
      
      const currentWeekTodos = todos?.filter(todo => todo.week_start === currentWeekStart) || []
      console.log(`   - ${currentWeekTodos.length} todos for current week (${currentWeekStart})`)
      
      if (todos && todos.length > 0) {
        console.log('\n   All todos:')
        todos.forEach((todo, index) => {
          const isCurrentWeek = todo.week_start === currentWeekStart
          const marker = isCurrentWeek ? '👉' : '  '
          console.log(`   ${marker} [${todo.week_start}] ${todo.completed ? '✓' : '○'} ${todo.title}`)
        })
      }
    }
    
    // Check school_lunches table
    console.log('\n🍱 Checking school_lunches table...')
    const { data: lunches, error: lunchesError } = await supabase
      .from('school_lunches')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (lunchesError) {
      console.error('❌ Error fetching school_lunches:', lunchesError.message)
    } else {
      console.log(`✅ Found ${lunches?.length || 0} school lunch records total`)
      
      const currentWeekLunches = lunches?.filter(lunch => lunch.week_start === currentWeekStart) || []
      console.log(`   - ${currentWeekLunches.length} records for current week (${currentWeekStart})`)
      
      if (lunches && lunches.length > 0) {
        console.log('\n   All school lunch records:')
        lunches.forEach((lunch, index) => {
          const isCurrentWeek = lunch.week_start === currentWeekStart
          const marker = isCurrentWeek ? '👉' : '  '
          console.log(`   ${marker} [${lunch.week_start}] ${lunch.kid} - ${lunch.day}: ${lunch.packed ? 'Packed' : 'Not packed'}`)
        })
      }
    }
    
    // Check errands table
    console.log('\n🛒 Checking errands table...')
    const { data: errands, error: errandsError } = await supabase
      .from('errands')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (errandsError) {
      console.error('❌ Error fetching errands:', errandsError.message)
    } else {
      console.log(`✅ Found ${errands?.length || 0} errands`)
      if (errands && errands.length > 0) {
        errands.forEach(errand => {
          console.log(`   ${errand.completed ? '✓' : '○'} ${errand.title}`)
        })
      }
    }
    
    // Check groceries table
    console.log('\n🛒 Checking groceries table...')
    const { data: groceries, error: groceriesError } = await supabase
      .from('groceries')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (groceriesError) {
      console.error('❌ Error fetching groceries:', groceriesError.message)
    } else {
      console.log(`✅ Found ${groceries?.length || 0} groceries`)
      if (groceries && groceries.length > 0) {
        groceries.forEach(grocery => {
          console.log(`   ${grocery.completed ? '✓' : '○'} ${grocery.title}`)
        })
      }
    }
    
    console.log('\n✅ Database check complete!')
    
  } catch (error) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  }
}

checkDatabase()
