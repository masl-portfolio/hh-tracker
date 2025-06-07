import React from 'react'
import ActividadItem from './ActividadItem'

const HistorialActividades = ({ activities, projectId, taskId }) => {
  return (
    <ul className="mt-2">
      {[...activities].reverse().map(act => (
        <ActividadItem
          key={act.id}
          projectId={projectId}
          taskId={taskId}
          activity={act}
        />
      ))}
    </ul>
  )
}

export default HistorialActividades
