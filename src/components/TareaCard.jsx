import React, { useContext } from 'react'
import AppContext from '../context/AppContext'

const TareaCard = ({ projectId, task }) => {
  const { setTaskStatus } = useContext(AppContext)

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-3 mb-2">
      <div className="flex justify-between items-center">
        <h3 className="font-medium text-gray-800">{task.title}</h3>
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
    </div>
  )
}

export default TareaCard
