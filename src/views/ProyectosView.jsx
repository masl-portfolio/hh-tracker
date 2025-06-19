import React, { useContext, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import AppContext from '../context/AppContext';
// ----- CAMBIO 1: Importar los nuevos iconos -----
import { 
  FiPlus, FiSearch, FiFilter, FiStar, FiChevronRight, FiX, 
  FiBriefcase, FiCheckCircle, FiEye, FiEyeOff 
} from 'react-icons/fi';

// Componente para las etiquetas de estado del proyecto
const StatusBadge = ({ status }) => {
  const styles = {
    borrador: 'bg-gray-500/20 text-gray-300',
    'en-curso': 'bg-blue-500/20 text-blue-400',
    finalizado: 'bg-green-500/20 text-green-400',
    archivado: 'bg-red-500/20 text-red-400',
  };
  return (
    <span className={`px-2.5 py-1 text-xs font-medium rounded-full capitalize ${styles[status] || styles.borrador}`}>
      {status.replace('-', ' ')}
    </span>
  );
};

const ProyectosView = () => {
  const { projects, addProject } = useContext(AppContext);
  const navigate = useNavigate();

  const [newProjectName, setNewProjectName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  // ----- CAMBIO 2: Reemplazar el estado del filtro -----
  const [showArchived, setShowArchived] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  const handleAddProject = (e) => {
    e.preventDefault();
    if (newProjectName.trim()) {
      addProject(newProjectName.trim());
      setNewProjectName('');
      setShowAddForm(false);
    }
  };

  const filteredAndSortedProjects = useMemo(() => {
    let tempProjects = [...projects];
    
    // ----- CAMBIO 3: Actualizar la lógica de filtrado -----
    if (!showArchived) {
      tempProjects = tempProjects.filter(p => p.status !== 'archivado');
    }

    if (searchQuery.trim() !== '') {
      const lowercasedQuery = searchQuery.toLowerCase();
      tempProjects = tempProjects.filter(p => (p.name || '').toLowerCase().includes(lowercasedQuery));
    }
    
    // Ordenar: por defecto primero, luego los archivados al final, y finalmente por fecha de creación
    return tempProjects.sort((a, b) => {
        if (a.isDefault !== b.isDefault) return b.isDefault - a.isDefault;
        if (a.status === 'archivado' && b.status !== 'archivado') return 1;
        if (a.status !== 'archivado' && b.status === 'archivado') return -1;
        return (b.createdAt || 0) - (a.createdAt || 0);
    });
  }, [projects, searchQuery, showArchived]);

  return (
    <div className="h-full w-full overflow-y-auto text-white p-4 sm:p-6 lg:p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-4xl font-bold tracking-tighter">Proyectos</h1>
            <p className="text-slate-400 mt-2">Gestiona todos tus espacios de trabajo y sus tareas.</p>
          </div>
          <button onClick={() => setShowAddForm(!showAddForm)} className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-colors ${showAddForm ? 'bg-zinc-700 hover:bg-zinc-600' : 'bg-blue-600 hover:bg-blue-700'}`}>
            {showAddForm ? <FiX /> : <FiPlus />}
            <span>{showAddForm ? 'Cancelar' : 'Nuevo Proyecto'}</span>
          </button>
        </div>

        {showAddForm && (
          <form onSubmit={handleAddProject} className="p-6 bg-slate-800/50 border border-slate-700 rounded-xl mb-8 animate-fade-in">
            <div className="flex gap-4">
              <input
                type="text"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                placeholder="Nombre del nuevo proyecto..."
                className="flex-grow bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
              <button type="submit" disabled={!newProjectName.trim()} className="flex items-center justify-center gap-2 bg-blue-600 px-5 py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-slate-600 transition-colors">
                <FiPlus /> Crear Proyecto
              </button>
            </div>
          </form>
        )}

        <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-xl mb-6">
          <div className="flex justify-between items-center gap-4">
            <div className="relative flex-grow">
              <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Buscar proyectos..." className="w-full bg-slate-800 border border-slate-600 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            {/* ----- CAMBIO 4: Reemplazar los botones por el nuevo conmutador ----- */}
            <button 
              onClick={() => setShowArchived(!showArchived)} 
              className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors flex-shrink-0"
            >
                {showArchived ? <FiEyeOff /> : <FiEye />}
                <span>{showArchived ? 'Ocultar archivados' : 'Mostrar archivados'}</span>
            </button>
          </div>
        </div>

        <div className="space-y-3">
          {filteredAndSortedProjects.length > 0 ? (
            filteredAndSortedProjects.map(project => (
              <button
                key={project.id}
                onClick={() => navigate(`/proyectos/${project.id}`)}
                className={`w-full text-left p-4 bg-slate-800/50 border rounded-xl hover:bg-slate-800 hover:border-blue-500 transition-all duration-200 group flex items-center justify-between
                  ${project.status === 'archivado' ? 'opacity-50' : ''}
                `}
              >
                <div className="flex items-center gap-4">
                  {project.isDefault && <FiStar className="text-yellow-400 flex-shrink-0" title="Proyecto por defecto" />}
                  {!project.isDefault && <FiBriefcase className="text-slate-500 flex-shrink-0" />}
                  <div>
                    <h2 className="font-bold text-white">{project.name}</h2>
                    <div className="flex items-center gap-4 text-xs text-slate-400 mt-1">
                      <StatusBadge status={project.status || 'borrador'} />
                      <span className="flex items-center gap-1.5"><FiCheckCircle size={12}/> {(project.tasks || []).filter(t => t.status === 'completada').length} / {(project.tasks || []).length} Tareas</span>
                    </div>
                  </div>
                </div>
                <FiChevronRight className="text-slate-600 group-hover:text-white transition-transform group-hover:translate-x-1" />
              </button>
            ))
          ) : (
            <div className="text-center py-16 text-slate-500 border-2 border-dashed border-slate-700 rounded-xl">
              <FiFilter size={48} className="mx-auto mb-4" />
              <h3 className="text-xl font-semibold">No se encontraron proyectos</h3>
              <p className="mt-1">Intenta ajustar los filtros o la búsqueda.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProyectosView;