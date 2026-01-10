import { useState, useEffect } from 'react'
import { supabase } from '../../services/supabase'
import './Groceries.css'

const Groceries = () => {
  const [groceries, setGroceries] = useState([])
  const [loading, setLoading] = useState(true)
  const [newGrocery, setNewGrocery] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    loadGroceries()
    
    // Subscribe to real-time changes
    const channel = supabase
      .channel('groceries-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'groceries' },
        () => {
          loadGroceries()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const loadGroceries = async () => {
    try {
      const { data, error } = await supabase
        .from('groceries')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) {
        console.error('Error loading groceries:', error)
        // Check if table doesn't exist
        if (error.message && error.message.includes('does not exist')) {
          console.error('❌ The "groceries" table does not exist in Supabase. Please run the SQL setup script.')
        }
        throw error
      }
      setGroceries(data || [])
    } catch (error) {
      console.error('Error loading groceries:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddGrocery = async (e) => {
    e.preventDefault()
    if (!newGrocery.trim()) return

    setIsSubmitting(true)
    try {
      const { error } = await supabase
        .from('groceries')
        .insert([{
          title: newGrocery.trim(),
          completed: false
        }])
      
      if (error) throw error
      
      setNewGrocery('')
      loadGroceries()
    } catch (error) {
      console.error('Error adding grocery:', error)
      const errorMessage = error.message || 'Failed to add grocery. Please try again.'
      alert(`Error: ${errorMessage}. Check the browser console for details.`)
      // Log full error details for debugging
      if (error.message) {
        console.error('Full error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        })
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleToggleGrocery = async (grocery) => {
    try {
      const { error } = await supabase
        .from('groceries')
        .update({ completed: !grocery.completed })
        .eq('id', grocery.id)
      
      if (error) throw error
      loadGroceries()
    } catch (error) {
      console.error('Error updating grocery:', error)
    }
  }

  const handleDeleteGrocery = async (groceryId) => {
    try {
      const { error } = await supabase
        .from('groceries')
        .delete()
        .eq('id', groceryId)
      
      if (error) throw error
      loadGroceries()
    } catch (error) {
      console.error('Error deleting grocery:', error)
    }
  }

  return (
    <div className="groceries">
      <div className="groceries-header">
        <h2>Grocery List</h2>
      </div>

      <form onSubmit={handleAddGrocery} className="add-grocery-form">
        <input
          type="text"
          value={newGrocery}
          onChange={(e) => setNewGrocery(e.target.value)}
          placeholder="Add grocery item..."
          className="grocery-input"
          disabled={isSubmitting}
        />
        <button type="submit" disabled={isSubmitting || !newGrocery.trim()} className="add-grocery-btn">
          Add
        </button>
      </form>

      {loading ? (
        <div className="loading">Loading groceries...</div>
      ) : (
        <div className="groceries-checklist">
          {groceries.length === 0 ? (
            <div className="empty-state">No groceries yet. Add one to get started!</div>
          ) : (
            groceries.map(grocery => (
              <div key={grocery.id} className="grocery-item">
                <label className="grocery-checkbox-label">
                  <input
                    type="checkbox"
                    checked={grocery.completed || false}
                    onChange={() => handleToggleGrocery(grocery)}
                    className="grocery-checkbox"
                  />
                  <span className={grocery.completed ? 'grocery-text completed' : 'grocery-text'}>
                    {grocery.title}
                  </span>
                </label>
                <button
                  onClick={() => handleDeleteGrocery(grocery.id)}
                  className="delete-grocery-btn"
                  aria-label="Delete grocery"
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

export default Groceries
