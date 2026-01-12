#!/usr/bin/env node

// Script to restore weekly todos from a specific week to current week
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
    return {}
  }
}

// Get environment variables
const env = loadEnv()
const supabaseUrl = process.env.VITE_SUPABASE_URL || env.VITE_SUPABASE_URL
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase credentials!')
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

async function restoreTodos() {
  console.log('🔄 Restoring weekly todos from 2026-01-05 to current week...\n')
  
  const currentWeekStart = getWeekStart(new Date())
  const sourceWeekStart = '2026-01-05' // The week with 8 todos
  
  console.log(`📅 Source week: ${sourceWeekStart}`)
  console.log(`📅 Current week: ${currentWeekStart}\n`)
  
  try {
    // Get todos from source week
    console.log(`📝 Fetching todos from ${sourceWeekStart}...`)
    const { data: sourceTodos, error: fetchError } = await supabase
      .from('todos')
      .select('*')
      .eq('week_start', sourceWeekStart)
    
    if (fetchError) {
      console.error('❌ Error fetching todos:', fetchError.message)
      process.exit(1)
    }
    
    if (!sourceTodos || sourceTodos.length === 0) {
      console.log(`⚠️  No todos found for ${sourceWeekStart}. Nothing to restore.`)
      process.exit(0)
    }
    
    console.log(`✅ Found ${sourceTodos.length} todos from ${sourceWeekStart}\n`)
    
    // Check if there are already todos for this week
    const { data: currentWeekTodos } = await supabase
      .from('todos')
      .select('id')
      .eq('week_start', currentWeekStart)
    
    if (currentWeekTodos && currentWeekTodos.length > 0) {
      console.log(`⚠️  There are already ${currentWeekTodos.length} todos for this week.`)
      console.log('   The script will add the todos from the source week as well.\n')
    }
    
    // Copy todos to current week
    console.log(`📋 Copying todos to current week (${currentWeekStart})...`)
    const todosToInsert = sourceTodos.map(todo => ({
      title: todo.title,
      description: todo.description || null,
      completed: false, // Reset completed status
      week_start: currentWeekStart
    }))
    
    const { data: insertedTodos, error: insertError } = await supabase
      .from('todos')
      .insert(todosToInsert)
      .select()
    
    if (insertError) {
      console.error('❌ Error inserting todos:', insertError.message)
      process.exit(1)
    }
    
    console.log(`✅ Successfully restored ${insertedTodos.length} todos to current week!\n`)
    console.log('📝 Restored todos:')
    insertedTodos.forEach(todo => {
      console.log(`   ○ ${todo.title}`)
    })
    
    console.log('\n✅ Restore complete!')
    
  } catch (error) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  }
}

restoreTodos()
