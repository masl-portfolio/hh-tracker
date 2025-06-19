import React, { useState, useContext, useMemo, useRef } from 'react';
import AppContext from '../context/AppContext';
import AddTaskForm from './AddTaskForm';
import TareaCard from './TareaCard';
// ----- CAMBIO 1: Importar los componentes necesarios de react-beautiful-dnd -----
import { DragDropContext, Droppable } from 'react-beautiful-dnd';
import { 
  FiChevronDown, FiChevronUp, FiPlus, FiCheckCircle, FiArchive, FiStar, 
  FiEdit, FiTrash2, FiSearch, FiFilter, FiEyeOff, FiEye 
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

const ProyectoCard = ({ project, isFeatured = false }) => {
  const { 
    setDefaultProject, setProjectStatus, deleteProject, editProject,
    reorderTasks
  } = useContext(AppContext);
  
  const [isExpanded, setIsExpanded] = useState(isFeatured);
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(project.name);
  const [showAddTaskForm, setShowAddTaskForm] = useState(false);
  const [taskSearchQuery, setTaskSearchQuery] = useState('');
  const [hideCompleted, setHideCompleted] = useState(true);
  
  const cardRef = useRef(null);

  // ----- CAMBIO 2: Crear la función onDragEnd para manejar el reordenamiento -----
  const onDragEnd = (result) => {
    const { destination, source, draggableId } = result;

    // Si no hay destino, o si se soltó en el mismo lugar, no hacer nada
    if (!destination || (destination.droppableId === source.droppableId && destination.index === source.index)) {
      return;
    }
    
    // Llamar a la función del contexto para reordenar las tareas
    reorderTasks(project.id, source.index, destination.index);
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    setEditedName(project.name);
  };

  const handleNameChange = (e) => {
    setEditedName(e.target.value);
  };

  const handleSaveName = () => {
    if (editedName.trim() && editedName.trim() !== project.name) {
      editProject(project.id, { name: editedName.trim() });
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSaveName();
    if (e.key === 'Escape') handleEditToggle();
  };

  const handleDeleteProject = () => {
    if (window.confirm(`¿Estás seguro de que quieres eliminar el proyecto "${project.name}"? Esta acción no se puede deshacer.`)) {
      deleteProject(project.id);
    }
  };

  const filteredTasks = useMemo(() => {
    let tasks = project.tasks || [];
    if (hideCompleted) {
      tasks = tasks.filter(t => t.status !== 'completada' && t.status !== 'cancelada');
    }
    if (taskSearchQuery.trim()) {
      const lowercasedQuery = taskSearchQuery.toLowerCase();
      tasks = tasks.filter(t => t.title.toLowerCase().includes(lowercasedQuery));
    }
    return tasks;
  }, [project.tasks, hideCompleted, taskSearchQuery]);

  const statusConfig = {
    borrador: { text: 'Borrador', color: 'bg-gray-500' },
    'en-curso': { text: 'En Curso', color: 'bg-blue-500' },
    finalizado: { text: 'Finalizado', color: 'bg-green-500' },
    archivado: { text: 'Archivado', color: 'bg-red-500' },
  };

  return (
    <motion.div 
      ref={cardRef}
      layout
      className={`bg-slate-800/50 border rounded-xl transition-all duration-300 ${isFeatured ? 'border-yellow-500/50' : 'border-slate-700'}`}
    >
      <div 
        className="p-4 flex items-center justify-between cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-4 min-w-0">
          <div className={`p-1.5 rounded-full ${statusConfig[project.status]?.color || 'bg-gray-500'}`}></div>
          {isEditing ? (
            <input
              type="text"
              value={editedName}
              onChange={handleNameChange}
              onKeyDown={handleKeyDown}
              onBlur={handleSaveName}
              onClick={(e) => e.stopPropagation()}
              className="bg-slate-700 border border-slate-600 rounded-md px-2 py-1 text-lg font-bold w-full"
              autoFocus
            />
          ) : (
            <h2 className="text-lg font-bold text-white truncate">{project.name}</h2>
          )}
          <span className="text-xs font-semibold px-2 py-1 rounded-full bg-slate-700 text-slate-300">
            {statusConfig[project.status]?.text || 'Borrador'}
          </span>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button onClick={(e) => { e.stopPropagation(); setDefaultProject(project.id); }} disabled={project.isDefault} className="p-2 text-slate-400 hover:text-yellow-400 disabled:text-yellow-400 disabled:cursor-not-allowed" title="Marcar como proyecto por defecto">
            <FiStar />
          </button>
          <button onClick={(e) => { e.stopPropagation(); handleEditToggle(); }} className="p-2 text-slate-400 hover:text-blue-400" title="Editar nombre">
            <FiEdit />
          </button>
          <button onClick={(e) => { e.stopPropagation(); setProjectStatus(project.id, 'archivado'); }} className="p-2 text-slate-400 hover:text-orange-400" title="Archivar proyecto">
            <FiArchive />
          </button>
          <button onClick={(e) => { e.stopPropagation(); handleDeleteProject(); }} className="p-2 text-slate-400 hover:text-red-500" title="Eliminar proyecto">
            <FiTrash2 />
          </button>
          <span className="text-slate-600">|</span>
          <button className="p-2 text-slate-400">
            {isExpanded ? <FiChevronUp /> : <FiChevronDown />}
          </button>
        </div>
      </div>
      
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 border-t border-slate-700/50">
              {/* ----- CAMBIO 3: Envolver la sección de tareas con el DragDropContext ----- */}
              <DragDropContext onDragEnd={onDragEnd}>
                <div className="p-4 my-4 bg-slate-900/50 rounded-lg">
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-2">
                      <button onClick={() => setHideCompleted(!hideCompleted)} className="flex items-center gap-2 text-sm text-slate-400 hover:text-white">
                        {hideCompleted ? <FiEyeOff/> : <FiEye/>}
                        <span>{hideCompleted ? 'Ocultar completadas' : 'Mostrando todas'}</span>
                      </button>
                    </div>
                    <div className="relative w-1/3">
                      <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                      <input
                        type="text"
                        placeholder="Buscar tarea..."
                        value={taskSearchQuery}
                        onChange={(e) => setTaskSearchQuery(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-md pl-9 pr-3 py-1.5 text-sm"
                      />
                    </div>
                  </div>
                  
                  {/* ----- CAMBIO 4: Envolver la lista de tareas con el componente Droppable ----- */}
                  <Droppable droppableId={`tasks-for-project-${project.id}`}>
                    {(provided) => (
                      <div 
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className="space-y-2"
                      >
                        {filteredTasks.length > 0 ? (
                          filteredTasks.map((task, index) => (
                            <TareaCard key={task.id} task={task} projectId={project.id} index={index} />
                          ))
                        ) : (
                          <p className="text-center text-sm text-slate-500 py-4">No hay tareas que coincidan con los filtros.</p>
                        )}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>
              </DragDropContext>
              
              {showAddTaskForm ? (
                <div className="mt-4">
                  <AddTaskForm projectId={project.id} onTaskAdded={() => setShowAddTaskForm(false)} />
                  <button onClick={() => setShowAddTaskForm(false)} className="w-full text-center text-xs text-slate-500 hover:text-white mt-2">
                    Cancelar
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => setShowAddTaskForm(true)}
                  className="w-full flex justify-center items-center gap-2 text-slate-300 hover:text-white p-3 mt-2 rounded-lg bg-slate-700/50 hover:bg-slate-700 border border-dashed border-slate-600"
                >
                  <FiPlus /> Añadir Tarea
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ProyectoCard;