#!/usr/bin/env node

// Script to migrate todos and school lunches from Sunday-based weeks to Monday-based weeks
// This ensures data created with Sunday-based calculation appears in the correct Monday-based week

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
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Helper function to convert Sunday-based week to Monday-based week
function sundayToMondayWeek(sundayWeekStart) {
  const sunday = new Date(sundayWeekStart)
  // If the date is a Sunday, move it forward 1 day to Monday
  // If it's any other day, find the previous Monday
  const dayOfWeek = sunday.getDay()
  if (dayOfWeek === 0) {
    // It's Sunday, move to Monday
    sunday.setDate(sunday.getDate() + 1)
  } else {
    // Find the Monday of that week
    const diff = dayOfWeek === 0 ? 0 : dayOfWeek - 1
    sunday.setDate(sunday.getDate() - diff)
  }
  sunday.setHours(0, 0, 0, 0)
  return sunday.toISOString().split('T')[0]
}

// Helper to get Monday of a week (standard calculation)
function getMondayWeek(date) {
  const d = new Date(date)
  const dayOfWeek = d.getDay()
  const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1
  d.setDate(d.getDate() - diff)
  d.setHours(0, 0, 0, 0)
  return d.toISOString().split('T')[0]
}

async function migrateData() {
  console.log('🔄 Migrating todos and school lunches to Monday-based weeks...\n')
  
  try {
    // Get all todos
    console.log('📝 Checking todos...')
    const { data: todos, error: todosError } = await supabase
      .from('todos')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (todosError) {
      console.error('❌ Error fetching todos:', todosError.message)
      return
    }
    
    console.log(`✅ Found ${todos?.length || 0} todos total\n`)
    
    // Group todos by their current week_start
    const todosByWeek = {}
    todos?.forEach(todo => {
      if (!todosByWeek[todo.week_start]) {
        todosByWeek[todo.week_start] = []
      }
      todosByWeek[todo.week_start].push(todo)
    })
    
    // Check each week_start and see if it needs migration
    let migratedTodos = 0
    for (const [currentWeek, weekTodos] of Object.entries(todosByWeek)) {
      const mondayWeek = sundayToMondayWeek(currentWeek)
      
      if (currentWeek !== mondayWeek) {
        console.log(`📅 Migrating todos from ${currentWeek} (Sunday week) to ${mondayWeek} (Monday week)`)
        console.log(`   Found ${weekTodos.length} todos to migrate`)
        
        // Update each todo's week_start
        for (const todo of weekTodos) {
          const { error } = await supabase
            .from('todos')
            .update({ week_start: mondayWeek })
            .eq('id', todo.id)
          
          if (error) {
            console.error(`   ❌ Error updating todo ${todo.id}:`, error.message)
          } else {
            migratedTodos++
          }
        }
        console.log(`   ✅ Migrated ${weekTodos.length} todos\n`)
      }
    }
    
    // Get all school lunches
    console.log('🍱 Checking school lunches...')
    const { data: lunches, error: lunchesError } = await supabase
      .from('school_lunches')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (lunchesError) {
      console.error('❌ Error fetching school_lunches:', lunchesError.message)
      return
    }
    
    console.log(`✅ Found ${lunches?.length || 0} school lunch records total\n`)
    
    // Group lunches by their current week_start
    const lunchesByWeek = {}
    lunches?.forEach(lunch => {
      if (!lunchesByWeek[lunch.week_start]) {
        lunchesByWeek[lunch.week_start] = []
      }
      lunchesByWeek[lunch.week_start].push(lunch)
    })
    
    // Check each week_start and see if it needs migration
    let migratedLunches = 0
    for (const [currentWeek, weekLunches] of Object.entries(lunchesByWeek)) {
      const mondayWeek = sundayToMondayWeek(currentWeek)
      
      if (currentWeek !== mondayWeek) {
        console.log(`📅 Migrating school lunches from ${currentWeek} (Sunday week) to ${mondayWeek} (Monday week)`)
        console.log(`   Found ${weekLunches.length} records to migrate`)
        
        // Update each lunch's week_start
        for (const lunch of weekLunches) {
          const { error } = await supabase
            .from('school_lunches')
            .update({ week_start: mondayWeek })
            .eq('id', lunch.id)
          
          if (error) {
            console.error(`   ❌ Error updating lunch ${lunch.id}:`, error.message)
          } else {
            migratedLunches++
          }
        }
        console.log(`   ✅ Migrated ${weekLunches.length} records\n`)
      }
    }
    
    console.log('✅ Migration complete!')
    console.log(`   - Migrated ${migratedTodos} todos`)
    console.log(`   - Migrated ${migratedLunches} school lunch records`)
    
    if (migratedTodos === 0 && migratedLunches === 0) {
      console.log('\n💡 No data needed migration - all weeks are already Monday-based!')
    }
    
  } catch (error) {
    console.error('❌ Error during migration:', error.message)
    process.exit(1)
  }
}

migrateData()
