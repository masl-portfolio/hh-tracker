import React, { useContext, useState } from 'react';
import { FiPause, FiFolder, FiMinus, FiPlay, FiPlus } from 'react-icons/fi';
import AppContext from '../context/AppContext';
import Cronometro from '../components/Cronometro';

const WidgetView = () => {
  const { projects, activeTask, pauseTask, startTask, addTask, updateActiveTaskObservation } = useContext(AppContext);

  // --- ESTADO LOCAL DEL WIDGET ---
  const [showAddTaskForm, setShowAddTaskForm] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskHours, setNewTaskHours] = useState('1');

  // --- LÓGICA DE DATOS ---
  const defaultProject = projects.find(p => p.isDefault);
  
  const pendingTasks = defaultProject?.tasks.filter(
    task => task.status !== 'completada' && task.status !== 'cancelada'
  ) || [];

  let activeTaskDetails = null;
  if (activeTask && projects.length > 0) {
    const project = projects.find(p => p.id === activeTask.projectId);
    if (project) {
      activeTaskDetails = { ...project.tasks.find(t => t.id === activeTask.taskId), projectName: project.name };
    }
  }

  // --- MANEJADORES DE EVENTOS ---
  const handleAddTask = () => {
    if (!newTaskTitle.trim() || !defaultProject) return;
    addTask(defaultProject.id, newTaskTitle.trim(), newTaskHours);
    setNewTaskTitle('');
    setNewTaskHours('1');
    setShowAddTaskForm(false);
  };

  const handleMinimize = () => window.electron?.minimizeWindow();
  const handleOpenProyectos = () => window.electron?.openProyectos();

  // --- RENDERIZADO DEL COMPONENTE ---
  return (
    <div className="w-full h-full p-3 bg-zinc-900 flex flex-col gap-3 text-sm font-sans">
      <div className="flex justify-between items-center drag-area select-none cursor-move px-1">
        <h1 className="text-base font-semibold text-zinc-100">
          {defaultProject ? `Proyecto: ${defaultProject.name}` : 'HH Tracker'}
        </h1>
        <div className="flex gap-2 items-center">
          <button className="flex items-center gap-1 text-blue-500 hover:underline text-xs no-drag" onClick={handleOpenProyectos}><FiFolder size={14}/> Proyectos</button>
          <button onClick={handleMinimize} className="text-zinc-500 hover:text-zinc-300 no-drag"><FiMinus size={16}/></button>
        </div>
      </div>

      <div className="flex-1 flex flex-col animated-gradient-background rounded-lg p-3 text-white overflow-hidden">
        {activeTaskDetails ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center space-y-3">
              <p className="text-xs text-zinc-400">En progreso:</p>
              <h2 className="text-lg font-bold text-white leading-tight">{activeTaskDetails.title}</h2>
              <Cronometro startTime={activeTask.startTime} className="text-base w-full justify-center"/>
              
              <input
                type="text"
                className="w-full rounded-md border border-zinc-600 bg-zinc-800 px-2 py-1.5 text-xs text-white no-drag placeholder-zinc-400"
                placeholder="Añadir un comentario..."
                value={activeTask.observation || ''}
                onChange={(e) => updateActiveTaskObservation(e.target.value)}
              />

              <button onClick={pauseTask} className="w-full mt-1 flex justify-center items-center gap-2 px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded-lg font-medium no-drag">
                <FiPause size={16}/> Pausar y Guardar
              </button>
          </div>
        ) : defaultProject ? (
          <div className="flex flex-col h-full">
            <h3 className="text-sm font-semibold mb-2 px-1 text-zinc-300">Tareas Pendientes</h3>
            
            {pendingTasks.length > 0 ? (
                <div className="flex-1 space-y-2 overflow-y-auto pr-1">
                    {pendingTasks.map(task => (
                        <div key={task.id} className="flex items-center justify-between bg-black/20 p-2 rounded-md">
                            <span className="text-sm text-zinc-200">{task.title}</span>
                            <button onClick={() => startTask(defaultProject.id, task.id)} className="p-1.5 bg-green-500 rounded-full hover:bg-green-600 no-drag">
                                <FiPlay size={14} className="ml-0.5"/>
                            </button>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="flex-1 text-center text-xs text-zinc-500 py-4">¡Todas las tareas completadas!</p>
            )}

            <div className="mt-2 pt-2 border-t border-white/10">
                {showAddTaskForm ? (
                    <div className="space-y-2 animate-fade-in">
                        <input
                            className="w-full rounded-md border border-zinc-600 bg-zinc-800 px-2 py-1.5 text-xs text-white no-drag"
                            value={newTaskTitle}
                            onChange={(e) => setNewTaskTitle(e.target.value)}
                            placeholder="Descripción de la nueva tarea"
                            autoFocus
                        />
                        <div className="flex gap-2">
                             <input
                                className="w-1/3 rounded-md border border-zinc-600 bg-zinc-800 px-2 py-1.5 text-xs text-white no-drag"
                                type="number" min="0" step="0.5"
                                value={newTaskHours}
                                onChange={(e) => setNewTaskHours(e.target.value)}
                            />
                            <button onClick={handleAddTask} disabled={!newTaskTitle.trim()} className="flex-1 flex justify-center items-center gap-1.5 px-3 py-1.5 bg-blue-600 rounded-md text-xs font-medium no-drag disabled:opacity-50">
                                <FiPlus size={14}/>Añadir
                            </button>
                        </div>
                         <button onClick={() => setShowAddTaskForm(false)} className="w-full text-center text-xs text-zinc-400 hover:text-white mt-1 no-drag">
                            Cancelar
                        </button>
                    </div>
                ) : (
                    <button onClick={() => setShowAddTaskForm(true)} className="w-full flex justify-center items-center gap-2 text-zinc-300 hover:text-white text-xs p-1 rounded-md bg-black/20 hover:bg-black/40 no-drag">
                        <FiPlus size={14}/> Añadir nueva tarea
                    </button>
                )}
            </div>
          </div>
        ) : (
           <div className="flex-1 flex flex-col items-center justify-center text-zinc-500">
                <p className="font-semibold">No hay proyecto predeterminado.</p>
                <p className="text-xs mt-1">Ve a Proyectos y selecciona uno con la estrella.</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default WidgetView;