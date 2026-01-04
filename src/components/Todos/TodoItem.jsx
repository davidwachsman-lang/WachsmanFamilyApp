import { useState } from 'react'
import { supabase } from '../../services/supabase'
import './TodoItem.css'

const TodoItem = ({ todo, onUpdate, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false)
  const [title, setTitle] = useState(todo.title)
  const [description, setDescription] = useState(todo.description || '')
  const [isUpdating, setIsUpdating] = useState(false)

  const handleToggleComplete = async () => {
    setIsUpdating(true)
    const { error } = await supabase
      .from('todos')
      .update({ completed: !todo.completed, updated_at: new Date().toISOString() })
      .eq('id', todo.id)
    
    if (!error) {
      onUpdate()
    }
    setIsUpdating(false)
  }

  const handleSave = async () => {
    setIsUpdating(true)
    const { error } = await supabase
      .from('todos')
      .update({
        title,
        description,
        updated_at: new Date().toISOString()
      })
      .eq('id', todo.id)
    
    if (!error) {
      setIsEditing(false)
      onUpdate()
    }
    setIsUpdating(false)
  }

  const handleCancel = () => {
    setTitle(todo.title)
    setDescription(todo.description || '')
    setIsEditing(false)
  }

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this to-do?')) {
      const { error } = await supabase
        .from('todos')
        .delete()
        .eq('id', todo.id)
      
      if (!error) {
        onDelete()
      }
    }
  }

  if (isEditing) {
    return (
      <div className="todo-item editing">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="To-do title"
          className="todo-input"
        />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description (optional)"
          className="todo-textarea"
          rows="2"
        />
        <div className="todo-actions">
          <button onClick={handleSave} disabled={isUpdating || !title.trim()}>
            Save
          </button>
          <button onClick={handleCancel} disabled={isUpdating}>
            Cancel
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={`todo-item ${todo.completed ? 'completed' : ''}`}>
      <div className="todo-content">
        <input
          type="checkbox"
          checked={todo.completed}
          onChange={handleToggleComplete}
          disabled={isUpdating}
          className="todo-checkbox"
        />
        <div className="todo-details">
          <div className="todo-title">{todo.title}</div>
          {todo.description && (
            <div className="todo-description">{todo.description}</div>
          )}
        </div>
      </div>
      <div className="todo-actions">
        <button onClick={() => setIsEditing(true)} className="edit-btn">
          ✏️
        </button>
        <button onClick={handleDelete} className="delete-btn">
          🗑️
        </button>
      </div>
    </div>
  )
}

export default TodoItem

