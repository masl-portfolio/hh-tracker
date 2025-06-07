import React, { useContext, useState } from 'react'
import AppContext from '../context/AppContext'
import ProyectoCard from '../components/ProyectoCard'

const ProyectosView = () => {
  const { projects, addProject } = useContext(AppContext)
  const [projectName, setProjectName] = useState('')

  const handleAddProject = () => {
    if (!projectName) return
    addProject(projectName)
    setProjectName('')
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-6 flex">
        <div>
          <input
            className="border rounded px-2 py-1 mr-2"
            value={projectName}
            onChange={e => setProjectName(e.target.value)}
            placeholder="Nuevo proyecto"
          />
          <button
            className="bg-blue-600 text-white px-3 rounded"
            onClick={handleAddProject}
          >
            Agregar
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {projects.map(p => (
          <ProyectoCard key={p.id} project={p} />
        ))}
      </div>
    </div>
  )
}

export default ProyectosView
