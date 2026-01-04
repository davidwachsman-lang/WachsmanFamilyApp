import { useState, useEffect } from 'react'
import { supabase } from '../../services/supabase'
import './Errands.css'

const Errands = () => {
  const [errands, setErrands] = useState([])
  const [loading, setLoading] = useState(true)
  const [newErrand, setNewErrand] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    loadErrands()
    
    // Subscribe to real-time changes
    const channel = supabase
      .channel('errands-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'errands' },
        () => {
          loadErrands()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const loadErrands = async () => {
    try {
      const { data, error } = await supabase
        .from('errands')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      setErrands(data || [])
    } catch (error) {
      console.error('Error loading errands:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddErrand = async (e) => {
    e.preventDefault()
    if (!newErrand.trim()) return

    setIsSubmitting(true)
    try {
      const { error } = await supabase
        .from('errands')
        .insert([{
          title: newErrand.trim(),
          completed: false
        }])
      
      if (error) throw error
      
      setNewErrand('')
      loadErrands()
    } catch (error) {
      console.error('Error adding errand:', error)
      alert('Failed to add errand. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleToggleErrand = async (errand) => {
    try {
      const { error } = await supabase
        .from('errands')
        .update({ completed: !errand.completed })
        .eq('id', errand.id)
      
      if (error) throw error
      loadErrands()
    } catch (error) {
      console.error('Error updating errand:', error)
    }
  }

  const handleDeleteErrand = async (errandId) => {
    try {
      const { error } = await supabase
        .from('errands')
        .delete()
        .eq('id', errandId)
      
      if (error) throw error
      loadErrands()
    } catch (error) {
      console.error('Error deleting errand:', error)
    }
  }

  return (
    <div className="errands">
      <div className="errands-header">
        <h2>Errands / Ad-Hoc Requests</h2>
      </div>

      <form onSubmit={handleAddErrand} className="add-errand-form">
        <input
          type="text"
          value={newErrand}
          onChange={(e) => setNewErrand(e.target.value)}
          placeholder="Add new errand or request..."
          className="errand-input"
          disabled={isSubmitting}
        />
        <button type="submit" disabled={isSubmitting || !newErrand.trim()} className="add-errand-btn">
          Add
        </button>
      </form>

      {loading ? (
        <div className="loading">Loading errands...</div>
      ) : (
        <div className="errands-checklist">
          {errands.length === 0 ? (
            <div className="empty-state">No errands yet. Add one to get started!</div>
          ) : (
            errands.map(errand => (
              <div key={errand.id} className="errand-item">
                <label className="errand-checkbox-label">
                  <input
                    type="checkbox"
                    checked={errand.completed || false}
                    onChange={() => handleToggleErrand(errand)}
                    className="errand-checkbox"
                  />
                  <span className={errand.completed ? 'errand-text completed' : 'errand-text'}>
                    {errand.title}
                  </span>
                </label>
                <button
                  onClick={() => handleDeleteErrand(errand.id)}
                  className="delete-errand-btn"
                  aria-label="Delete errand"
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

export default Errands

