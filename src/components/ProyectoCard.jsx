// src/components/ProyectoCard.jsx (COMPLETO Y FINAL)

import React, { useState, useContext, useMemo, useEffect, useRef } from 'react';
import { 
  FiEdit, FiTrash2, FiStar, FiChevronDown, FiChevronRight, 
  FiSave, FiX, FiBarChart2, FiDownload, FiSearch, 
  FiArchive, FiInbox // Íconos para archivar/desarchivar
} from 'react-icons/fi';
import AppContext from '../context/AppContext';
import TareaCard from './TareaCard';
import GraficoEsfuerzo from './GraficoEsfuerzo';
import AddTaskForm from './AddTaskForm';
import ModalConfirmacion from './ModalConfirmacion';
import { exportProjectToExcel } from '../services/exportService';
import toast from 'react-hot-toast';

// Importaciones para Drag and Drop
import { DragDropContext, Droppable } from 'react-beautiful-dnd';

// --- COMPONENTES INTERNOS ---

const ProgressBar = ({ backlog, inProgress, completed }) => {
  const total = backlog + inProgress + completed;
  if (total === 0) {
    return (
      <div className='w-full h-2 rounded-full bg-zinc-700 mt-2 relative'>
        <div className='absolute inset-0 flex items-center justify-center text-[10px] text-zinc-400'>
          Sin tareas
        </div>
      </div>
    );
  }
  const completedPercent = (completed / total) * 100;
  const inProgressPercent = (inProgress / total) * 100;
  const backlogPercent = (backlog / total) * 100;
  return (
    <div className="w-full flex h-2 rounded-full overflow-hidden bg-zinc-700 mt-2" title={`${completed} completadas, ${inProgress} en progreso, ${backlog} pendientes.`}>
      <div style={{ width: `${completedPercent}%` }} className="bg-green-500 transition-all duration-500"></div>
      <div style={{ width: `${inProgressPercent}%` }} className="bg-blue-500 transition-all duration-500"></div>
      <div style={{ width: `${backlogPercent}%` }} className="bg-zinc-500 transition-all duration-500"></div>
    </div>
  );
};

// Estilos para las etiquetas de estado del proyecto
const projectStatusStyles = {
    borrador: 'bg-slate-700 text-slate-300',
    'en-curso': 'bg-blue-600 text-white',
    finalizado: 'bg-green-600 text-white',
    archivado: 'bg-zinc-800 text-zinc-400 border border-zinc-600',
};


// --- COMPONENTE PRINCIPAL ---

