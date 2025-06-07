import React, { useContext } from 'react'
import { FiEdit, FiTrash2 } from 'react-icons/fi'
import AppContext from '../context/AppContext'
const HistorialActividades = ({ projectId, taskId, activities }) => {
  const { editActivity, deleteActivity } = useContext(AppContext)
  return (
    <ul className="mt-2">
      {[...activities].reverse().map(act => (
        <li key={act.id} className="border-b py-1">
          <div className="flex justify-between">
            <div>
              <div className="text-sm font-semibold">{act.title}</div>
              <div className="text-xs text-gray-600">
                {new Date(act.date).toLocaleString()} - {act.hours.toFixed(2)}h - {act.status}
              </div>
              {act.observation && <div className="text-xs">{act.observation}</div>}
            </div>
            <div className="space-x-2 text-sm">
              <button
                aria-label="Editar actividad"
                className="text-blue-600"
                onClick={() => {
                  const title = prompt('Título', act.title)
                  if (title !== null) {
                    const hours = prompt('Horas', act.hours)
                    const observation = prompt('Observación', act.observation || '')
                    editActivity(projectId, taskId, act.id, {
                      title,
                      hours: parseFloat(hours) || act.hours,
                      observation,
                    })
                  }
                }}
              >
                <FiEdit />
              </button>
              <button
                aria-label="Eliminar actividad"
                className="text-red-600"
                onClick={() => {
                  if (confirm('Eliminar actividad?'))
                    deleteActivity(projectId, taskId, act.id)
                }}
              >
                <FiTrash2 />
              </button>
            </div>
          </div>
        </li>
      ))}
    </ul>
  )
}

export default HistorialActividades
