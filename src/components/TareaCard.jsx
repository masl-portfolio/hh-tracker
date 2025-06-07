import React, { useContext, useState } from 'react'
import AppContext from '../context/AppContext'
import QuickActividadForm from './QuickActividadForm'
import HistorialActividades from './HistorialActividades'
import {
  FiEdit,
  FiTrash2,
  FiChevronUp,
  FiChevronDown,
  FiPlus,
  FiX,
  FiEye,
  FiEyeOff,
  FiSave,
} from 'react-icons/fi'

const TareaCard = ({ projectId, task }) => {
  const {
    setTaskStatus,
    addActivity,
    editTask,
    deleteTask,
    moveTask,
  } = useContext(AppContext)
  const [showForm, setShowForm] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [title, setTitle] = useState(task.title)
  const [hours, setHours] = useState(String(task.estimatedHours))

  const totalHours = (task.activities || []).reduce((s, a) => s + a.hours, 0)

  const handleAdd = data => {
    addActivity(projectId, task.id, data)
    setShowForm(false)
  }

  const handleSave = () => {
    if (!title) return
    editTask(projectId, task.id, {
      title,
      estimatedHours: parseFloat(hours) || 0,
    })
    setIsEditing(false)
  }

  const diff = totalHours > task.estimatedHours

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-3 mb-2">
      {isEditing ? (
        <div className="space-y-2">
          <input
            className="border rounded px-2 py-1 w-full"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Título"
          />
          <input
            className="border rounded px-2 py-1 w-full"
            type="number"
            value={hours}
            onChange={e => setHours(e.target.value)}
            placeholder="Horas estimadas"
          />
          <div className="space-x-2 text-sm">
            <button
              aria-label="Guardar tarea"
              className="bg-blue-600 text-white px-2 rounded"
              onClick={handleSave}
            >
              <FiSave />
            </button>
            <button
              aria-label="Cancelar"
              className="bg-gray-300 px-2 rounded"
              onClick={() => setIsEditing(false)}
            >
              <FiX />
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="flex justify-between items-center">
            <h3 className="font-medium text-gray-800">{task.title}</h3>
            <div className="space-x-2 text-sm">
              <button
                aria-label="Editar tarea"
                className="text-blue-600"
                onClick={() => setIsEditing(true)}
              >
                <FiEdit />
              </button>
              <button
                aria-label="Eliminar tarea"
                className="text-red-600"
                onClick={() => {
                  if (confirm('Eliminar tarea?')) deleteTask(projectId, task.id)
                }}
              >
                <FiTrash2 />
              </button>
              <button
                aria-label="Mover arriba"
                className="text-gray-600"
                onClick={() => moveTask(projectId, task.id, 'up')}
              >
                <FiChevronUp />
              </button>
              <button
                aria-label="Mover abajo"
                className="text-gray-600"
                onClick={() => moveTask(projectId, task.id, 'down')}
              >
                <FiChevronDown />
              </button>
              <select
                value={task.status}
                onChange={e => setTaskStatus(projectId, task.id, e.target.value)}
                className="border rounded px-1 py-0.5"
              >
                <option value="backlog">Backlog</option>
                <option value="en desarrollo">En desarrollo</option>
                <option value="bloqueada">Bloqueada</option>
                <option value="completada">Completada</option>
                <option value="cancelada">Cancelada</option>
              </select>
            </div>
          </div>
          <div
            className={`text-sm mt-1 ${diff ? 'text-red-600' : 'text-gray-600'}`}
          >
            {totalHours.toFixed(1)}h / {task.estimatedHours}h
          </div>
          <div className="mt-2 space-x-2">
            <button
              aria-label={showForm ? 'Cancelar' : 'Nueva actividad'}
              className="text-blue-600 text-sm"
              onClick={() => setShowForm(!showForm)}
            >
              {showForm ? <FiX /> : <FiPlus />}
            </button>
            <button
              aria-label={showHistory ? 'Ocultar historial' : 'Ver historial'}
              className="text-blue-600 text-sm"
              onClick={() => setShowHistory(!showHistory)}
            >
              {showHistory ? <FiEyeOff /> : <FiEye />}
            </button>
          </div>
          {showForm && <QuickActividadForm onSubmit={handleAdd} />}
          {showHistory && (
            <HistorialActividades
              projectId={projectId}
              taskId={task.id}
              activities={task.activities || []}
            />
          )}
        </>
      )}
    </div>
  )
}

export default TareaCard
