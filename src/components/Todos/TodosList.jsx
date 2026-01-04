import { useState, useEffect } from 'react'
import { supabase } from '../../services/supabase'
import TodoItem from './TodoItem'
import './TodosList.css'

const TodosList = () => {
  const [todos, setTodos] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newTodo, setNewTodo] = useState({
    title: '',
    description: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentWeekStart, setCurrentWeekStart] = useState(getWeekStart(new Date()))

  // Helper function to get the start of the week (Sunday)
  function getWeekStart(date) {
    const d = new Date(date)
    d.setDate(d.getDate() - d.getDay())
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
  }, [currentWeekStart])

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
    if (!newTodo.title.trim()) return

    setIsSubmitting(true)
    try {
      const { error } = await supabase
        .from('todos')
        .insert([{
          title: newTodo.title,
          description: newTodo.description || null,
          completed: false,
          week_start: currentWeekStart
        }])
      
      if (error) throw error
      
      setNewTodo({ title: '', description: '' })
      setShowAddForm(false)
      loadTodos()
    } catch (error) {
      console.error('Error adding todo:', error)
      alert('Failed to add to-do. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const navigateWeek = (direction) => {
    const current = new Date(currentWeekStart)
    current.setDate(current.getDate() + (direction * 7))
    setCurrentWeekStart(getWeekStart(current))
    setLoading(true)
  }

  const goToCurrentWeek = () => {
    setCurrentWeekStart(getWeekStart(new Date()))
    setLoading(true)
  }

  const formatWeekRange = () => {
    const start = new Date(currentWeekStart)
    const end = new Date(start)
    end.setDate(start.getDate() + 6)
    
    const isCurrentWeek = currentWeekStart === getWeekStart(new Date())
    
    return (
      <div className="week-navigation">
        <button onClick={() => navigateWeek(-1)} className="nav-btn">←</button>
        <div className="week-display">
          <span className="week-range">
            {start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </span>
          {isCurrentWeek && <span className="current-week-badge">Current Week</span>}
        </div>
        <button onClick={() => navigateWeek(1)} className="nav-btn">→</button>
        {!isCurrentWeek && (
          <button onClick={goToCurrentWeek} className="today-btn">Today</button>
        )}
      </div>
    )
  }

  const incompleteTodos = todos.filter(todo => !todo.completed)
  const completedTodos = todos.filter(todo => todo.completed)

  return (
    <div className="todos-list">
      <div className="todos-header">
        <h2>Weekly To-Dos</h2>
        <button 
          onClick={() => setShowAddForm(!showAddForm)}
          className="add-btn"
        >
          {showAddForm ? '− Cancel' : '+ Add To-Do'}
        </button>
      </div>

      {formatWeekRange()}

      {showAddForm && (
        <form onSubmit={handleAddTodo} className="add-todo-form">
          <input
            type="text"
            value={newTodo.title}
            onChange={(e) => setNewTodo({ ...newTodo, title: e.target.value })}
            placeholder="To-do title *"
            required
            className="form-input"
          />
          <textarea
            value={newTodo.description}
            onChange={(e) => setNewTodo({ ...newTodo, description: e.target.value })}
            placeholder="Description (optional)"
            className="form-textarea"
            rows="2"
          />
          <div className="form-actions">
            <button type="submit" disabled={isSubmitting} className="submit-btn">
              {isSubmitting ? 'Adding...' : 'Add To-Do'}
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="loading">Loading to-dos...</div>
      ) : (
        <>
          {incompleteTodos.length > 0 && (
            <div className="todos-section">
              <h3 className="section-title">Active ({incompleteTodos.length})</h3>
              {incompleteTodos.map(todo => (
                <TodoItem
                  key={todo.id}
                  todo={todo}
                  onUpdate={loadTodos}
                  onDelete={loadTodos}
                />
              ))}
            </div>
          )}

          {completedTodos.length > 0 && (
            <div className="todos-section">
              <h3 className="section-title">Completed ({completedTodos.length})</h3>
              {completedTodos.map(todo => (
                <TodoItem
                  key={todo.id}
                  todo={todo}
                  onUpdate={loadTodos}
                  onDelete={loadTodos}
                />
              ))}
            </div>
          )}

          {todos.length === 0 && (
            <div className="empty-state">No to-dos for this week. Add one to get started!</div>
          )}
        </>
      )}
    </div>
  )
}

export default TodosList

