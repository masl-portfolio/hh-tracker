import React, { useContext, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AppContext from '../context/AppContext';
import ProyectoCard from '../components/ProyectoCard';
import { FiArrowLeft, FiAlertTriangle } from 'react-icons/fi';

const ProyectoDetalleView = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { projects } = useContext(AppContext);

  // Encontramos el proyecto específico basándonos en el ID de la URL
  const project = useMemo(() => 
    projects.find(p => String(p.id) === projectId), 
    [projects, projectId]
  );

  // Manejo de caso donde el proyecto no se encuentra
  if (!project) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center text-center p-8">
        <FiAlertTriangle className="text-red-500 mb-4" size={48} />
        <h1 className="text-2xl font-bold text-white">Proyecto no encontrado</h1>
        <p className="text-slate-400 mt-2">El proyecto que buscas no existe o ha sido eliminado.</p>
        <button 
          onClick={() => navigate('/proyectos')} 
          className="mt-6 flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold"
        >
          <FiArrowLeft />
          Volver a la lista de proyectos
        </button>
      </div>
    );
  }

  return (
    <div className="h-full w-full overflow-y-auto p-4 sm:p-6 lg:p-8 font-sans">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <button 
            onClick={() => navigate('/proyectos')} 
            className="flex items-center gap-2 text-blue-400 hover:text-blue-500 transition-colors text-sm"
          >
            <FiArrowLeft />
            Volver a todos los proyectos
          </button>
        </div>
        
        {/* Aquí reutilizamos tu ProyectoCard, que contiene toda la lógica detallada */}
        <ProyectoCard project={project} isFeatured={true} />
      </div>
    </div>
  );
};

export default ProyectoDetalleView;