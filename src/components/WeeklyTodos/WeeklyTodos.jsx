import { useState, useEffect } from 'react'
import { supabase } from '../../services/supabase'
import './WeeklyTodos.css'

const WeeklyTodos = () => {
  const [todos, setTodos] = useState([])
  const [loading, setLoading] = useState(true)
  const [newTodo, setNewTodo] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const currentWeekStart = getWeekStart(new Date())

  // Helper function to get the start of the week (Sunday)
  function getWeekStart(date) {
    const d = new Date(date)
    // Find Monday of current week
    const dayOfWeek = d.getDay()
    const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1
    d.setDate(d.getDate() - diff)
    d.setHours(0, 0, 0, 0)
    return d.toISOString().split('T')[0]
  }

  useEffect(() => {
    loadTodos()
    
    // Subscribe to real-time changes
    const channel = supabase
      .channel('todos-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'todos' },
        () => {
          loadTodos()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const loadTodos = async () => {
    try {
      const { data, error } = await supabase
        .from('todos')
        .select('*')
        .eq('week_start', currentWeekStart)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      setTodos(data || [])
    } catch (error) {
      console.error('Error loading todos:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddTodo = async (e) => {
    e.preventDefault()
    if (!newTodo.trim()) return

    setIsSubmitting(true)
    try {
      const { error } = await supabase
        .from('todos')
        .insert([{
          title: newTodo.trim(),
          completed: false,
          week_start: currentWeekStart
        }])
      
      if (error) throw error
      
      setNewTodo('')
      loadTodos()
    } catch (error) {
      console.error('Error adding todo:', error)
      alert('Failed to add to-do. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleToggleTodo = async (todo) => {
    try {
      const { error } = await supabase
        .from('todos')
        .update({ completed: !todo.completed })
        .eq('id', todo.id)
      
      if (error) throw error
      loadTodos()
    } catch (error) {
      console.error('Error updating todo:', error)
    }
  }

  const handleDeleteTodo = async (todoId) => {
    try {
      const { error } = await supabase
        .from('todos')
        .delete()
        .eq('id', todoId)
      
      if (error) throw error
      loadTodos()
    } catch (error) {
      console.error('Error deleting todo:', error)
    }
  }

  return (
    <div className="weekly-todos">
      <div className="weekly-todos-header">
        <h2>Weekly To Dos</h2>
      </div>

      <form onSubmit={handleAddTodo} className="add-todo-form">
        <input
          type="text"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          placeholder="Add new to-do..."
          className="todo-input"
          disabled={isSubmitting}
        />
        <button type="submit" disabled={isSubmitting || !newTodo.trim()} className="add-todo-btn">
          Add
        </button>
      </form>

      {loading ? (
        <div className="loading">Loading to-dos...</div>
      ) : (
        <div className="todos-checklist">
          {todos.length === 0 ? (
            <div className="empty-state">No to-dos yet. Add one to get started!</div>
          ) : (
            todos.map(todo => (
              <div key={todo.id} className="todo-item">
                <label className="todo-checkbox-label">
                  <input
                    type="checkbox"
                    checked={todo.completed || false}
                    onChange={() => handleToggleTodo(todo)}
                    className="todo-checkbox"
                  />
                  <span className={todo.completed ? 'todo-text completed' : 'todo-text'}>
                    {todo.title}
                  </span>
                </label>
                <button
                  onClick={() => handleDeleteTodo(todo.id)}
                  className="delete-todo-btn"
                  aria-label="Delete todo"
                >
                  ×
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}

export default WeeklyTodos

