import { useState, useEffect, useMemo } from 'react'
import { getWeekEvents, getMonthEvents } from '../../services/calendarApi'
import CalendarEvent from './CalendarEvent'
import './CalendarView.css'

const CalendarView = () => {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState('week') // 'week' or 'month'
  const [error, setError] = useState(null)

  // Load events when view mode changes
  useEffect(() => {
    loadEvents()
  }, [viewMode])

  const loadEvents = async () => {
    setLoading(true)
    setError(null)
    try {
      console.log('Loading events for view mode:', viewMode)
      const data = viewMode === 'week' ? await getWeekEvents() : await getMonthEvents()
      console.log('Loaded events:', data)
      setEvents(data)
      if (data.length === 0) {
        console.log('No events found. This might be normal if there are no events in the selected time range.')
      }
    } catch (err) {
      const errorMessage = err.message || 'Failed to load calendar events.'
      setError(errorMessage)
      console.error('Calendar error:', err)
      
      // Show helpful message if backend is not configured
      if (errorMessage.includes('No stored refresh token') || errorMessage.includes('re-authorize') || errorMessage.includes('expired') || errorMessage.includes('revoked')) {
        setError(`${errorMessage} Click "Re-Authorize Calendar" in the header to fix this.`)
        // Dispatch event to show admin auth
        window.dispatchEvent(new CustomEvent('calendar-auth-error', { detail: errorMessage }))
      }
    } finally {
      setLoading(false)
    }
  }

  // Generate time slots (30-minute intervals from 8 AM to 8 PM)
  const timeSlots = useMemo(() => {
    const slots = []
    // Include 8 AM through 8 PM (20:00)
    for (let hour = 8; hour <= 20; hour++) {
      // For 8 PM, only add 8:00, not 8:30
      const maxMinute = hour === 20 ? 0 : 60
      for (let minute = 0; minute < maxMinute; minute += 30) {
        const time = new Date()
        time.setHours(hour, minute, 0, 0)
        slots.push(time)
      }
    }
    return slots
  }, [])

  // Get week days (Monday through Friday only)
  // Shows the current/upcoming week (if it's Saturday or Sunday, show next week)
  const weekDays = useMemo(() => {
    const now = new Date()
    const startOfWeek = new Date(now)
    
    // Find Monday of the week we want to show
    // If today is Saturday (6) or Sunday (0), show next week's Monday-Friday
    // Otherwise, show this week's Monday-Friday
    const dayOfWeek = now.getDay()
    let diff
    if (dayOfWeek === 0) {
      // Sunday - show next week (go forward 1 day to Monday)
      diff = -1 // Negative means add days
    } else if (dayOfWeek === 6) {
      // Saturday - show next week (go forward 2 days to Monday)
      diff = -2 // Negative means add days
    } else {
      // Monday (1) through Friday (5) - show this week (go back to Monday)
      diff = dayOfWeek - 1 // Positive means subtract days
    }
    
    startOfWeek.setDate(now.getDate() - diff) // Subtracting negative = adding
    startOfWeek.setHours(0, 0, 0, 0)
    
    console.log('Current date:', now.toDateString(), 'Day of week:', dayOfWeek, 'Diff:', diff)
    console.log('Calculated Monday:', startOfWeek.toDateString())
    
    const days = []
    // Only Monday (1) through Friday (5)
    for (let i = 0; i < 5; i++) {
      const day = new Date(startOfWeek)
      day.setDate(startOfWeek.getDate() + i)
      days.push(day)
    }
    
    console.log('Week days:', days.map(d => d.toDateString()))
    return days
  }, [])

  // Organize events by day and time for grid positioning
  const eventsByDay = useMemo(() => {
    const organized = {}
    weekDays.forEach(day => {
      organized[day.toDateString()] = []
    })

    console.log('Organizing events for week days:', weekDays.map(d => d.toDateString()))

    events.forEach(event => {
      let eventDate
      
      if (event.start?.dateTime) {
        // Timed event
        eventDate = new Date(event.start.dateTime)
      } else if (event.start?.date) {
        // All-day event (date only, no time)
        eventDate = new Date(event.start.date + 'T00:00:00')
      } else {
        console.warn('Event missing start date:', event)
        return
      }
      
      const dayKey = eventDate.toDateString()
      console.log('Event date:', eventDate.toDateString(), 'Day key:', dayKey, 'Event:', event.summary)
      
      if (organized[dayKey]) {
        organized[dayKey].push(event)
      } else {
        console.log('Event not in current week:', dayKey, 'Event:', event.summary)
      }
    })

    // Sort events by start time within each day
    Object.keys(organized).forEach(day => {
      organized[day].sort((a, b) => {
        const timeA = a.start?.dateTime ? new Date(a.start.dateTime) : new Date(a.start?.date + 'T00:00:00')
        const timeB = b.start?.dateTime ? new Date(b.start.dateTime) : new Date(b.start?.date + 'T00:00:00')
        return timeA - timeB
      })
    })

    console.log('Organized events:', organized)
    return organized
  }, [events, weekDays])

  // Calculate event position and height in grid
  const getEventStyle = (event, dayIndex) => {
    if (!event.start?.dateTime) {
      // All-day events handled separately
      return null
    }

    const startTime = new Date(event.start.dateTime)
    const endTime = new Date(event.end?.dateTime || event.start.dateTime)
    
    // Each time slot is 30px tall (30 minutes)
    const slotHeight = 30
    const startHour = startTime.getHours()
    const startMinute = startTime.getMinutes()
    const endHour = endTime.getHours()
    const endMinute = endTime.getMinutes()
    
    // Filter out events that start before 8 AM or after 8 PM
    // For events that span outside the range, show only the visible portion
    if (startHour < 8 || (startHour === 8 && startMinute === 0 && startTime.getSeconds() === 0) === false && startHour < 8) {
      // Event starts before 8 AM - check if it extends into visible range
      if (endHour < 8 || (endHour === 8 && endMinute === 0)) {
        return null // Event is completely before 8 AM
      }
      // Event spans into visible range, start from top
      const startOffset = 0
      const startTotalMinutes = 8 * 60 // 8 AM in minutes
      const endTotalMinutes = Math.min(endHour * 60 + endMinute, 20 * 60) // Cap at 8 PM
      const durationMinutes = endTotalMinutes - startTotalMinutes
      const duration = Math.max((durationMinutes / 30) * slotHeight, 30)
      
      return {
        position: 'absolute',
        top: `${startOffset}px`,
        left: '2px',
        right: '2px',
        height: `${duration}px`,
        zIndex: 5
      }
    }
    
    if (startHour >= 20) {
      // Event starts at or after 8 PM - don't show
      return null
    }
    
    // Calculate position from 8 AM (start of visible hours)
    const minutesFromStart = (startHour - 8) * 60 + startMinute
    const startOffset = Math.max(0, (minutesFromStart / 30) * slotHeight)
    
    // Calculate duration in minutes
    const startTotalMinutes = startHour * 60 + startMinute
    const endTotalMinutes = Math.min(endHour * 60 + endMinute, 20 * 60) // Cap at 8 PM
    const durationMinutes = Math.max(endTotalMinutes - startTotalMinutes, 30) // Minimum 30 minutes
    const duration = (durationMinutes / 30) * slotHeight
    
    return {
      position: 'absolute',
      top: `${startOffset}px`,
      left: '2px',
      right: '2px',
      height: `${duration}px`,
      zIndex: 5
    }
  }


  return (
    <div className="calendar-view">
      <div className="calendar-header">
        <h2>Family Calendar</h2>
        <div className="view-controls">
          <button 
            className={viewMode === 'week' ? 'active' : ''}
            onClick={() => setViewMode('week')}
          >
            Week
          </button>
          <button 
            className={viewMode === 'month' ? 'active' : ''}
            onClick={() => setViewMode('month')}
          >
            Month
          </button>
          <button onClick={loadEvents} className="refresh-btn">
            ↻ Refresh
          </button>
        </div>
      </div>

      {loading && (
        <div className="loading">Loading calendar events...</div>
      )}

      {error && (
        <div className="error-message">{error}</div>
      )}

      {!loading && !error && viewMode === 'week' && (
        <div className="calendar-week-grid">
          {/* Day headers */}
          <div className="calendar-grid-header">
            <div className="time-column-header"></div>
            {weekDays.map((day, index) => {
              const isToday = day.toDateString() === new Date().toDateString()
              return (
                <div key={index} className={`day-header ${isToday ? 'today' : ''}`}>
                  <div className="day-header-content">
                    <span className="day-date">{day.toLocaleDateString('en-US', { month: 'short' })} {day.getDate()}</span>
                    <span className="day-name">{day.toLocaleDateString('en-US', { weekday: 'short' })}</span>
                  </div>
                </div>
              )
            })}
          </div>

          {/* All-day events row */}
          {Object.keys(eventsByDay).some(day => 
            eventsByDay[day].some(e => !e.start?.dateTime)
          ) && (
            <div className="all-day-row">
              <div className="time-column all-day-label">All Day</div>
              <div className="all-day-events-container">
                {weekDays.map((day, dayIndex) => {
                  const dayKey = day.toDateString()
                  const allDayEvents = eventsByDay[dayKey]?.filter(e => !e.start?.dateTime) || []
                  return (
                    <div key={dayIndex} className="all-day-cell">
                      {allDayEvents.map(event => (
                        <CalendarEvent key={event.id} event={event} compact />
                      ))}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Time grid */}
          <div className="calendar-grid-body">
            <div className="time-column">
              {timeSlots.map((time, index) => (
                index % 2 === 0 && (
                  <div key={index} className="time-slot-label">
                    {time.toLocaleTimeString('en-US', { 
                      hour: 'numeric', 
                      minute: '2-digit',
                      hour12: true 
                    })}
                  </div>
                )
              ))}
            </div>

            <div className="calendar-grid-columns">
              {weekDays.map((day, dayIndex) => {
                const dayKey = day.toDateString()
                const dayEvents = eventsByDay[dayKey]?.filter(e => e.start?.dateTime) || []
                const isToday = day.toDateString() === new Date().toDateString()
                
                return (
                  <div key={dayIndex} className={`calendar-day-column ${isToday ? 'today' : ''}`}>
                    {timeSlots.map((slot, slotIndex) => (
                      <div key={slotIndex} className="time-slot"></div>
                    ))}
                    
                    {/* Render events positioned absolutely */}
                    <div className="events-overlay">
                      {dayEvents.map(event => {
                        const eventStyle = getEventStyle(event, dayIndex)
                        if (!eventStyle) return null
                        return (
                          <div
                            key={event.id}
                            className="calendar-event-wrapper"
                            style={eventStyle}
                          >
                            <CalendarEvent event={event} compact />
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Month view - keep original list style for now */}
      {!loading && !error && viewMode === 'month' && (
        <div className="calendar-events">
          {Object.keys(eventsByDay).length === 0 ? (
            <div className="no-events">No events scheduled for this month</div>
          ) : (
            Object.entries(eventsByDay).map(([date, dateEvents]) => (
              <div key={date} className="date-group">
                <div className="date-header">
                  <div className="date-day">{new Date(date).toLocaleDateString('en-US', { weekday: 'long' })}</div>
                  <div className="date-number">{new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                </div>
                <div className="events-list">
                  {dateEvents.map((event) => (
                    <CalendarEvent key={event.id} event={event} />
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}

export default CalendarView
