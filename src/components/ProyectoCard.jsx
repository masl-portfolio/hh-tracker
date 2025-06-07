import React, { useState, useContext } from 'react'
import {
  FiEdit,
  FiTrash2,
  FiPlus,
  FiStar,
  FiChevronDown,
  FiChevronRight,
  FiSave,
  FiX,
} from 'react-icons/fi'
import AppContext from '../context/AppContext'
import TareaCard from './TareaCard'

const ProyectoCard = ({ project }) => {
  const {
    addTask,
    setDefaultProject,
    editProject,
    deleteProject,
  } = useContext(AppContext)
  const [showTasks, setShowTasks] = useState(false)
  const [taskTitle, setTaskTitle] = useState('')
  const [taskHours, setTaskHours] = useState('0')
  const [isEditing, setIsEditing] = useState(false)
  const [name, setName] = useState(project.name)
  const [contact, setContact] = useState(project.contact || '')
  const [email, setEmail] = useState(project.email || '')
  const [description, setDescription] = useState(project.description || '')

  const handleAddTask = () => {
    if (!taskTitle) return
    addTask(project.id, taskTitle, taskHours)
    setTaskTitle('')
    setTaskHours('0')
  }

  const handleSave = () => {
    if (!name) return
    editProject(project.id, { name, contact, email, description })
    setIsEditing(false)
  }

  return (
    <div className="bg-white rounded-lg border border-gray-300 p-4 mb-4 shadow-sm">
      {isEditing ? (
        <div className="space-y-2">
          <input
            className="border rounded px-2 py-1 w-full"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Nombre del proyecto"
          />
          <input
            className="border rounded px-2 py-1 w-full"
            value={contact}
            onChange={e => setContact(e.target.value)}
            placeholder="Persona contacto"
          />
          <input
            className="border rounded px-2 py-1 w-full"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Email"
          />
          <textarea
            className="border rounded px-2 py-1 w-full"
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Descripción"
          />
          <div className="space-x-2">
            <button
              aria-label="Guardar proyecto"
              className="bg-blue-600 text-white px-3 rounded"
              onClick={handleSave}
            >
              <FiSave />
            </button>
            <button
              aria-label="Cancelar"
              className="bg-gray-300 px-3 rounded"
              onClick={() => setIsEditing(false)}
            >
              <FiX />
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="flex justify-between items-center">
            <h2
              className="font-semibold text-lg cursor-pointer text-gray-800 flex items-center"
              onClick={() => setShowTasks(!showTasks)}
            >
              {showTasks ? (
                <FiChevronDown className="inline mr-1" />
              ) : (
                <FiChevronRight className="inline mr-1" />
              )}
              {project.name}
            </h2>
            <div className="space-x-2 text-sm">
              <button
                aria-label="Proyecto predeterminado"
                className={
                  project.isDefault ? 'text-yellow-500 font-bold' : 'text-gray-400'
                }
                onClick={() => setDefaultProject(project.id)}
              >
                <FiStar />
              </button>
              <button
                aria-label="Editar proyecto"
                className="text-blue-600"
                onClick={() => setIsEditing(true)}
              >
                <FiEdit />
              </button>
              <button
                aria-label="Eliminar proyecto"
                className="text-red-600"
                onClick={() => {
                  if (confirm('Eliminar proyecto?')) deleteProject(project.id)
                }}
              >
                <FiTrash2 />
              </button>
            </div>
          </div>
          {showTasks && (
            <div className="mt-3 space-y-2">
              {(project.contact || project.email || project.description) && (
                <div className="text-sm text-gray-700 mb-2">
                  {project.contact && <div>Contacto: {project.contact}</div>}
                  {project.email && <div>Email: {project.email}</div>}
                  {project.description && <div>{project.description}</div>}
                </div>
              )}
              {project.tasks.map(task => (
                <TareaCard key={task.id} projectId={project.id} task={task} />
              ))}
              <div className="flex mt-2">
                <input
                  className="border rounded px-2 py-1 mr-2 flex-1"
                  value={taskTitle}
                  onChange={e => setTaskTitle(e.target.value)}
                  placeholder="Nueva tarea"
                />
                <input
                  className="border rounded px-2 py-1 mr-2 w-20"
                  type="number"
                  value={taskHours}
                  onChange={e => setTaskHours(e.target.value)}
                  placeholder="HH"
                />
                <button
                  aria-label="Agregar tarea"
                  className="bg-blue-600 text-white px-3 rounded"
                  onClick={handleAddTask}
                >
                  <FiPlus />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default ProyectoCard
