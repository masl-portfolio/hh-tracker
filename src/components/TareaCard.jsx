import React, { useContext, useState } from 'react'
import AppContext from '../context/AppContext'
import ActividadForm from './ActividadForm'
import HistorialActividades from './HistorialActividades'

const TareaCard = ({ projectId, task }) => {
  const { addActivity } = useContext(AppContext)
  const [showForm, setShowForm] = useState(false)

  const handleAddActivity = (activity) => {
    addActivity(projectId, task.id, activity)
    setShowForm(false)
  }

  return (
    <div className="border p-2 mb-2">
      <div className="flex justify-between">
        <h3 className="font-semibold">{task.title}</h3>
        <button onClick={() => setShowForm(!showForm)} className="text-sm text-blue-600">
          {showForm ? 'Cancelar' : 'Nueva actividad'}
        </button>
      </div>
      {showForm && (
        <ActividadForm onSubmit={handleAddActivity} />
      )}
      <HistorialActividades activities={task.activities} />
    </div>
  )
}

export default TareaCard
