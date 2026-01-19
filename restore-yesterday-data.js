#!/usr/bin/env node

// Script to restore todos and school lunches from yesterday (or previous week) to current week
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

// Get environment variables
const env = loadEnv()
const supabaseUrl = process.env.VITE_SUPABASE_URL || env.VITE_SUPABASE_URL
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase credentials!')
  console.error('Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Helper to get Monday of a week (standard calculation)
function getMondayWeek(date) {
  const d = new Date(date)
  const dayOfWeek = d.getDay()
  const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1
  d.setDate(d.getDate() - diff)
  d.setHours(0, 0, 0, 0)
  return d.toISOString().split('T')[0]
}

// Helper to get Sunday of a week
function getSundayWeek(date) {
  const d = new Date(date)
  d.setDate(d.getDate() - d.getDay())
  d.setHours(0, 0, 0, 0)
  return d.toISOString().split('T')[0]
}

async function restoreYesterdayData() {
  console.log('🔄 Restoring todos and school lunches from yesterday...\n')
  
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  
  const currentWeekStart = getMondayWeek(today)
  const yesterdayWeekStart = getMondayWeek(yesterday)
  const yesterdaySundayWeek = getSundayWeek(yesterday)
  
  console.log(`📅 Today: ${today.toISOString().split('T')[0]}`)
  console.log(`📅 Yesterday: ${yesterday.toISOString().split('T')[0]}`)
  console.log(`📅 Current week starts: ${currentWeekStart}`)
  console.log(`📅 Yesterday's Monday week: ${yesterdayWeekStart}`)
  console.log(`📅 Yesterday's Sunday week: ${yesterdaySundayWeek}\n`)
  
  try {
    // Check if current week already has data
    console.log('📝 Checking current week todos...')
    const { data: currentTodos, error: currentTodosError } = await supabase
      .from('todos')
      .select('*')
      .eq('week_start', currentWeekStart)
    
    if (currentTodosError) {
      console.error('❌ Error fetching current todos:', currentTodosError.message)
      return
    }
    
    console.log(`✅ Current week has ${currentTodos?.length || 0} todos\n`)
    
    // Get all todos to find ones from yesterday's week
    console.log('🔍 Searching for todos from yesterday\'s week...')
    const { data: allTodos, error: todosError } = await supabase
      .from('todos')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (todosError) {
      console.error('❌ Error fetching todos:', todosError.message)
      return
    }
    
    // Find todos from yesterday's week (could be Monday-based or Sunday-based)
    const yesterdayTodos = allTodos?.filter(todo => 
      todo.week_start === yesterdayWeekStart || 
      todo.week_start === yesterdaySundayWeek ||
      todo.week_start === yesterday.toISOString().split('T')[0] // In case it was saved with the exact date
    ) || []
    
    console.log(`✅ Found ${yesterdayTodos.length} todos from yesterday's week\n`)
    
    if (yesterdayTodos.length > 0) {
      console.log('📋 Todos to restore:')
      yesterdayTodos.forEach((todo, index) => {
        console.log(`   ${index + 1}. [${todo.completed ? '✓' : '○'}] ${todo.title}`)
        if (todo.description) {
          console.log(`      ${todo.description}`)
        }
      })
      console.log('')
      
      // Copy todos to current week (only if they don't already exist)
      let restoredTodos = 0
      for (const todo of yesterdayTodos) {
        // Check if this todo already exists in current week
        const exists = currentTodos?.some(t => 
          t.title === todo.title && 
          t.description === todo.description
        )
        
        if (!exists) {
          const { error } = await supabase
            .from('todos')
            .insert([{
              title: todo.title,
              description: todo.description,
              completed: false, // Reset completed status
              week_start: currentWeekStart
            }])
          
          if (error) {
            console.error(`   ❌ Error restoring todo "${todo.title}":`, error.message)
          } else {
            restoredTodos++
            console.log(`   ✅ Restored: ${todo.title}`)
          }
        } else {
          console.log(`   ⏭️  Skipped (already exists): ${todo.title}`)
        }
      }
      
      console.log(`\n✅ Restored ${restoredTodos} todos to current week\n`)
    } else {
      console.log('💡 No todos found from yesterday\'s week\n')
    }
    
    // Now do the same for school lunches
    console.log('🍱 Checking school lunches...')
    
    const { data: currentLunches, error: currentLunchesError } = await supabase
      .from('school_lunches')
      .select('*')
      .eq('week_start', currentWeekStart)
    
    if (currentLunchesError) {
      console.error('❌ Error fetching current lunches:', currentLunchesError.message)
      return
    }
    
    console.log(`✅ Current week has ${currentLunches?.length || 0} school lunch records\n`)
    
    const { data: allLunches, error: lunchesError } = await supabase
      .from('school_lunches')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (lunchesError) {
      console.error('❌ Error fetching lunches:', lunchesError.message)
      return
    }
    
    // Find lunches from yesterday's week
    const yesterdayLunches = allLunches?.filter(lunch => 
      lunch.week_start === yesterdayWeekStart || 
      lunch.week_start === yesterdaySundayWeek ||
      lunch.week_start === yesterday.toISOString().split('T')[0]
    ) || []
    
    console.log(`✅ Found ${yesterdayLunches.length} school lunch records from yesterday's week\n`)
    
    if (yesterdayLunches.length > 0) {
      console.log('📋 School lunches to restore:')
      const lunchesByKid = {}
      yesterdayLunches.forEach(lunch => {
        if (!lunchesByKid[lunch.kid]) {
          lunchesByKid[lunch.kid] = {}
        }
        lunchesByKid[lunch.kid][lunch.day] = lunch.packed
      })
      
      Object.keys(lunchesByKid).forEach(kid => {
        Object.keys(lunchesByKid[kid]).forEach(day => {
          console.log(`   ${kid} - ${day}: ${lunchesByKid[kid][day] ? 'Packed' : 'Not packed'}`)
        })
      })
      console.log('')
      
      // Copy lunches to current week (only if they don't already exist)
      let restoredLunches = 0
      for (const lunch of yesterdayLunches) {
        // Check if this lunch record already exists in current week
        const exists = currentLunches?.some(l => 
          l.kid === lunch.kid && 
          l.day === lunch.day
        )
        
        if (!exists) {
          const { error } = await supabase
            .from('school_lunches')
            .insert([{
              week_start: currentWeekStart,
              kid: lunch.kid,
              day: lunch.day,
              packed: lunch.packed // Keep the packed status
            }])
          
          if (error) {
            console.error(`   ❌ Error restoring lunch ${lunch.kid} - ${lunch.day}:`, error.message)
          } else {
            restoredLunches++
            console.log(`   ✅ Restored: ${lunch.kid} - ${lunch.day}`)
          }
        } else {
          console.log(`   ⏭️  Skipped (already exists): ${lunch.kid} - ${lunch.day}`)
        }
      }
      
      console.log(`\n✅ Restored ${restoredLunches} school lunch records to current week\n`)
    } else {
      console.log('💡 No school lunches found from yesterday\'s week\n')
    }
    
    console.log('✅ Restoration complete!')
    
  } catch (error) {
    console.error('❌ Error during restoration:', error.message)
    process.exit(1)
  }
}

restoreYesterdayData()
