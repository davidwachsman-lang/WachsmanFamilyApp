#!/usr/bin/env node

// Script to check all todos in the database to see what was added yesterday
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

async function checkAllTodos() {
  console.log('🔍 Checking all todos in the database...\n')
  
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayDateStr = yesterday.toISOString().split('T')[0]
  
  console.log(`📅 Today: ${today.toISOString().split('T')[0]}`)
  console.log(`📅 Yesterday: ${yesterdayDateStr}\n`)
  
  try {
    // Get ALL todos ordered by creation date
    const { data: allTodos, error: todosError } = await supabase
      .from('todos')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (todosError) {
      console.error('❌ Error fetching todos:', todosError.message)
      return
    }
    
    console.log(`✅ Found ${allTodos?.length || 0} total todos in database\n`)
    
    // Filter todos created yesterday (any time on that date)
    const yesterdayTodos = allTodos?.filter(todo => {
      if (!todo.created_at) return false
      const createdDate = new Date(todo.created_at)
      const createdDateStr = createdDate.toISOString().split('T')[0]
      return createdDateStr === yesterdayDateStr
    }) || []
    
    console.log(`📋 Todos created yesterday (${yesterdayDateStr}): ${yesterdayTodos.length}\n`)
    
    if (yesterdayTodos.length > 0) {
      console.log('All todos from yesterday:')
      yesterdayTodos.forEach((todo, index) => {
        const createdTime = new Date(todo.created_at).toLocaleTimeString()
        console.log(`\n${index + 1}. [${todo.completed ? '✓' : '○'}] ${todo.title}`)
        if (todo.description) {
          console.log(`   Description: ${todo.description}`)
        }
        console.log(`   Week Start: ${todo.week_start}`)
        console.log(`   Created: ${createdTime}`)
        console.log(`   ID: ${todo.id}`)
      })
      
      // Group by week_start
      const todosByWeek = {}
      yesterdayTodos.forEach(todo => {
        if (!todosByWeek[todo.week_start]) {
          todosByWeek[todo.week_start] = []
        }
        todosByWeek[todo.week_start].push(todo)
      })
      
      console.log('\n📊 Grouped by week_start:')
      Object.keys(todosByWeek).forEach(weekStart => {
        console.log(`\n   Week ${weekStart}: ${todosByWeek[weekStart].length} todos`)
        todosByWeek[weekStart].forEach(todo => {
          console.log(`     - [${todo.completed ? '✓' : '○'}] ${todo.title}`)
        })
      })
    } else {
      console.log('💡 No todos were created yesterday\n')
    }
    
    // Also show recent todos (last 7 days) for context
    const sevenDaysAgo = new Date(today)
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    
    const recentTodos = allTodos?.filter(todo => {
      if (!todo.created_at) return false
      const createdDate = new Date(todo.created_at)
      return createdDate >= sevenDaysAgo
    }) || []
    
    console.log(`\n📅 Recent todos (last 7 days): ${recentTodos.length}`)
    if (recentTodos.length > 0) {
      recentTodos.forEach((todo, index) => {
        const createdDate = new Date(todo.created_at)
        const dateStr = createdDate.toISOString().split('T')[0]
        const timeStr = createdDate.toLocaleTimeString()
        const isYesterday = dateStr === yesterdayDateStr
        const marker = isYesterday ? '👉' : '  '
        console.log(`${marker} ${index + 1}. [${dateStr} ${timeStr}] [${todo.completed ? '✓' : '○'}] ${todo.title} (week: ${todo.week_start})`)
      })
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  }
}

checkAllTodos()
