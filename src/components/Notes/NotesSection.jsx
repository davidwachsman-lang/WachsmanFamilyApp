import { useState, useEffect } from 'react'
import { supabase } from '../../services/supabase'
import './NotesSection.css'

const NotesSection = () => {
  const [notes, setNotes] = useState(null)
  const [loading, setLoading] = useState(true)
  const [content, setContent] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [currentWeekStart, setCurrentWeekStart] = useState(getWeekStart(new Date()))
  const [lastSaved, setLastSaved] = useState(null)

  // Helper function to get the start of the week (Sunday)
  function getWeekStart(date) {
    const d = new Date(date)
    d.setDate(d.getDate() - d.getDay())
    d.setHours(0, 0, 0, 0)
    return d.toISOString().split('T')[0]
  }

  useEffect(() => {
    loadNotes()
    
    // Subscribe to real-time changes
    const channel = supabase
      .channel('notes-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'notes' },
        () => {
          loadNotes()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [currentWeekStart])

  const loadNotes = async () => {
    try {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('week_start', currentWeekStart)
        .maybeSingle()
      
      if (error) throw error
      
      if (data) {
        setNotes(data)
        setContent(data.content)
        setLastSaved(data.updated_at)
      } else {
        setNotes(null)
        setContent('')
        setLastSaved(null)
      }
    } catch (error) {
      console.error('Error loading notes:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!content.trim() && notes) {
      // Delete note if content is empty
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', notes.id)
      
      if (!error) {
        setNotes(null)
        setLastSaved(null)
      }
      return
    }

    if (!content.trim()) return

    setIsSaving(true)
    try {
      if (notes) {
        // Update existing note
        const { data, error } = await supabase
          .from('notes')
          .update({
            content: content.trim(),
            updated_at: new Date().toISOString()
          })
          .eq('id', notes.id)
          .select()
          .single()
        
        if (error) throw error
        setNotes(data)
        setLastSaved(data.updated_at)
      } else {
        // Create new note
        const { data, error } = await supabase
          .from('notes')
          .insert([{
            content: content.trim(),
            week_start: currentWeekStart
          }])
          .select()
          .single()
        
        if (error) throw error
        setNotes(data)
        setLastSaved(data.updated_at)
      }
    } catch (error) {
      console.error('Error saving notes:', error)
      alert('Failed to save notes. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleAutoSave = async () => {
    if (!content.trim()) return
    
    // Only auto-save if content has changed
    if (notes && content.trim() === notes.content) return
    
    // Debounce auto-save
    clearTimeout(window.notesAutoSaveTimer)
    window.notesAutoSaveTimer = setTimeout(() => {
      handleSave()
    }, 2000)
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

  const formatLastSaved = () => {
    if (!lastSaved) return null
    const date = new Date(lastSaved)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    
    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`
    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
  }

  return (
    <div className="notes-section">
      <div className="notes-header">
        <h2>Weekly Notes</h2>
        {lastSaved && (
          <span className="last-saved">Last saved: {formatLastSaved()}</span>
        )}
      </div>

      {formatWeekRange()}

      {loading ? (
        <div className="loading">Loading notes...</div>
      ) : (
        <div className="notes-content">
          <textarea
            value={content}
            onChange={(e) => {
              setContent(e.target.value)
              handleAutoSave()
            }}
            placeholder="Add your weekly notes here... They'll auto-save as you type."
            className="notes-textarea"
            rows="12"
          />
          <div className="notes-actions">
            <button 
              onClick={handleSave} 
              disabled={isSaving || !content.trim()}
              className="save-btn"
            >
              {isSaving ? 'Saving...' : 'Save Notes'}
            </button>
            {content.trim() && (
              <button 
                onClick={() => {
                  if (window.confirm('Are you sure you want to clear all notes?')) {
                    setContent('')
                    handleSave()
                  }
                }}
                className="clear-btn"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default NotesSection

