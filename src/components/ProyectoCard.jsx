import React, { useState, useContext } from 'react';
import { 
  FiEdit, 
  FiTrash2, 
  FiPlus, 
  FiStar, 
  FiChevronDown, 
  FiChevronRight, 
  FiSave, 
  FiX, 
  FiBarChart2 
} from 'react-icons/fi';
import AppContext from '../context/AppContext';
import TareaCard from './TareaCard';
import GraficoEsfuerzo from './GraficoEsfuerzo'; // Asegúrate de que este componente exista

const ProyectoCard = ({ project }) => {
  const { 
    addTask, 
    setDefaultProject, 
    editProject, 
    deleteProject 
  } = useContext(AppContext);

  // Estados para la funcionalidad interna del card
  const [showTasks, setShowTasks] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showChart, setShowChart] = useState(false); // Estado para el gráfico

  // Estados para los formularios
  const [taskTitle, setTaskTitle] = useState('');
  const [taskHours, setTaskHours] = useState('1'); // Default a 1h para nuevas tareas
  const [name, setName] = useState(project.name);
  const [contact, setContact] = useState(project.contact || '');
  const [email, setEmail] = useState(project.email || '');
  const [description, setDescription] = useState(project.description || '');

  const handleAddTask = () => {
    if (!taskTitle.trim()) return;
    addTask(project.id, taskTitle.trim(), taskHours);
    setTaskTitle('');
    setTaskHours('1');
  };

  const handleSaveEdit = () => {
    if (!name.trim()) {
      alert('El nombre del proyecto no puede estar vacío.');
      return;
    }
    editProject(project.id, { name: name.trim(), contact, email, description });
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    // Restaura los valores originales al cancelar
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

  return (
    <div className={`border rounded-2xl p-4 mb-3 shadow-lg transition-all duration-300 ${project.isDefault ? 'bg-blue-900/40 border-blue-500 shadow-blue-900/30' : 'bg-zinc-800 border-zinc-700 hover:border-zinc-600'}`}>
      {isEditing ? (
        // --- VISTA DE EDICIÓN ---
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
        // --- VISTA NORMAL ---
        <>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 font-semibold text-lg cursor-pointer text-white" onClick={() => setShowTasks(!showTasks)}>
              {showTasks ? <FiChevronDown /> : <FiChevronRight />}
              <span>{project.name}</span>
              {project.isDefault && <span className="text-xs font-medium bg-blue-500/80 text-white px-2 py-0.5 rounded-full">Default</span>}
            </div>
            <div className="flex items-center gap-1 text-lg">
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

          {/* Renderizado condicional del gráfico */}
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

              {/* Formulario para agregar nueva tarea */}
              <div className="flex gap-2 pt-2 border-t border-zinc-700/50 mt-4">
                <input
                  className="flex-1 bg-zinc-700 border border-zinc-600 rounded-lg px-3 py-1.5 text-sm text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={taskTitle}
                  onChange={e => setTaskTitle(e.target.value)}
                  placeholder="Añadir una nueva tarea..."
                />
                <input
                  className="w-20 bg-zinc-700 border border-zinc-600 rounded-lg px-2 py-1.5 text-sm text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  type="number"
                  min="0"
                  step="0.5"
                  value={taskHours}
                  onChange={e => setTaskHours(e.target.value)}
                  title="Horas estimadas"
                />
                <button
                  aria-label="Agregar tarea"
                  className="bg-blue-600 text-white rounded-lg px-3 py-1.5 hover:bg-blue-700 transition-colors disabled:opacity-50"
                  onClick={handleAddTask}
                  disabled={!taskTitle.trim()}
                >
                  <FiPlus />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ProyectoCard;