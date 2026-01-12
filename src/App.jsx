import CalendarView from './components/Calendar/CalendarView'
import DinnerSchedule from './components/DinnerSchedule/DinnerSchedule'
import WeeklyTodos from './components/WeeklyTodos/WeeklyTodos'
import SchoolLunches from './components/SchoolLunches/SchoolLunches'
import Errands from './components/Errands/Errands'
import Groceries from './components/Groceries/Groceries'
import AdminAuth from './components/AdminAuth/AdminAuth'
import './App.css'

function App() {
  return (
    <div className="app">
      <header className="app-header">
        <h1>Wachsman Family App</h1>
      </header>
      
      <main className="app-main">
        <AdminAuth />
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

