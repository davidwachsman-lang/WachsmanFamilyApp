import { useState, useEffect } from 'react'
import CalendarView from './components/Calendar/CalendarView'
import DinnerSchedule from './components/DinnerSchedule/DinnerSchedule'
import WeeklyTodos from './components/WeeklyTodos/WeeklyTodos'
import SchoolLunches from './components/SchoolLunches/SchoolLunches'
import Errands from './components/Errands/Errands'
import Groceries from './components/Groceries/Groceries'
import AdminAuth from './components/AdminAuth/AdminAuth'
import './App.css'

function App() {
  const [showAdminAuth, setShowAdminAuth] = useState(false)

  // Check if calendar error indicates need for re-authorization
  useEffect(() => {
    const checkCalendarError = () => {
      // Listen for calendar errors that indicate token issues
      const errorListener = (e) => {
        if (e.detail?.includes('expired') || e.detail?.includes('revoked') || e.detail?.includes('re-authorize')) {
          setShowAdminAuth(true)
        }
      }
      window.addEventListener('calendar-auth-error', errorListener)
      return () => window.removeEventListener('calendar-auth-error', errorListener)
    }
    checkCalendarError()
  }, [])

  return (
    <div className="app">
      <header className="app-header">
        <h1>Wachsman Family App</h1>
        <button 
          onClick={() => setShowAdminAuth(!showAdminAuth)}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            padding: '8px 16px',
            background: '#4caf50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          {showAdminAuth ? 'Hide' : 'Re-Authorize Calendar'}
        </button>
      </header>
      
      {showAdminAuth && (
        <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
          <AdminAuth />
        </div>
      )}
      
      <main className="app-main">
        <div className="app-content">
          <div className="left-column">
            <CalendarView />
            <DinnerSchedule />
          </div>
          <div className="right-column">
            <WeeklyTodos />
            <SchoolLunches />
            <Errands />
            <Groceries />
          </div>
        </div>
      </main>
    </div>
  )
}

export default App