const ProyectoCard = ({ project, isFeatured = false }) => {
  const { setDefaultProject, editProject, deleteProject, reorderTasks, setProjectStatus } = useContext(AppContext);

  // Estados del componente
  const [showTasks, setShowTasks] = useState(isFeatured);
  const [isEditingProject, setIsEditingProject] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [showChart, setShowChart] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hideCompleted, setHideCompleted] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Estados para los formularios de edición
  const [editName, setEditName] = useState(project.name);
  const [editContact, setEditContact] = useState(project.contact || '');
  const [editEmail, setEditEmail] = useState(project.email || '');
  const [editDescription, setDescription] = useState(project.description || '');
  const titleInputRef = useRef(null);

  useEffect(() => {
    if (isEditingTitle) {
      titleInputRef.current?.focus();
      titleInputRef.current?.select();
    }
  }, [isEditingTitle]);

  // Sincronizar el estado de edición con los props por si cambian externamente
  useEffect(() => {
    setEditName(project.name);
    setEditContact(project.contact || '');
    setEditEmail(project.email || '');
    setDescription(project.description || '');
  }, [project]);

  const taskStats = useMemo(() => {
    const stats = { backlog: 0, inProgress: 0, completed: 0 };
    (project.tasks || []).forEach(task => {
      const status = task.status || 'backlog';
      if (status === 'completada') stats.completed++;
      else if (status === 'en desarrollo') stats.inProgress++;
      else if (['backlog', 'bloqueada'].includes(status)) stats.backlog++;
    });
    return stats;
  }, [project.tasks]);

  const filteredTasks = useMemo(() => {
    return (project.tasks || []).filter(t => {
        const matchesSearch = (t.title || '').toLowerCase().includes(searchQuery.toLowerCase());
        const isVisible = !hideCompleted || !['completada', 'cancelada'].includes(t.status);
        return matchesSearch && isVisible;
      });
  }, [project.tasks, hideCompleted, searchQuery]);

  const handleSaveProjectDetails = () => {
    if (!editName.trim()) {
      toast.error('El nombre del proyecto no puede estar vacío.');
      return;
    }
    editProject(project.id, { name: editName.trim(), contact: editContact, email: editEmail, description: editDescription });
    setIsEditingProject(false);
  };

  const handleCancelEditProject = () => {
    setEditName(project.name);
    setEditContact(project.contact || '');
    setEditEmail(project.email || '');
    setDescription(project.description || '');
    setIsEditingProject(false);
  };

  const handleTitleBlur = () => {
    if (editName.trim() && editName.trim() !== project.name) {
      editProject(project.id, { name: editName.trim() });
    } else {
      setEditName(project.name);
    }
    setIsEditingTitle(false);
  };

  const handleTitleKeyDown = (e) => {
    if (e.key === 'Enter') handleTitleBlur();
    else if (e.key === 'Escape') {
      setEditName(project.name);
      setIsEditingTitle(false);
    }
  };

  const onDragEnd = (result) => {
    const { source, destination } = result;
    if (!destination || (destination.droppableId === source.droppableId && destination.index === source.index)) return;
    
    // Para simplificar, deshabilitamos el reordenamiento si hay filtros activos
    if (searchQuery || hideCompleted) {
        toast.error("Limpia los filtros para reordenar las tareas.");
        return;
    }

    reorderTasks(project.id, source.index, destination.index);
  };

  const handleExport = () => { exportProjectToExcel(project); };
  const handleDeleteProject = () => { setIsModalOpen(true); };
  const confirmDelete = () => { deleteProject(project.id); setIsModalOpen(false); };
  const cancelDelete = () => { setIsModalOpen(false); };

  if (!project) return null;

  return (
    <>
      <div className={`border rounded-2xl p-4 mb-3 shadow-lg transition-all duration-300 ${project.isDefault ? 'bg-blue-900/40 border-blue-500' : 'bg-zinc-800 border-zinc-700'} ${project.status === 'archivado' ? 'opacity-50 hover:opacity-100' : ''}`}>
        {isEditingProject ? (
          <div className="space-y-2 text-white">
            <input className="w-full bg-zinc-700 border border-zinc-600 rounded-lg px-3 py-1.5 text-sm" value={editName} onChange={e => setEditName(e.target.value)} placeholder="Nombre del proyecto"/>
            <input className="w-full bg-zinc-700 border border-zinc-600 rounded-lg px-3 py-1.5 text-sm" value={editContact} onChange={e => setEditContact(e.target.value)} placeholder="Persona de contacto"/>
            <input className="w-full bg-zinc-700 border border-zinc-600 rounded-lg px-3 py-1.5 text-sm" value={editEmail} onChange={e => setEditEmail(e.target.value)} placeholder="Email de contacto"/>
            <textarea rows="3" className="w-full bg-zinc-700 border border-zinc-600 rounded-lg px-3 py-1.5 text-sm" value={editDescription} onChange={e => setDescription(e.target.value)} placeholder="Descripción del proyecto"/>
            <div className="flex gap-2 mt-2 text-sm">
              <button className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700" onClick={handleSaveProjectDetails}><FiSave size={16}/>Guardar</button>
              <button className="flex items-center gap-2 px-3 py-1.5 bg-zinc-600 text-white rounded-lg hover:bg-zinc-700" onClick={handleCancelEditProject}><FiX size={16}/>Cancelar</button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 font-semibold text-lg text-white">
                  <button onClick={() => setShowTasks(!showTasks)} className="p-1 -ml-1">
                    {showTasks ? <FiChevronDown /> : <FiChevronRight />}
                  </button>
                  {isEditingTitle ? (
                    <input ref={titleInputRef} type="text" value={editName} onChange={(e) => setEditName(e.target.value)} onBlur={handleTitleBlur} onKeyDown={handleTitleKeyDown} className="w-full bg-transparent focus:outline-none -ml-1 -my-1 p-1 rounded-md focus:bg-zinc-700" />
                  ) : (
                    <span className="truncate cursor-pointer" onDoubleClick={() => setIsEditingTitle(true)}>{project.name}</span>
                  )}
                  {project.status && (
                    <span className={`text-xs font-bold uppercase px-2 py-0.5 rounded-full ${projectStatusStyles[project.status] || 'bg-zinc-500'}`}>
                      {project.status.replace('-', ' ')}
                    </span>
                  )}
                </div>
                <div className="pl-8">
                    <ProgressBar {...taskStats} />
                    {isFeatured && (
                        <div className="flex items-center gap-1.5 text-xs text-yellow-400 mt-2 animate-fade-in-fast">
                            <FiStar size={12} className="opacity-80"/>
                            <span>Activo en el widget</span>
                        </div>
                    )}
                </div>
              </div>
              <div className="flex items-center gap-1 text-lg pl-2">
                {project.status === 'archivado' ? (
                  <button title="Desarchivar proyecto" className="p-2 rounded-full text-zinc-400 hover:text-yellow-400" onClick={() => setProjectStatus(project.id, 'borrador')}><FiInbox /></button>
                ) : (
                  <button title="Archivar proyecto" className="p-2 rounded-full text-zinc-400 hover:text-yellow-400" onClick={() => setProjectStatus(project.id, 'archivado')}><FiArchive /></button>
                )}
                <button title="Exportar a Excel" className="p-2 rounded-full text-zinc-400 hover:text-green-400" onClick={handleExport}><FiDownload /></button>
                <button title="Ver gráfico de esfuerzo" className={`p-2 rounded-full transition-colors ${showChart ? 'text-blue-400 bg-zinc-700' : 'text-zinc-400 hover:text-blue-400'}`} onClick={() => setShowChart(!showChart)}><FiBarChart2 /></button>
                <button title={project.isDefault ? "Predeterminado" : "Marcar como predeterminado"} disabled={project.isDefault} className={`p-2 rounded-full transition-colors ${project.isDefault ? 'text-yellow-400 cursor-default' : 'text-zinc-400 hover:text-yellow-400'}`} onClick={() => setDefaultProject(project.id)}><FiStar fill={project.isDefault ? 'currentColor' : 'none'} /></button>
                <button title="Editar detalles del proyecto" className="p-2 rounded-full text-zinc-400 hover:text-blue-400" onClick={() => setIsEditingProject(true)}><FiEdit /></button>
                <button title="Eliminar proyecto" className="p-2 rounded-full text-zinc-400 hover:text-red-500" onClick={handleDeleteProject}><FiTrash2 /></button>
              </div>
            </div>

            {showChart && <GraficoEsfuerzo tasks={project.tasks || []} />}

            {showTasks && (
              <div className="mt-4 pt-4 border-t border-white/10 space-y-3 animate-fade-in">
                {(project.contact || project.email || project.description) && !isEditingProject && (
                  <div className="text-sm text-zinc-300 space-y-2 p-3 bg-black/20 rounded-lg">
                    {project.contact && <div><strong>Contacto:</strong> {project.contact}</div>}
                    {project.email && <div><strong>Email:</strong> {project.email}</div>}
                    {project.description && <div className="mt-1 whitespace-pre-wrap"><strong>Desc:</strong> {project.description}</div>}
                  </div>
                )}
                {(project.tasks && project.tasks.length > 0) && (
                  <div className="flex justify-between items-center flex-wrap gap-4 p-3 bg-black/20 rounded-lg">
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <div className="w-5 h-5 border-2 border-zinc-500 rounded-md flex items-center justify-center transition-all duration-200 group-hover:border-blue-500">
                        <div className={`w-3 h-3 rounded-sm transition-transform duration-200 transform ${hideCompleted ? 'scale-100 bg-blue-500' : 'scale-0 bg-transparent'}`}></div>
                      </div>
                      <input type="checkbox" checked={hideCompleted} onChange={() => setHideCompleted(prev => !prev)} className="absolute opacity-0 w-0 h-0" />
                      <span className="text-xs text-zinc-300 group-hover:text-white transition-colors">Ocultar completadas y canceladas</span>
                    </label>
                    <div className="relative w-full sm:w-64">
                      <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                      <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Buscar tarea..." className="bg-zinc-800 text-sm text-white pl-9 pr-3 py-1.5 rounded-md border border-zinc-600 w-full focus:ring-2 focus:ring-blue-500 focus:outline-none"/>
                    </div>
                  </div>
                )}
                
                <DragDropContext onDragEnd={onDragEnd}>
                  <Droppable droppableId={`tasks-${project.id}`}>
                    {(provided) => (
                      <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                        {filteredTasks.length > 0 ? (
                          filteredTasks.map((task, index) => (
                            <TareaCard key={task.id} projectId={project.id} task={task} index={index} />
                          ))
                        ) : ( (project.tasks && project.tasks.length > 0) && <p className="text-center text-sm text-zinc-500 py-4">No hay tareas que coincidan con la búsqueda.</p> )}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>
                
                <AddTaskForm projectId={project.id} />
              </div>
            )}
          </>
        )}
      </div>

      <ModalConfirmacion isOpen={isModalOpen} titulo="Eliminar Proyecto" mensaje={`¿Estás seguro de que quieres eliminar el proyecto "${project.name}"? Todas sus tareas y registros se perderán permanentemente.`} onConfirm={confirmDelete} onCancel={cancelDelete} textoConfirmar="Sí, eliminar"/>
    </>
  );
};

export default ProyectoCard;