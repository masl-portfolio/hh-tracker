import React, { useState, useContext } from 'react'
import AppContext from '../context/AppContext'

const ActividadItem = ({ projectId, taskId, activity }) => {
  const { updateActivity, deleteActivity } = useContext(AppContext)
  const [editing, setEditing] = useState(false)
  const [title, setTitle] = useState(activity.title)
  const [hours, setHours] = useState(String(activity.hours))
  const [status, setStatus] = useState(activity.status)
  const [observation, setObservation] = useState(activity.observation || '')

  const handleSave = () => {
    updateActivity(projectId, taskId, activity.id, {
      title,
      hours: parseFloat(hours) || 0,
      status,
      observation,
    })
    setEditing(false)
  }

  return (
    <li className="border-b py-1">
      {editing ? (
        <div className="space-y-1">
          <input
            className="border rounded px-1 w-full"
            value={title}
            onChange={e => setTitle(e.target.value)}
          />
          <input
            className="border rounded px-1 w-full"
            type="number"
            value={hours}
            onChange={e => setHours(e.target.value)}
          />
          <input
            className="border rounded px-1 w-full"
            value={observation}
            onChange={e => setObservation(e.target.value)}
            placeholder="Observación"
          />
          <select
            className="border rounded px-1 w-full"
            value={status}
            onChange={e => setStatus(e.target.value)}
          >
            <option value="en progreso">En progreso</option>
            <option value="bloqueada">Bloqueada</option>
            <option value="finalizada">Finalizada</option>
          </select>
          <div className="space-x-2 text-sm">
            <button className="text-green-600" onClick={handleSave}>
              Guardar
            </button>
            <button
              className="text-sm"
              onClick={() => {
                setEditing(false)
                setTitle(activity.title)
                setHours(String(activity.hours))
                setStatus(activity.status)
                setObservation(activity.observation || '')
              }}
            >
              Cancelar
            </button>
            <button
              className="text-red-600"
              onClick={() => deleteActivity(projectId, taskId, activity.id)}
            >
              Eliminar
            </button>
          </div>
        </div>
      ) : (
        <div>
          <div className="text-sm font-semibold flex justify-between">
            <span>{activity.title}</span>
            <span className="text-xs">{activity.hours.toFixed(2)}h</span>
          </div>
          <div className="text-xs text-gray-600">
            {new Date(activity.date).toLocaleString()} - {activity.status}
          </div>
          {activity.observation && (
            <div className="text-xs">{activity.observation}</div>
          )}
          <div className="space-x-2 text-sm mt-1">
            <button className="text-blue-600" onClick={() => setEditing(true)}>
              Editar
            </button>
            <button
              className="text-red-600"
              onClick={() => deleteActivity(projectId, taskId, activity.id)}
            >
              Eliminar
            </button>
          </div>
        </div>
      )}
    </li>
  )
}

export default ActividadItem
