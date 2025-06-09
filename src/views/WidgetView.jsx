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
    <div className="p-4 max-w-xs mx-auto bg-gradient-to-br from-white to-gray-100 rounded-xl shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-lg font-semibold text-gray-800">Tareas en curso</h1>
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
            <li key={t.id} className="bg-white border rounded-lg p-2 shadow">
              <div className="font-semibold">{t.title}</div>
              <div className="text-sm text-gray-600">{t.projectName}</div>
            </li>
          ))}
        </ul>
      ) : defaultProject ? (
        <div className="space-y-2">
          <p className="text-sm text-gray-700">Proyecto actual: <span className="font-medium">{defaultProject.name}</span></p>
          <input
            className="border rounded-md px-3 py-2 w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Nueva tarea"
          />
          <input
            className="border rounded-md px-3 py-2 w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            type="number"
            value={hours}
            onChange={e => setHours(e.target.value)}
            placeholder="Horas"
          />
          <button
            className="bg-blue-600 text-white px-3 py-2 rounded-md w-full hover:bg-blue-700"
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
              className="bg-blue-600 text-white px-3 py-2 rounded-md w-full hover:bg-blue-700"
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
