import { useState } from 'react'
import './CalendarEvent.css'

const CalendarEvent = ({ event, compact = false }) => {
  const [showTooltip, setShowTooltip] = useState(false)

  const formatTime = (dateTime) => {
    if (!dateTime) return ''
    const date = new Date(dateTime)
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    })
  }

  const formatDate = (dateTime) => {
    if (!dateTime) return ''
    const date = new Date(dateTime)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    })
  }

  const startTime = event.start?.dateTime || event.start?.date
  const endTime = event.end?.dateTime || event.end?.date

  // Check if event has additional details
  const hasDetails = event.description || event.location

  if (compact) {
    return (
      <div 
        className={`calendar-event compact ${hasDetails ? 'has-details' : ''} ${showTooltip ? 'expanded' : ''}`}
        onMouseEnter={() => hasDetails && setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onClick={() => hasDetails && setShowTooltip(!showTooltip)}
      >
        <div className="event-title">{event.summary || '(No Title)'}</div>
        {event.start?.dateTime && (
          <div className="event-time">
            {formatTime(startTime)}
          </div>
        )}
        {hasDetails && showTooltip && (
          <div className="event-details">
            {event.description && (
              <div className="event-description-compact">{event.description}</div>
            )}
            {event.location && (
              <div className="event-location-compact">📍 {event.location}</div>
            )}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="calendar-event">
      <div className="event-time">
        {event.start?.dateTime ? (
          <>
            {formatTime(startTime)} - {formatTime(endTime)}
          </>
        ) : (
          <span className="all-day">All Day</span>
        )}
      </div>
      <div className="event-title">{event.summary || '(No Title)'}</div>
      {event.description && (
        <div className="event-description">{event.description}</div>
      )}
      {event.location && (
        <div className="event-location">📍 {event.location}</div>
      )}
    </div>
  )
}

export default CalendarEvent

