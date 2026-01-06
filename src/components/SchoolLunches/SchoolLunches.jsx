import { useState, useEffect } from 'react'
import { supabase } from '../../services/supabase'
import './SchoolLunches.css'

const SchoolLunches = () => {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
  const kids = ['Char', 'Leo', 'Sadie']
  const [lunches, setLunches] = useState({})
  const [loading, setLoading] = useState(true)

  // Helper function to get the start of the week (Monday)
  function getWeekStart(date) {
    const d = new Date(date)
    const dayOfWeek = d.getDay()
    const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1
    d.setDate(d.getDate() - diff)
    d.setHours(0, 0, 0, 0)
    return d.toISOString().split('T')[0]
  }

  const currentWeekStart = getWeekStart(new Date())

  useEffect(() => {
    loadLunches()
    
    // Subscribe to real-time changes
    const channel = supabase
      .channel('school-lunches-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'school_lunches' },
        () => {
          loadLunches()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const loadLunches = async () => {
    try {
      const { data, error } = await supabase
        .from('school_lunches')
        .select('*')
        .eq('week_start', currentWeekStart)
      
      if (error) throw error
      
      // Convert array to object for easy lookup
      const lunchesMap = {}
      if (data) {
        data.forEach(item => {
          const key = `${item.kid}_${item.day}`
          lunchesMap[key] = item.packed || false
        })
      }
      
      setLunches(lunchesMap)
    } catch (error) {
      console.error('Error loading lunches:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleToggleLunch = async (kid, day) => {
    const key = `${kid}_${day}`
    const newValue = !lunches[key]
    
    // Optimistically update UI
    setLunches(prev => ({
      ...prev,
      [key]: newValue
    }))

    try {
      // Check if record exists
      const { data: existing } = await supabase
        .from('school_lunches')
        .select('id')
        .eq('week_start', currentWeekStart)
        .eq('kid', kid)
        .eq('day', day)
        .single()

      if (existing) {
        // Update existing record
        const { error } = await supabase
          .from('school_lunches')
          .update({ packed: newValue })
          .eq('id', existing.id)
        
        if (error) throw error
      } else {
        // Insert new record
        const { error } = await supabase
          .from('school_lunches')
          .insert([{
            week_start: currentWeekStart,
            kid,
            day,
            packed: newValue
          }])
        
        if (error) throw error
      }
    } catch (error) {
      console.error('Error updating lunch:', error)
      // Revert optimistic update on error
      setLunches(prev => ({
        ...prev,
        [key]: !newValue
      }))
    }
  }

  return (
    <div className="school-lunches">
      <div className="school-lunches-header">
        <h2>School Lunches</h2>
        <p className="school-lunches-subtitle">(Day Packed Lunch is Needed)</p>
      </div>

      {loading ? (
        <div className="loading">Loading...</div>
      ) : (
        <div className="lunches-table-container">
          <table className="lunches-table">
            <thead>
              <tr>
                <th className="kid-header"></th>
                {days.map(day => {
                  // Abbreviate days: Mon, Tue, Wed, Thu, Fri
                  const abbrev = day.substring(0, 3)
                  return (
                    <th key={day} className="day-header">
                      {abbrev}
                    </th>
                  )
                })}
              </tr>
            </thead>
            <tbody>
              {kids.map(kid => (
                <tr key={kid}>
                  <td className="kid-label">{kid}</td>
                  {days.map(day => {
                    const key = `${kid}_${day}`
                    const isChecked = lunches[key] || false
                    
                    return (
                      <td key={day} className="lunch-cell">
                        <label className="lunch-checkbox-label">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleToggleLunch(kid, day)}
                            className="lunch-checkbox"
                          />
                        </label>
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default SchoolLunches

