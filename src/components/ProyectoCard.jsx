import React, { useState, useContext } from 'react'
import AppContext from '../context/AppContext'
import TareaCard from './TareaCard'

const ProyectoCard = ({ project }) => {
  const { addTask, setDefaultProject } = useContext(AppContext)
  const [showTasks, setShowTasks] = useState(false)
  const [taskTitle, setTaskTitle] = useState('')
  const [taskHours, setTaskHours] = useState('0')

  const handleAddTask = () => {
    if (!taskTitle) return
    addTask(project.id, taskTitle, taskHours)
    setTaskTitle('')
    setTaskHours('0')
  }

  return (
    <div className="bg-white rounded-lg border border-gray-300 p-4 mb-4 shadow-sm">
      <div className="flex justify-between items-center">
        <h2
          className="font-semibold text-lg cursor-pointer text-gray-800"
          onClick={() => setShowTasks(!showTasks)}
        >
          {project.name}
        </h2>
        <button
          className={
            project.isDefault ? 'text-yellow-500 font-bold' : 'text-gray-400'
          }
          onClick={() => setDefaultProject(project.id)}
        >
          ★
        </button>
      </div>
      {showTasks && (
        <div className="mt-3 space-y-2">
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
              className="bg-blue-600 text-white px-3 rounded"
              onClick={handleAddTask}
            >
              Agregar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProyectoCard
