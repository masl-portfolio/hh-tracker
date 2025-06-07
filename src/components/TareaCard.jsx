import React, { useContext, useState } from 'react'
import AppContext from '../context/AppContext'
import QuickActividadForm from './QuickActividadForm'
import HistorialActividades from './HistorialActividades'

const TareaCard = ({ projectId, task }) => {
  const { setTaskStatus, addActivity, updateTask, deleteTask } = useContext(AppContext)
  const [showForm, setShowForm] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [editing, setEditing] = useState(false)
  const [title, setTitle] = useState(task.title)
  const [hours, setHours] = useState(String(task.estimatedHours))

  const totalHours = (task.activities || []).reduce((s, a) => s + a.hours, 0)

  const handleAdd = data => {
    addActivity(projectId, task.id, data)
    setShowForm(false)
  }

  const diff = totalHours > task.estimatedHours

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-3 mb-2">
      <div className="flex justify-between items-center">
        {editing ? (
          <input
            className="border rounded px-1 mr-2 flex-1"
            value={title}
            onChange={e => setTitle(e.target.value)}
          />
        ) : (
          <h3 className="font-medium text-gray-800 flex-1">{task.title}</h3>
        )}
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
        {totalHours.toFixed(1)}h /
        {editing ? (
          <input
            className="border rounded w-16 text-sm ml-1 px-1"
            type="number"
            value={hours}
            onChange={e => setHours(e.target.value)}
          />
        ) : (
          <span> {task.estimatedHours}h</span>
        )}
      </div>
      <div className="mt-2 space-x-2">
        {editing ? (
          <>
            <button
              className="text-green-600 text-sm"
              onClick={() => {
                updateTask(projectId, task.id, {
                  title,
                  estimatedHours: parseFloat(hours) || 0,
                })
                setEditing(false)
              }}
            >
              Guardar
            </button>
            <button
              className="text-sm"
              onClick={() => {
                setEditing(false)
                setTitle(task.title)
                setHours(String(task.estimatedHours))
              }}
            >
              Cancelar
            </button>
            <button
              className="text-red-600 text-sm"
              onClick={() => deleteTask(projectId, task.id)}
            >
              Eliminar
            </button>
          </>
        ) : (
          <>
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
            <button
              className="text-blue-600 text-sm"
              onClick={() => setEditing(true)}
            >
              Editar
            </button>
            <button
              className="text-red-600 text-sm"
              onClick={() => deleteTask(projectId, task.id)}
            >
              Eliminar
            </button>
          </>
        )}
      </div>
      {showForm && <QuickActividadForm onSubmit={handleAdd} />}
      {showHistory && (
        <HistorialActividades
          activities={task.activities || []}
          projectId={projectId}
          taskId={task.id}
        />
      )}
    </div>
  )
}

export default TareaCard
