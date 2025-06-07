import React, { useContext, useState } from 'react'
import AppContext from '../context/AppContext'
import ProyectoCard from '../components/ProyectoCard'
import DashboardPagos from '../components/DashboardPagos'

const ProyectosView = () => {
  const { projects, addProject } = useContext(AppContext)
  const [projectName, setProjectName] = useState('')
  const [showActivities, setShowActivities] = useState(false)

  const allActivities = projects.flatMap(p => p.tasks.flatMap(t => t.activities))

  const handleAddProject = () => {
    if (!projectName) return
    addProject(projectName)
    setProjectName('')
  }

  return (
    <div className="p-4">
      <div className="mb-4 flex justify-between">
        <div>
          <input
            className="border px-1 mr-1"
            value={projectName}
            onChange={e => setProjectName(e.target.value)}
            placeholder="Nuevo proyecto"
          />
          <button className="bg-blue-500 text-white px-2" onClick={handleAddProject}>
            Agregar
          </button>
        </div>
        <button className="underline" onClick={() => setShowActivities(!showActivities)}>
          {showActivities ? 'Ver proyectos' : 'Ver actividades'}
        </button>
      </div>

      {showActivities ? (
        <DashboardPagos activities={allActivities} />
      ) : (
        projects.map(p => <ProyectoCard key={p.id} project={p} />)
      )}
    </div>
  )
}

export default ProyectosView
