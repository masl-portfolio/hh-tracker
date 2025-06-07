import React, { useContext, useState } from 'react'
import AppContext from '../context/AppContext'
import QuickActividadForm from './QuickActividadForm'
import HistorialActividades from './HistorialActividades'

const TareaCard = ({ projectId, task }) => {
  const { setTaskStatus, addActivity } = useContext(AppContext)
  const [showForm, setShowForm] = useState(false)
  const [showHistory, setShowHistory] = useState(false)

  const totalHours = (task.activities || []).reduce((s, a) => s + a.hours, 0)

  const handleAdd = data => {
    addActivity(projectId, task.id, data)
    setShowForm(false)
  }

  const diff = totalHours > task.estimatedHours

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-3 mb-2">
      <div className="flex justify-between items-center">
        <h3 className="font-medium text-gray-800">{task.title}</h3>
        <select
          value={task.status}
          onChange={e => setTaskStatus(projectId, task.id, e.target.value)}
          className="text-sm border rounded px-1 py-0.5"
        >
          <option value="backlog">Backlog</option>
          <option value="en desarrollo">En desarrollo</option>
          <option value="bloqueada">Bloqueada</option>
          <option value="completada">Completada</option>
          <option value="cancelada">Cancelada</option>
        </select>
      </div>
      <div
        className={`text-sm mt-1 ${diff ? 'text-red-600' : 'text-gray-600'}`}
      >
        {totalHours.toFixed(1)}h / {task.estimatedHours}h
      </div>
      <div className="mt-2 space-x-2">
        <button
          className="text-blue-600 text-sm"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? 'Cancelar' : 'Nueva actividad'}
        </button>
        <button
          className="text-blue-600 text-sm"
          onClick={() => setShowHistory(!showHistory)}
        >
          {showHistory ? 'Ocultar' : 'Historial'}
        </button>
      </div>
      {showForm && <QuickActividadForm onSubmit={handleAdd} />}
      {showHistory && (
        <HistorialActividades activities={task.activities || []} />
      )}
    </div>
  )
}

export default TareaCard
