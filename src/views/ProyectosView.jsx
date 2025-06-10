import React, { useContext, useState } from 'react';
import AppContext from '../context/AppContext';
import ProyectoCard from '../components/ProyectoCard';
import { FiArrowLeft } from 'react-icons/fi';

const ProyectosView = () => {
  const { projects, addProject } = useContext(AppContext);
  const [projectName, setProjectName] = useState('');

  const handleAddProject = () => {
    if (!projectName.trim()) return;
    addProject(projectName.trim());
    setProjectName('');
  };
  
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleAddProject();
    }
  };

  return (
    // CAMBIO APLICADO: Se reemplaza 'bg-zinc-900' por 'animated-gradient-background'
    <div className="min-h-screen animated-gradient-background text-white p-6 flex flex-col items-center font-sans">
      
      <div className="w-full max-w-2xl">
        <div className="w-full mb-4">
          <button
            onClick={() => window.close()}
            className="flex items-center gap-2 text-blue-400 hover:text-blue-500 transition-colors text-sm"
          >
            <FiArrowLeft />
            Volver a vista widget
          </button>
        </div>

        <div className="w-full text-left mb-6">
          <h1 className="text-3xl font-bold text-white">
            Administrar Proyectos
          </h1>
          <p className="text-zinc-400 mt-1">
            Agrega nuevos proyectos y elige cuál usar por defecto en el widget.
          </p>
        </div>

        <div className="w-full mb-8 flex flex-col sm:flex-row items-center gap-2 p-4 bg-black/20 rounded-xl border border-white/10">
          <input
            className="flex-1 w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-sm placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={projectName}
            onChange={e => setProjectName(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Nombre del nuevo proyecto"
          />
          <button
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium transition-colors w-full sm:w-auto disabled:opacity-50"
            onClick={handleAddProject}
            disabled={!projectName.trim()}
          >
            Agregar
          </button>
        </div>

        <div className="w-full space-y-3">
          {projects.length > 0 ? (
            projects.map(p => (
              <ProyectoCard key={p.id} project={p} />
            ))
          ) : (
            <div className="text-center text-zinc-500 p-8 border-2 border-dashed border-zinc-700 rounded-xl">
              <p className="font-semibold">No hay proyectos.</p>
              <p className="text-sm">¡Agrega el primero para empezar a trabajar!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProyectosView;