import React, { useContext, useMemo, useState } from 'react';
import AppContext from '../context/AppContext';
import ProyectoCard from '../components/ProyectoCard';
import { FiArrowLeft, FiStar } from 'react-icons/fi';

const ProyectosView = () => {
  const { projects, addProject } = useContext(AppContext);
  const [projectName, setProjectName] = useState('');

  // Lógica para ordenar por fecha y separar el proyecto predeterminado
  const { defaultProject, otherProjects } = useMemo(() => {
    // Asegurar que cada proyecto tenga un 'createdAt' para evitar errores de ordenación.
    // Usamos el 'id' (que es un timestamp) como fallback si 'createdAt' no existe en datos antiguos.
    const projectsWithDate = projects.map(p => ({ ...p, createdAt: p.createdAt || p.id }));
    
    // Ordenar todos los proyectos por fecha de creación descendente (el más nuevo primero)
    const sortedProjects = [...projectsWithDate].sort((a, b) => b.createdAt - a.createdAt);
    
    // Separar la lista en dos
    const defaultProj = sortedProjects.find(p => p.isDefault);
    const otherProjs = sortedProjects.filter(p => !p.isDefault);
    
    return { defaultProject: defaultProj, otherProjects: otherProjs };
  }, [projects]);
  
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

        {/* Sección destacada para el proyecto predeterminado */}
        {defaultProject && (
            <div className='mb-8'>
                <h2 className='flex items-center gap-2 text-sm font-semibold text-yellow-400 mb-2 px-1'>
                    <FiStar/> Proyecto Predeterminado
                </h2>
                <ProyectoCard key={defaultProject.id} project={defaultProject} />
            </div>
        )}

        {/* Lista de otros proyectos */}
        {otherProjects.length > 0 && (
          <div className="w-full space-y-3">
            {/* Solo mostramos el título "Otros Proyectos" si hay un proyecto default, para no ser redundante */}
            {(defaultProject) && (
                 <h2 className='text-sm font-semibold text-zinc-400 mb-2 px-1'>
                    Otros Proyectos
                </h2>
            )}
            {otherProjects.map(p => (
              <ProyectoCard key={p.id} project={p} />
            ))}
          </div>
        )}

        {/* Mensaje cuando no hay ningún proyecto */}
        {projects.length === 0 && (
          <div className="text-center text-zinc-500 p-8 border-2 border-dashed border-zinc-700 rounded-xl">
            <p className="font-semibold">No hay proyectos.</p>
            <p className="text-sm">¡Agrega el primero para empezar a trabajar!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProyectosView;