import { useState, useEffect } from 'react'
import { supabase } from '../../services/supabase'
import ChoreItem from './ChoreItem'
import './ChoresList.css'

const ChoresList = () => {
  const [chores, setChores] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newChore, setNewChore] = useState({
    title: '',
    description: '',
    assigned_to: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    loadChores()
    
    // Subscribe to real-time changes
    const channel = supabase
      .channel('chores-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'chores' },
        () => {
          loadChores()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const loadChores = async () => {
    try {
      const { data, error } = await supabase
        .from('chores')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      setChores(data || [])
    } catch (error) {
      console.error('Error loading chores:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddChore = async (e) => {
    e.preventDefault()
    if (!newChore.title.trim()) return

    setIsSubmitting(true)
    try {
      const { error } = await supabase
        .from('chores')
        .insert([{
          title: newChore.title,
          description: newChore.description || null,
          assigned_to: newChore.assigned_to || null,
          completed: false
        }])
      
      if (error) throw error
      
      setNewChore({ title: '', description: '', assigned_to: '' })
      setShowAddForm(false)
      loadChores()
    } catch (error) {
      console.error('Error adding chore:', error)
      alert('Failed to add chore. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const incompleteChores = chores.filter(chore => !chore.completed)
  const completedChores = chores.filter(chore => chore.completed)

  return (
    <div className="chores-list">
      <div className="chores-header">
        <h2>Chores</h2>
        <button 
          onClick={() => setShowAddForm(!showAddForm)}
          className="add-btn"
        >
          {showAddForm ? '− Cancel' : '+ Add Chore'}
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleAddChore} className="add-chore-form">
          <input
            type="text"
            value={newChore.title}
            onChange={(e) => setNewChore({ ...newChore, title: e.target.value })}
            placeholder="Chore title *"
            required
            className="form-input"
          />
          <textarea
            value={newChore.description}
            onChange={(e) => setNewChore({ ...newChore, description: e.target.value })}
            placeholder="Description (optional)"
            className="form-textarea"
            rows="2"
          />
          <input
            type="text"
            value={newChore.assigned_to}
            onChange={(e) => setNewChore({ ...newChore, assigned_to: e.target.value })}
            placeholder="Assigned to (optional)"
            className="form-input"
          />
          <div className="form-actions">
            <button type="submit" disabled={isSubmitting} className="submit-btn">
              {isSubmitting ? 'Adding...' : 'Add Chore'}
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="loading">Loading chores...</div>
      ) : (
        <>
          {incompleteChores.length > 0 && (
            <div className="chores-section">
              <h3 className="section-title">Active ({incompleteChores.length})</h3>
              {incompleteChores.map(chore => (
                <ChoreItem
                  key={chore.id}
                  chore={chore}
                  onUpdate={loadChores}
                  onDelete={loadChores}
                />
              ))}
            </div>
          )}

          {completedChores.length > 0 && (
            <div className="chores-section">
              <h3 className="section-title">Completed ({completedChores.length})</h3>
              {completedChores.map(chore => (
                <ChoreItem
                  key={chore.id}
                  chore={chore}
                  onUpdate={loadChores}
                  onDelete={loadChores}
                />
              ))}
            </div>
          )}

          {chores.length === 0 && (
            <div className="empty-state">No chores yet. Add one to get started!</div>
          )}
        </>
      )}
    </div>
  )
}

export default ChoresList

