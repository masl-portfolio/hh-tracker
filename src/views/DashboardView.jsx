import React, { useContext, useState, useMemo } from 'react';
import AppContext from '../context/AppContext';
import EventCard from '../components/EventCard';
import AddEventForm from '../components/AddEventForm';
import Cronometro from '../components/Cronometro';
import AddTaskForm from '../components/AddTaskForm';
import { 
  FiPlay, 
  FiPause, 
  FiAlertTriangle, 
  FiList, 
  FiPlus,
  FiCheckCircle,
  FiLock,
  FiXCircle
} from 'react-icons/fi';

const DashboardView = () => {
  const { 
    projects, 
    events, 
    activeTask,
    startTask, 
    pauseTask, 
    updateActiveTaskObservation,
    setTaskStatus
  } = useContext(AppContext);

  const [eventFilter, setEventFilter] = useState('pending');
  const [projectFilter, setProjectFilter] = useState('all');
  const [showAddTaskForm, setShowAddTaskForm] = useState(false);
  const [showAddEventForm, setShowAddEventForm] = useState(false);
  const [hoveredTaskId, setHoveredTaskId] = useState(null);

  const filteredEvents = useMemo(() => {
    let tempEvents = [...events].sort((a, b) => b.createdAt - a.createdAt);
    if (projectFilter !== 'all') {
      tempEvents = tempEvents.filter(e => e.projectId === Number(projectFilter));
    }
    switch (eventFilter) {
      case 'pending': return tempEvents.filter(e => !e.isCompleted);
      case 'upcoming': return tempEvents.filter(e => e.type === 'aviso' && !e.isCompleted);
      default: return tempEvents;
    }
  }, [events, eventFilter, projectFilter]);

  const agendaTasks = useMemo(() => {
    const allTasks = projects.flatMap(p => 
      (p.tasks || []).map(t => ({...t, projectName: p.name, projectId: p.id}))
    );
    return allTasks.filter(t => t.status === 'en desarrollo' || t.status === 'bloqueada' || t.status === 'backlog').slice(0, 5);
  }, [projects]);

  const activeTaskDetails = useMemo(() => {
    if (!activeTask) return null;
    const project = projects.find(p => p.id === activeTask.projectId);
    if (!project) return null;
    const task = project.tasks.find(t => t.id === activeTask.taskId);
    return task ? { ...task, projectName: project.name } : null;
  }, [activeTask, projects]);
  
  const defaultProject = projects.find(p => p.isDefault);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 max-w-7xl mx-auto w-full p-4 lg:p-6 flex-1 no-drag overflow-y-auto">
        
      <div className={`xl:col-span-1 bg-black/10 backdrop-blur-md border border-white/10 rounded-xl p-4 flex-col gap-4 h-fit ${activeTask ? 'hidden xl:flex' : 'flex'}`}>
        <h2 className="text-lg font-bold text-white">Agenda de Hoy</h2>
        <div>
          <h3 className="flex items-center gap-2 text-sm font-semibold text-orange-400 mb-2">
            <FiAlertTriangle /> Próximos Vencimientos
          </h3>
          <div className="space-y-2">
            {filteredEvents.filter(e => e.type === 'aviso' && !e.isCompleted).length > 0 ? (
              filteredEvents.filter(e => e.type === 'aviso' && !e.isCompleted).map(event => <EventCard key={event.id} event={event} />)
            ) : (
              <p className="text-xs text-zinc-500 px-1">¡Sin vencimientos a la vista!</p>
            )}
          </div>
        </div>
        <div>
          <h3 className="flex items-center gap-2 text-sm font-semibold text-blue-400 mb-2">
            <FiList /> Tareas Clave
          </h3>
          <div className="space-y-2">
            {agendaTasks.length > 0 ? (
              agendaTasks.map(task => (
                <div 
                  key={task.id} 
                  className="flex items-center justify-between bg-zinc-800/60 p-2 rounded-lg"
                  onMouseEnter={() => setHoveredTaskId(task.id)}
                  onMouseLeave={() => setHoveredTaskId(null)}
                >
                  <div className="flex-1 min-w-0 pr-2">
                    <p className="text-sm text-white truncate">{task.title}</p>
                    <p className="text-xs text-zinc-400 truncate">{task.projectName}</p>
                  </div>
                  
                  {/* --- SECCIÓN DE BOTONES CORREGIDA --- */}
                  <div className="flex items-center gap-2">
                    {/* Las acciones rápidas aparecen a la izquierda si hacemos hover */}
                    {hoveredTaskId === task.id && (
                      <div className="flex items-center gap-1 animate-fade-in-fast">
                        <button onClick={() => setTaskStatus(task.projectId, task.id, 'completada')} title="Marcar como Completada" className="p-2 text-zinc-400 hover:text-green-500 hover:bg-green-500/20 rounded-full"><FiCheckCircle size={16}/></button>
                        <button onClick={() => setTaskStatus(task.projectId, task.id, 'bloqueada')} title="Marcar como Bloqueada" className="p-2 text-zinc-400 hover:text-orange-400 hover:bg-orange-500/20 rounded-full"><FiLock size={16}/></button>
                        <button onClick={() => setTaskStatus(task.projectId, task.id, 'cancelada')} title="Cancelar Tarea" className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-500/20 rounded-full"><FiXCircle size={16}/></button>
                      </div>
                    )}
                    
                    {/* El botón de Play siempre está visible */}
                    <button 
                      onClick={() => startTask(task.projectId, task.id)} 
                      disabled={activeTask !== null || (task.status !== 'backlog' && task.status !== 'en desarrollo')} 
                      className="p-2 bg-green-500 rounded-full hover:bg-green-600 disabled:bg-zinc-600 disabled:cursor-not-allowed no-drag"
                    >
                      <FiPlay size={14} className="ml-0.5 text-white"/>
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-zinc-500 px-1">No hay tareas clave pendientes.</p>
            )}
          </div>
        </div>
      </div>

      <div className={`xl:col-span-1 bg-black/10 backdrop-blur-md border border-white/10 rounded-xl p-4 flex flex-col gap-4 h-fit ${activeTask ? 'xl:col-start-2' : ''}`}>
        <h2 className="text-lg font-bold text-white">En Foco</h2>
        {activeTask && activeTaskDetails ? (
          <div className="flex-1 flex flex-col space-y-4">
            <div className="flex flex-col items-center justify-center text-center space-y-3">
              <p className="text-xs text-zinc-400">{activeTaskDetails.projectName}</p>
              <h3 className="text-2xl font-bold text-white leading-tight">{activeTaskDetails.title}</h3>
              <Cronometro startTime={activeTask.startTime} className="text-xl w-full justify-center"/>
              <textarea className="w-full rounded-md border border-zinc-600 bg-zinc-800 px-2 py-1.5 text-sm no-drag" placeholder="Añadir comentario..." value={activeTask.observation || ''} onChange={(e) => updateActiveTaskObservation(e.target.value)} />
              <button onClick={pauseTask} className="w-full mt-1 flex justify-center items-center gap-2 px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded-lg font-medium no-drag"><FiPause size={16}/> Pausar y Guardar</button>
            </div>
            <div className="border-t border-zinc-700 pt-4">
              <AddEventForm 
                projectId={activeTask.projectId} 
                taskId={activeTask.taskId}
              />
            </div>
          </div>
        ) : (
          defaultProject ? (
            showAddTaskForm ? (
              <div className="animate-fade-in">
                <p className="text-sm text-zinc-400 mb-2 px-1">
                  Añadir tarea a: <span className="font-semibold text-white">{defaultProject.name}</span>
                </p>
                <AddTaskForm projectId={defaultProject.id} />
                <button onClick={() => setShowAddTaskForm(false)} className="w-full text-center text-xs text-zinc-400 hover:text-white mt-2 no-drag">
                  Cancelar
                </button>
              </div>
            ) : (
              <button onClick={() => setShowAddTaskForm(true)} className="w-full flex justify-center items-center gap-2 text-zinc-300 hover:text-white p-4 rounded-lg bg-black/20 hover:bg-black/40 border border-dashed border-zinc-700 no-drag">
                <FiPlus /> Añadir Tarea Rápida
              </button>
            )
          ) : (
              <div className="flex-1 flex items-center justify-center text-center text-zinc-500 p-4">
                  <p>Selecciona un proyecto predeterminado para añadir tareas rápidamente.</p>
              </div>
          )
        )}
      </div>
        
      <div className={`xl:col-span-1 bg-black/10 backdrop-blur-md border border-white/10 rounded-xl p-4 flex flex-col gap-4 h-fit ${activeTask ? 'hidden xl:flex' : ''}`}>
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-bold text-white">Bitácora</h2>
          {!showAddEventForm && (
            <select onChange={(e) => setProjectFilter(e.target.value)} value={projectFilter} className="bg-zinc-800 border-zinc-700 text-xs rounded-md p-1 no-drag">
              <option value="all">Todos los Proyectos</option>
              {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          )}
        </div>
        
        {!showAddEventForm && (
          <>
            <div className="flex gap-2 border-b border-zinc-700 pb-2">
                <button onClick={() => setEventFilter('pending')} className={`text-xs px-2 py-1 rounded-md no-drag ${eventFilter === 'pending' ? 'bg-blue-600 text-white' : 'text-zinc-300 hover:bg-zinc-700'}`}>Bandeja de Entrada</button>
                <button onClick={() => setEventFilter('all')} className={`text-xs px-2 py-1 rounded-md no-drag ${eventFilter === 'all' ? 'bg-blue-600 text-white' : 'text-zinc-300 hover:bg-zinc-700'}`}>Todo</button>
            </div>
            <div className="flex-1 space-y-2 overflow-y-auto pr-2 max-h-[50vh] xl:max-h-none">
              {filteredEvents.length > 0 ? (
                filteredEvents.map(event => <EventCard key={event.id} event={event} />)
              ) : (
                <p className="text-center text-xs text-zinc-500 py-6">No hay eventos que coincidan.</p>
              )}
            </div>
          </>
        )}
        
        <div className="mt-auto pt-2 border-t border-zinc-700/50">
          {showAddEventForm ? (
            <div className="animate-fade-in">
              <AddEventForm 
                onEventAdded={() => {
                  setProjectFilter('all');
                  setShowAddEventForm(false);
                }}
              />
              <button onClick={() => setShowAddEventForm(false)} className="w-full text-center text-xs text-zinc-400 hover:text-white mt-2 no-drag">
                Cancelar
              </button>
            </div>
          ) : (
            <button onClick={() => setShowAddEventForm(true)} className="w-full flex justify-center items-center gap-2 text-zinc-300 hover:text-white p-2 rounded-lg bg-black/20 hover:bg-black/40 no-drag">
              <FiPlus /> Añadir a la Bitácora
            </button>
          )}
        </div>
      </div>

    </div>
  );
};

export default DashboardView;