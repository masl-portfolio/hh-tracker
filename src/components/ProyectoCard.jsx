import React, { useState, useContext, useMemo } from 'react';
import { 
  FiEdit, 
  FiTrash2, 
  FiStar, 
  FiChevronDown, 
  FiChevronRight, 
  FiSave, 
  FiX, 
  FiBarChart2,
  FiDownload,
  FiCheckCircle, 
  FiLoader, 
  FiArchive 
} from 'react-icons/fi';
import AppContext from '../context/AppContext';
import TareaCard from './TareaCard';
import GraficoEsfuerzo from './GraficoEsfuerzo';
import AddTaskForm from './AddTaskForm';
import { exportProjectToExcel } from '../services/exportService';

// --- COMPONENTE MEJORADO: ProgressBar con contadores e iconos ---
const ProgressBar = ({ backlog, inProgress, completed }) => {
  const total = backlog + inProgress + completed;

  const completedPercent = total > 0 ? (completed / total) * 100 : 0;
  const inProgressPercent = total > 0 ? (inProgress / total) * 100 : 0;
  const backlogPercent = total > 0 ? (backlog / total) * 100 : 0;

  return (
    <div className="mt-2 space-y-2">
      {/* Contadores numéricos */}
      <div className="flex justify-between items-center text-xs px-1 text-zinc-400">
        <div className="flex items-center gap-2">
          <div title={`${completed} tareas completadas`} className="flex items-center gap-1.5">
            <FiCheckCircle className="text-green-500" />
            <span>{completed}</span>
          </div>
          <div title={`${inProgress} tareas en progreso`} className="flex items-center gap-1.5">
            <FiLoader className="text-blue-500" />
            <span>{inProgress}</span>
          </div>
          <div title={`${backlog} tareas pendientes`} className="flex items-center gap-1.5">
            <FiArchive className="text-zinc-500" />
            <span>{backlog}</span>
          </div>
        </div>
        {total > 0 && <span className="font-semibold">{total} Tareas</span>}
      </div>

      {/* Barra visual */}
      <div className="w-full flex h-1.5 rounded-full overflow-hidden bg-zinc-700">
        {total > 0 ? (
          <>
            <div style={{ width: `${completedPercent}%` }} className="bg-green-500 transition-all duration-500"></div>
            <div style={{ width: `${inProgressPercent}%` }} className="bg-blue-500 transition-all duration-500"></div>
            <div style={{ width: `${backlogPercent}%` }} className="bg-zinc-500 transition-all duration-500"></div>
          </>
        ) : (
          <div className="w-full h-full bg-zinc-700 relative">
            <div className='absolute inset-0 flex items-center justify-center text-[10px] text-zinc-400 font-medium'>
              Sin tareas
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const ProyectoCard = ({ project }) => {
  const { 
    setDefaultProject, 
    editProject, 
    deleteProject 
  } = useContext(AppContext);

  const [showTasks, setShowTasks] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showChart, setShowChart] = useState(false);
  const [name, setName] = useState(project.name);
  const [contact, setContact] = useState(project.contact || '');
  const [email, setEmail] = useState(project.email || '');
  const [description, setDescription] = useState(project.description || '');

  const taskStats = useMemo(() => {
    const stats = { backlog: 0, inProgress: 0, completed: 0 };
    (project.tasks || []).forEach(task => {
      const status = task.status || 'backlog';
      if (status === 'completada') {
        stats.completed++;
      } else if (status === 'en desarrollo') {
        stats.inProgress++;
      } else if (status === 'backlog' || status === 'bloqueada') {
        stats.backlog++;
      }
    });
    return stats;
  }, [project.tasks]);

  const handleSaveEdit = () => {
    if (!name.trim()) {
      alert('El nombre del proyecto no puede estar vacío.');
      return;
    }
    editProject(project.id, { name: name.trim(), contact, email, description });
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setName(project.name);
    setContact(project.contact || '');
    setEmail(project.email || '');
    setDescription(project.description || '');
    setIsEditing(false);
  };
  
  const handleDeleteProject = () => {
    if (window.confirm(`¿Estás seguro de que quieres eliminar el proyecto "${project.name}" y todas sus tareas?`)) {
        deleteProject(project.id);
    }
  };

  const handleExport = () => {
    exportProjectToExcel(project);
  };

  return (
    <div className={`border rounded-2xl p-4 mb-3 shadow-lg transition-all duration-300 ${project.isDefault ? 'bg-blue-900/40 border-blue-500 shadow-blue-900/30' : 'bg-zinc-800 border-zinc-700 hover:border-zinc-600'}`}>
      {isEditing ? (
        <div className="space-y-2 text-white">
          <input className="w-full bg-zinc-700 border border-zinc-600 rounded-lg px-3 py-1.5 text-sm placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500" value={name} onChange={e => setName(e.target.value)} placeholder="Nombre del proyecto"/>
          <input className="w-full bg-zinc-700 border border-zinc-600 rounded-lg px-3 py-1.5 text-sm placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500" value={contact} onChange={e => setContact(e.target.value)} placeholder="Persona de contacto"/>
          <input className="w-full bg-zinc-700 border border-zinc-600 rounded-lg px-3 py-1.5 text-sm placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email de contacto"/>
          <textarea rows="3" className="w-full bg-zinc-700 border border-zinc-600 rounded-lg px-3 py-1.5 text-sm placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500" value={description} onChange={e => setDescription(e.target.value)} placeholder="Descripción del proyecto"/>
          <div className="flex gap-2 mt-2 text-sm">
            <button className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors" onClick={handleSaveEdit}>
              <FiSave size={16} />Guardar
            </button>
            <button className="flex items-center gap-2 px-3 py-1.5 bg-zinc-600 text-white rounded-lg hover:bg-zinc-700 transition-colors" onClick={handleCancelEdit}>
              <FiX size={16} />Cancelar
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="flex justify-between items-center">
            <div className="flex-1 min-w-0 cursor-pointer" onClick={() => setShowTasks(!showTasks)}>
                <div className="flex items-center gap-2 font-semibold text-lg text-white">
                    {showTasks ? <FiChevronDown /> : <FiChevronRight />}
                    <span className="truncate">{project.name}</span>
                    {project.isDefault && <span className="text-xs font-medium bg-blue-500/80 text-white px-2 py-0.5 rounded-full flex-shrink-0">Default</span>}
                </div>
            </div>
            <div className="flex items-center gap-1 text-lg pl-2">
              <button
                title="Exportar a Excel"
                className="p-2 rounded-full text-zinc-400 hover:text-green-400 hover:bg-zinc-700 transition-colors"
                onClick={handleExport}
              >
                <FiDownload />
              </button>
              <button
                title="Ver gráfico de esfuerzo"
                className={`p-2 rounded-full transition-colors ${showChart ? 'text-blue-400 bg-zinc-700' : 'text-zinc-400 hover:text-blue-400 hover:bg-zinc-700'}`}
                onClick={() => setShowChart(!showChart)}
              >
                <FiBarChart2 />
              </button>
              <button
                title={project.isDefault ? "Proyecto predeterminado" : "Marcar como predeterminado"}
                disabled={project.isDefault}
                className={`p-2 rounded-full transition-colors ${project.isDefault ? 'text-yellow-400 cursor-default' : 'text-zinc-400 hover:text-yellow-400 hover:bg-zinc-700'}`}
                onClick={() => setDefaultProject(project.id)}
              >
                <FiStar fill={project.isDefault ? 'currentColor' : 'none'} />
              </button>
              <button
                title="Editar proyecto"
                className="p-2 rounded-full text-zinc-400 hover:text-blue-400 hover:bg-zinc-700 transition-colors"
                onClick={() => setIsEditing(true)}
              >
                <FiEdit />
              </button>
              <button
                title="Eliminar proyecto"
                className="p-2 rounded-full text-zinc-400 hover:text-red-500 hover:bg-zinc-700 transition-colors"
                onClick={handleDeleteProject}
              >
                <FiTrash2 />
              </button>
            </div>
          </div>

          <ProgressBar {...taskStats} />

          {showChart && <GraficoEsfuerzo tasks={project.tasks} />}

          {showTasks && (
            <div className="mt-4 pt-4 border-t border-white/10 space-y-3 animate-fade-in">
              {(project.contact || project.email || project.description) && (
                <div className="text-sm text-zinc-300 space-y-2 p-3 bg-black/20 rounded-lg">
                  {project.contact && <div><strong>Contacto:</strong> {project.contact}</div>}
                  {project.email && <div><strong>Email:</strong> {project.email}</div>}
                  {project.description && <div className="mt-1 whitespace-pre-wrap"><strong>Desc:</strong> {project.description}</div>}
                </div>
              )}

              {project.tasks.length > 0 ? (
                project.tasks.map(task => <TareaCard key={task.id} projectId={project.id} task={task} />)
              ) : (
                <p className="text-center text-sm text-zinc-500 py-4">No hay tareas en este proyecto.</p>
              )}
              
              <AddTaskForm projectId={project.id} />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ProyectoCard;