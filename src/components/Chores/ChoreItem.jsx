import { useState } from 'react'
import { supabase } from '../../services/supabase'
import './ChoreItem.css'

const ChoreItem = ({ chore, onUpdate, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false)
  const [title, setTitle] = useState(chore.title)
  const [description, setDescription] = useState(chore.description || '')
  const [assignedTo, setAssignedTo] = useState(chore.assigned_to || '')
  const [isUpdating, setIsUpdating] = useState(false)

  const handleToggleComplete = async () => {
    setIsUpdating(true)
    const { error } = await supabase
      .from('chores')
      .update({ completed: !chore.completed, updated_at: new Date().toISOString() })
      .eq('id', chore.id)
    
    if (!error) {
      onUpdate()
    }
    setIsUpdating(false)
  }

  const handleSave = async () => {
    setIsUpdating(true)
    const { error } = await supabase
      .from('chores')
      .update({
        title,
        description,
        assigned_to: assignedTo,
        updated_at: new Date().toISOString()
      })
      .eq('id', chore.id)
    
    if (!error) {
      setIsEditing(false)
      onUpdate()
    }
    setIsUpdating(false)
  }

  const handleCancel = () => {
    setTitle(chore.title)
    setDescription(chore.description || '')
    setAssignedTo(chore.assigned_to || '')
    setIsEditing(false)
  }

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this chore?')) {
      const { error } = await supabase
        .from('chores')
        .delete()
        .eq('id', chore.id)
      
      if (!error) {
        onDelete()
      }
    }
  }

  if (isEditing) {
    return (
      <div className="chore-item editing">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Chore title"
          className="chore-input"
        />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description (optional)"
          className="chore-textarea"
          rows="2"
        />
        <input
          type="text"
          value={assignedTo}
          onChange={(e) => setAssignedTo(e.target.value)}
          placeholder="Assigned to (optional)"
          className="chore-input"
        />
        <div className="chore-actions">
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
    <div className={`chore-item ${chore.completed ? 'completed' : ''}`}>
      <div className="chore-content">
        <input
          type="checkbox"
          checked={chore.completed}
          onChange={handleToggleComplete}
          disabled={isUpdating}
          className="chore-checkbox"
        />
        <div className="chore-details">
          <div className="chore-title">{chore.title}</div>
          {chore.description && (
            <div className="chore-description">{chore.description}</div>
          )}
          {chore.assigned_to && (
            <div className="chore-assigned">👤 {chore.assigned_to}</div>
          )}
        </div>
      </div>
      <div className="chore-actions">
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

export default ChoreItem

