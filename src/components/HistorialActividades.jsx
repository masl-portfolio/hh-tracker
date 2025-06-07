import React, { useContext, useState } from 'react'
import { FiEdit, FiTrash2, FiSave, FiX } from 'react-icons/fi'
import AppContext from '../context/AppContext'
const HistorialActividades = ({ projectId, taskId, activities }) => {
  const { editActivity, deleteActivity } = useContext(AppContext)
  const [editingId, setEditingId] = useState(null)
  const [title, setTitle] = useState('')
  const [hours, setHours] = useState('0')
  const [observation, setObservation] = useState('')
  return (
    <ul className="mt-2">
      {[...activities].reverse().map(act => (
        <li key={act.id} className="border-b py-1">
          {editingId === act.id ? (
            <div className="space-y-1">
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
                placeholder="Horas"
              />
              <input
                className="border rounded px-2 py-1 w-full"
                value={observation}
                onChange={e => setObservation(e.target.value)}
                placeholder="Observación"
              />
              <div className="space-x-2 text-sm">
                <button
                  aria-label="Guardar actividad"
                  className="bg-blue-600 text-white px-2 rounded"
                  onClick={() => {
                    editActivity(projectId, taskId, act.id, {
                      title,
                      hours: parseFloat(hours) || 0,
                      observation,
                    })
                    setEditingId(null)
                  }}
                >
                  <FiSave />
                </button>
                <button
                  aria-label="Cancelar"
                  className="bg-gray-300 px-2 rounded"
                  onClick={() => setEditingId(null)}
                >
                  <FiX />
                </button>
              </div>
            </div>
          ) : (
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
                    setEditingId(act.id)
                    setTitle(act.title)
                    setHours(String(act.hours))
                    setObservation(act.observation || '')
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
          )}
        </li>
      ))}
    </ul>
  )
}

export default HistorialActividades
