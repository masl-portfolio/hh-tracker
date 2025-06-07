import React, { useState, useContext } from 'react'
import AppContext from '../context/AppContext'
import TareaCard from './TareaCard'

const ProyectoCard = ({ project }) => {
  const { addTask, setDefaultProject } = useContext(AppContext)
  const [showTasks, setShowTasks] = useState(false)
  const [taskTitle, setTaskTitle] = useState('')

  const handleAddTask = () => {
    if (!taskTitle) return
    addTask(project.id, taskTitle)
    setTaskTitle('')
  }

  return (
    <div className={`border p-2 mb-2 ${project.isDefault ? 'bg-yellow-100' : ''}`}>
      <div className="flex justify-between items-center">
        <h2 className="font-bold" onClick={() => setShowTasks(!showTasks)}>
          {project.name}
        </h2>
        <button onClick={() => setDefaultProject(project.id)} className="text-xl">
          {project.isDefault ? '★' : '☆'}
        </button>
      </div>
      {showTasks && (
        <div className="ml-4 mt-2">
          {project.tasks.map(task => (
            <TareaCard key={task.id} projectId={project.id} task={task} />
          ))}
          <div className="mt-2 flex">
            <input
              className="border px-1 mr-1"
              value={taskTitle}
              onChange={e => setTaskTitle(e.target.value)}
              placeholder="Nueva tarea"
            />
            <button className="bg-blue-500 text-white px-2" onClick={handleAddTask}>
              Agregar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProyectoCard
