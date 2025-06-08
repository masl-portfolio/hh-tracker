import React, { useContext, useState } from 'react'
import AppContext from '../context/AppContext'

const WidgetView = ({ onGoMain, onOpenProjects }) => {
  const { projects, addTask } = useContext(AppContext)
  const defaultProject = projects.find(p => p.isDefault)
  const activeTasks = projects.flatMap(p =>
    p.tasks
      .filter(t => t.status === 'en desarrollo')
      .map(t => ({ ...t, projectName: p.name }))
  )

  const [title, setTitle] = useState('')
  const [hours, setHours] = useState('0')

  const handleAdd = () => {
    if (!title || !defaultProject) return
    addTask(defaultProject.id, title, hours)
    setTitle('')
    setHours('0')
  }

  return (
    <div className="p-4 max-w-sm mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-lg font-bold">Tareas en curso</h1>
        {onOpenProjects && (
          <button
            className="text-sm text-blue-600 underline"
            onClick={onOpenProjects}
          >
            Abrir proyectos
          </button>
        )}
      </div>
      {activeTasks.length ? (
        <ul className="space-y-2">
          {activeTasks.map(t => (
            <li key={t.id} className="bg-white border rounded p-2">
              <div className="font-semibold">{t.title}</div>
              <div className="text-sm text-gray-600">{t.projectName}</div>
            </li>
          ))}
        </ul>
      ) : defaultProject ? (
        <div className="space-y-2">
          <p className="text-sm text-gray-700">No hay tareas en curso</p>
          <input
            className="border rounded px-2 py-1 w-full"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Nueva tarea"
          />
          <input
            className="border rounded px-2 py-1 w-full"
            type="number"
            value={hours}
            onChange={e => setHours(e.target.value)}
            placeholder="Horas"
          />
          <button
            className="bg-blue-600 text-white px-3 py-1 rounded w-full"
            onClick={handleAdd}
          >
            Agregar tarea
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          <p className="text-sm text-gray-700">No hay proyecto predeterminado</p>
          {onGoMain && (
            <button
              className="bg-blue-600 text-white px-3 py-1 rounded w-full"
              onClick={onGoMain}
            >
              Ir a proyectos
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export default WidgetView
