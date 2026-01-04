import { useState, Fragment, useMemo } from 'react'
import './DinnerSchedule.css'

const DinnerSchedule = () => {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
  const parentWeeks = ['Week A', 'Week B']
  const kids = ['Char', 'Leo', 'Sadie']

  // Calculate which week we're in (A or B)
  // Starting with this week as Week A
  const currentWeek = useMemo(() => {
    const now = new Date()
    const startOfWeek = new Date(now)
    const dayOfWeek = now.getDay() // 0 for Sunday, 1 for Monday, ..., 6 for Saturday

    // If today is Sunday (0) or Saturday (6), set startOfWeek to next Monday
    if (dayOfWeek === 0) { // Sunday
      startOfWeek.setDate(now.getDate() + 1) // Go to Monday
    } else if (dayOfWeek === 6) { // Saturday
      startOfWeek.setDate(now.getDate() + 2) // Go to next Monday
    } else {
      // For Mon-Fri, go back to current Monday
      startOfWeek.setDate(now.getDate() - (dayOfWeek - 1))
    }
    startOfWeek.setHours(0, 0, 0, 0)

    // Use January 1, 2024 as the reference Week A (it was a Monday)
    const referenceDate = new Date(2024, 0, 1) // January 1, 2024 (Monday)
    referenceDate.setHours(0, 0, 0, 0)

    // Calculate weeks since reference
    const diffTime = startOfWeek - referenceDate
    const diffWeeks = Math.floor(diffTime / (7 * 24 * 60 * 60 * 1000))
    
    // Week A if odd number of weeks, Week B if even (flipped to make current week A)
    return diffWeeks % 2 === 0 ? 'Week B' : 'Week A'
  }, [])
  // Note: Char uses "Fruit/Side", Leo and Sadie use "Fruit/Veggie"
  const getRowTypesForKid = (kid) => {
    if (kid === 'Char') {
      return ['Protein/main', 'Fruit/Side', 'Starch/Side']
    }
    return ['Protein/main', 'Fruit/Veggie', 'Starch/Side']
  }

  // Hardcoded parent dinner schedule
  const [parentDinners, setParentDinners] = useState({
    'Week A_Monday': 'Salmon Sushi Bowls',
    'Week A_Tuesday': 'Buffalo Chicken Tacos',
    'Week A_Wednesday': 'Egg Roll in a Bowl',
    'Week A_Thursday': 'Soy Vey Chicken',
    'Week A_Friday': 'Breakfast for Dinner',
    'Week B_Monday': 'Egg Roll in a Bowl',
    'Week B_Tuesday': 'White Bean Chili',
    'Week B_Wednesday': 'Malibu Halibut',
    'Week B_Thursday': 'Food and Co (Takeout)',
    'Week B_Friday': 'Taco Night',
  })

  // Hardcoded kids dinner schedule
  const [kidsDinners, setKidsDinners] = useState({
    // Charlotte
    'Char_Protein/main_Monday': 'PB&J - JIF PB; Crofters jelly; Dave\'s bread white',
    'Char_Fruit/Side_Monday': 'Apples (she can also eat cucumbers and edamame)',
    'Char_Starch/Side_Monday': 'Cheese stick',
    'Char_Protein/main_Tuesday': 'Chicken Tenders',
    'Char_Fruit/Side_Tuesday': 'Pineapple',
    'Char_Starch/Side_Tuesday': 'Cheese stick + Baked Lays',
    'Char_Protein/main_Wednesday': 'Pasta + Marinara',
    'Char_Fruit/Side_Wednesday': 'Grapes + Strawberries',
    'Char_Starch/Side_Wednesday': 'Cheese stick',
    'Char_Protein/main_Thursday': 'Chicken Sandwich (cutlet from freezer + bun)',
    'Char_Fruit/Side_Thursday': 'Grapes',
    'Char_Starch/Side_Thursday': 'Baked Lays',
    
    // Leo
    'Leo_Protein/main_Monday': 'Protein waffles: PB + sprinkles',
    'Leo_Fruit/Veggie_Monday': 'Apples',
    'Leo_Starch/Side_Monday': 'Cheese stick',
    'Leo_Protein/main_Tuesday': 'Turkey Burger',
    'Leo_Fruit/Veggie_Tuesday': 'Freeze Dried Strawberries',
    'Leo_Starch/Side_Tuesday': 'White Rice',
    'Leo_Protein/main_Wednesday': 'Pasta + Parm Cheese',
    'Leo_Fruit/Veggie_Wednesday': 'Grapes + FD Strawberries',
    'Leo_Starch/Side_Wednesday': '',
    'Leo_Protein/main_Thursday': 'Turkey Burger',
    'Leo_Fruit/Veggie_Thursday': 'Freeze Dried Strawberries',
    'Leo_Starch/Side_Thursday': 'White Rice',
    
    // Sadie
    'Sadie_Protein/main_Monday': 'Sushi - salmon (small piece)',
    'Sadie_Fruit/Veggie_Monday': 'Veggies from adult dinner',
    'Sadie_Starch/Side_Monday': 'Veggies from adult dinner',
    'Sadie_Protein/main_Tuesday': 'Chicken Tenders',
    'Sadie_Fruit/Veggie_Tuesday': 'Pineapple',
    'Sadie_Starch/Side_Tuesday': 'Strawberries',
    'Sadie_Protein/main_Wednesday': 'Pasta + Butter',
    'Sadie_Fruit/Veggie_Wednesday': 'Grapes + Strawberries',
    'Sadie_Starch/Side_Wednesday': '',
    'Sadie_Protein/main_Thursday': 'Burger',
    'Sadie_Fruit/Veggie_Thursday': 'Potato Chips',
    'Sadie_Starch/Side_Thursday': '',
  })

  const [editingCell, setEditingCell] = useState(null)
  const [editValue, setEditValue] = useState('')
  const [editingTable, setEditingTable] = useState(null) // 'parents' or 'kids'

  const getCellKey = (identifier, day) => {
    return `${identifier}_${day}`
  }

  const getKidsCellKey = (kid, rowType, day) => {
    return `${kid}_${rowType}_${day}`
  }

  const getParentCellValue = (week, day) => {
    const key = getCellKey(week, day)
    return parentDinners[key] || ''
  }

  const getKidsCellValue = (kid, rowType, day) => {
    const key = getKidsCellKey(kid, rowType, day)
    return kidsDinners[key] || ''
  }

  const handleParentCellClick = (week, day) => {
    const key = getCellKey(week, day)
    setEditingCell(key)
    setEditingTable('parents')
    setEditValue(getParentCellValue(week, day))
  }

  const handleKidsCellClick = (kid, rowType, day) => {
    const key = getKidsCellKey(kid, rowType, day)
    setEditingCell(key)
    setEditingTable('kids')
    setEditValue(getKidsCellValue(kid, rowType, day))
  }

  const handleParentCellBlur = (week, day) => {
    const key = getCellKey(week, day)
    const updatedDinners = { ...parentDinners }
    updatedDinners[key] = editValue.trim()
    setParentDinners(updatedDinners)
    setEditingCell(null)
    setEditingTable(null)
    setEditValue('')
  }

  const handleKidsCellBlur = (kid, rowType, day) => {
    const key = getKidsCellKey(kid, rowType, day)
    const updatedDinners = { ...kidsDinners }
    updatedDinners[key] = editValue.trim()
    setKidsDinners(updatedDinners)
    setEditingCell(null)
    setEditingTable(null)
    setEditValue('')
  }

  const handleParentCellKeyDown = (e, week, day) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleParentCellBlur(week, day)
    } else if (e.key === 'Escape') {
      setEditingCell(null)
      setEditingTable(null)
      setEditValue('')
    }
  }

  const handleKidsCellKeyDown = (e, kid, rowType, day) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleKidsCellBlur(kid, rowType, day)
    } else if (e.key === 'Escape') {
      setEditingCell(null)
      setEditingTable(null)
      setEditValue('')
    }
  }

  return (
    <div className="dinner-schedule">
      <div className="dinner-schedule-header">
        <h2>Family Dinner Schedule</h2>
      </div>

      {/* Parents Dinner Table */}
      <div className="dinner-table-section">
        <h3 className="table-title">Parents Dinner</h3>
        <div className="dinner-table-container">
          <table className="dinner-table">
            <thead>
              <tr>
                <th className="week-header"></th>
                {days.map(day => (
                  <th key={day} className="day-header">
                    {day.substring(0, 3)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {parentWeeks.map(week => {
                const isCurrentWeek = week === currentWeek
                return (
                <tr key={week} className={isCurrentWeek ? 'current-week-row' : ''}>
                  <td className={`week-label ${isCurrentWeek ? 'current-week-label' : ''}`}>{week}</td>
                  {days.map(day => {
                    const key = getCellKey(week, day)
                    const isEditing = editingCell === key && editingTable === 'parents'
                    const value = getParentCellValue(week, day)
                    
                    return (
                      <td 
                        key={day} 
                        className={`dinner-cell ${isCurrentWeek ? 'current-week-cell' : ''}`}
                        onClick={() => !isEditing && handleParentCellClick(week, day)}
                      >
                        {isEditing ? (
                          <input
                            type="text"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onBlur={() => handleParentCellBlur(week, day)}
                            onKeyDown={(e) => handleParentCellKeyDown(e, week, day)}
                            className="dinner-input"
                            autoFocus
                            placeholder="Add dinner..."
                          />
                        ) : (
                          <div className="dinner-content">
                            {value || <span className="placeholder">Click to add</span>}
                          </div>
                        )}
                      </td>
                    )
                  })}
                </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Kids Dinner Table */}
      <div className="dinner-table-section">
        <h3 className="table-title">Kids Dinner</h3>
        <div className="dinner-table-container">
          <table className="dinner-table">
            <thead>
              <tr>
                <th className="week-header"></th>
                {days.map(day => (
                  <th key={day} className="day-header">
                    {day.substring(0, 3)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {kids.map(kid => {
                const rowTypes = getRowTypesForKid(kid)
                return (
                  <Fragment key={kid}>
                    {rowTypes.map((rowType, rowIndex) => {
                      const isFirstRow = rowIndex === 0
                      const isLastRow = rowIndex === rowTypes.length - 1
                      const rowClass = isFirstRow ? 'kid-section-first' : isLastRow ? 'kid-section-last' : ''
                      
                      return (
                      <tr key={`${kid}-${rowType}`} className={rowClass}>
                        {isFirstRow && (
                          <td className="week-label" rowSpan={rowTypes.length}>
                            {kid}
                          </td>
                        )}
                      {days.map(day => {
                        const key = getKidsCellKey(kid, rowType, day)
                        const isEditing = editingCell === key && editingTable === 'kids'
                        const value = getKidsCellValue(kid, rowType, day)
                        
                        return (
                          <td 
                            key={day} 
                            className={`dinner-cell ${rowClass}`}
                            onClick={() => !isEditing && handleKidsCellClick(kid, rowType, day)}
                          >
                            {isEditing ? (
                              <input
                                type="text"
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                onBlur={() => handleKidsCellBlur(kid, rowType, day)}
                                onKeyDown={(e) => handleKidsCellKeyDown(e, kid, rowType, day)}
                                className="dinner-input"
                                autoFocus
                                placeholder="Add..."
                              />
                            ) : (
                              <div className="dinner-content">
                                {value}
                              </div>
                            )}
                          </td>
                        )
                      })}
                      </tr>
                      )
                    })}
                  </Fragment>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default DinnerSchedule
