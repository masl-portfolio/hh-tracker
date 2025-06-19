import React, { useContext, useState, useMemo } from 'react';
import AppContext from '../context/AppContext';
import EventCard from '../components/EventCard';
import AddEventForm from '../components/AddEventForm';
import Cronometro from '../components/Cronometro';
import AddTaskForm from '../components/AddTaskForm';
// ----- CAMBIO 1: Importar el Modal de Confirmación -----
import ModalConfirmacion from '../components/ModalConfirmacion'; 
import { 
  FiPlay, FiPause, FiAlertTriangle, FiList, FiPlus,
  FiCheckCircle, FiLock, FiSidebar, FiChevronDown,
  FiChevronRight, FiBox
} from 'react-icons/fi';

const DashboardView = () => {
  const { 
    projects, 
    events, 
    activeTask,
    startTask, 
    pauseTask, 
    updateActiveTaskObservation,
    setTaskStatus,
    // ----- CAMBIO 2: Obtener la función deleteEvent del contexto -----
    deleteEvent 
  } = useContext(AppContext);

  const [eventFilter, setEventFilter] = useState('pending');
  const [projectFilter, setProjectFilter] = useState('all');
  const [showAddTaskForm, setShowAddTaskForm] = useState(false);
  const [showAddEventForm, setShowAddEventForm] = useState(false);
  const [showVencimientos, setShowVencimientos] = useState(true);
  const [showTareasClave, setShowTareasClave] = useState(true);
  const [showAgenda, setShowAgenda] = useState(true);
  const [showBitacora, setShowBitacora] = useState(true);

  // ----- CAMBIO 3: Añadir estado para el modal -----
  const [modalState, setModalState] = useState({
    isOpen: false,
    eventToDelete: null,
  });

  const isFocusMode = useMemo(() => activeTask !== null, [activeTask]);

  // ----- CAMBIO 4: Crear funciones para manejar el ciclo de vida del modal -----
  
  // Esta función se llamará desde EventCard para solicitar la eliminación
  const handleRequestDeleteEvent = (event) => {
    setModalState({ isOpen: true, eventToDelete: event });
  };

  // Esta función se ejecutará si el usuario confirma en el modal
  const handleConfirmDelete = () => {
    if (modalState.eventToDelete) {
      deleteEvent(modalState.eventToDelete.id);
    }
    // Cierra el modal y limpia el estado
    setModalState({ isOpen: false, eventToDelete: null });
  };

  // Esta función se ejecutará si el usuario cancela
  const handleCancelDelete = () => {
    setModalState({ isOpen: false, eventToDelete: null });
  };

  const filteredEvents = useMemo(() => {
    let tempEvents = [...events].sort((a, b) => b.createdAt - a.createdAt);
    if (projectFilter !== 'all') {
      tempEvents = tempEvents.filter(e => e.projectId === Number(projectFilter));
    }
    if (eventFilter === 'pending') {
      return tempEvents.filter(e => !e.isCompleted);
    }
    return tempEvents;
  }, [events, eventFilter, projectFilter]);

  const agendaTasks = useMemo(() => {
    const allTasks = projects.flatMap(p => (p.tasks || []).map(t => ({...t, projectName: p.name, projectId: p.id})));
    return allTasks.filter(t => ['en desarrollo', 'bloqueada', 'backlog'].includes(t.status)).slice(0, 5);
  }, [projects]);

  const activeTaskDetails = useMemo(() => {
    if (!activeTask) return null;
    const project = projects.find(p => p.id === activeTask.projectId);
    if (!project) return null;
    const task = project.tasks.find(t => t.id === activeTask.taskId);
    return task ? { ...task, projectName: project.name } : null;
  }, [activeTask, projects]);
  
  const defaultProject = projects.find(p => p.isDefault);
  
  const gridLayoutClass = isFocusMode 
    ? 'xl:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)_minmax(0,1fr)]'
    : 'xl:grid-cols-3';

  return (
    <div className="relative h-full overflow-y-auto">
      
      {/* ----- CAMBIO 5: Renderizar el modal de confirmación ----- */}
      <ModalConfirmacion
        isOpen={modalState.isOpen}
        titulo="Eliminar Evento"
        mensaje={`¿Estás seguro de que quieres eliminar el evento "${modalState.eventToDelete?.title}"? Esta acción no se puede deshacer.`}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        textoConfirmar="Sí, eliminar"
        textoCancelar="Cancelar"
      />

      <div className={`grid gap-6 max-w-7xl mx-auto w-full p-4 lg:p-6 pb-24 no-drag ${gridLayoutClass}`}>
        
        {/* Columna Agenda de Hoy */}
        <div className={`transition-opacity duration-500 ${isFocusMode ? 'opacity-40 hover:opacity-100 focus-within:opacity-100' : 'opacity-100'}`}>
          <div className="xl:col-span-1 bg-black/10 backdrop-blur-md border border-white/10 rounded-xl p-4 flex flex-col gap-4 h-fit">
            {showAgenda ? (
              <div className="animate-fade-in flex flex-col gap-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-bold text-white">Agenda de Hoy</h2>
                  <button onClick={() => setShowAgenda(false)} title="Colapsar Agenda" className="text-zinc-400 hover:text-white"><FiSidebar size={16} /></button>
                </div>
                <div>
                  <h3 onClick={() => setShowVencimientos(!showVencimientos)} className="flex items-center gap-2 text-sm font-semibold text-orange-400 mb-2 cursor-pointer select-none">
                    {showVencimientos ? <FiChevronDown /> : <FiChevronRight />} Próximos Vencimientos
                  </h3>
                  {showVencimientos && (
                    <div className="space-y-2 animate-fade-in-fast pl-1">
                      {filteredEvents.filter(e => e.type === 'aviso' && !e.isCompleted).length > 0 ? (
                        filteredEvents.filter(e => e.type === 'aviso' && !e.isCompleted).map(event => 
                          <EventCard 
                            key={event.id} 
                            event={event} 
                            // ----- CAMBIO 6: Pasar la nueva función al EventCard -----
                            onDeleteRequest={handleRequestDeleteEvent}
                          />
                        )
                      ) : (
                        <p className="text-xs text-zinc-500 px-1">¡Sin vencimientos a la vista!</p>
                      )}
                    </div>
                  )}
                </div>
                <div>
                  <h3 onClick={() => setShowTareasClave(!showTareasClave)} className="flex items-center gap-2 text-sm font-semibold text-blue-400 mb-2 cursor-pointer select-none">
                    {showTareasClave ? <FiChevronDown /> : <FiChevronRight />} Tareas Clave
                  </h3>
                  {showTareasClave && (
                    <div className="space-y-2 animate-fade-in-fast pl-1">
                      {agendaTasks.length > 0 ? (
                        agendaTasks.map(task => (
                          <div key={task.id} className="group flex items-center justify-between bg-zinc-800/60 p-2 rounded-lg gap-2">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-white truncate">{task.title}</p>
                              <p className="text-xs text-zinc-400 truncate">{task.projectName}</p>
                            </div>
                            <div className="flex items-center flex-shrink-0">
                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                <button onClick={() => setTaskStatus(task.projectId, task.id, 'completada')} title="Completada" className="p-1 text-zinc-400 hover:text-green-500"><FiCheckCircle size={16}/></button>
                                <button onClick={() => setTaskStatus(task.projectId, task.id, 'bloqueada')} title="Bloqueada" className="p-1 text-zinc-400 hover:text-orange-400"><FiLock size={16}/></button>
                              </div>
                              <button onClick={() => startTask(task.projectId, task.id)} disabled={activeTask !== null || !['backlog', 'en desarrollo'].includes(task.status)} className="p-2 bg-green-500 rounded-full hover:bg-green-600 disabled:bg-zinc-600 ml-2">
                                <FiPlay size={14} className="ml-0.5 text-white"/>
                              </button>
                            </div>
                          </div>
                        ))
                      ) : ( <p className="text-xs text-zinc-500 px-1">No hay tareas clave pendientes.</p> )}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex justify-between items-center animate-fade-in">
                <h2 className="text-lg font-bold text-white">Agenda de Hoy</h2>
                <button onClick={() => setShowAgenda(true)} title="Mostrar Agenda" className="text-zinc-400 hover:text-white"><FiSidebar size={16} style={{transform: 'scaleX(-1)'}} /></button>
              </div>
            )}
          </div>
        </div>

        {/* Columna En Foco */}
        <div className="lg:col-span-1 bg-black/10 backdrop-blur-md border border-white/10 rounded-xl p-4 flex flex-col gap-4 h-fit">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold text-white">En Foco</h2>
          </div>
          {activeTask && activeTaskDetails ? (
            <div className="animate-fade-in flex-1 flex flex-col space-y-4">
              <div className="flex flex-col items-center justify-center text-center space-y-3">
                <p className="text-xs text-zinc-400">{activeTaskDetails.projectName}</p>
                <h3 className="text-2xl font-bold text-white leading-tight">{activeTaskDetails.title}</h3>
                <Cronometro startTime={activeTask.startTime} className="text-3xl font-mono w-full justify-center my-2"/>
                <textarea rows="2" className="w-full rounded-md border border-zinc-600 bg-zinc-800 px-2 py-1.5 text-sm no-drag" placeholder="Añadir comentario..." value={activeTask.observation || ''} onChange={(e) => updateActiveTaskObservation(e.target.value)} />
                <button onClick={pauseTask} className="w-full mt-1 flex justify-center items-center gap-2 px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded-lg font-medium no-drag"><FiPause size={16}/> Pausar y Guardar</button>
              </div>
              <div className="border-t border-zinc-700 pt-4">
                <AddEventForm projectId={activeTask.projectId} taskId={activeTask.taskId} />
              </div>
            </div>
          ) : (
            defaultProject ? (
              showAddTaskForm ? (
                <div className="animate-fade-in">
                  <p className="text-sm text-zinc-400 mb-2 px-1">Añadir tarea a: <span className="font-semibold text-white">{defaultProject.name}</span></p>
                  <AddTaskForm projectId={defaultProject.id} onTaskAdded={() => setShowAddTaskForm(false)} />
                  <button onClick={() => setShowAddTaskForm(false)} className="w-full text-center text-xs text-zinc-500 hover:text-white mt-2 no-drag">
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
                <p>Crea un proyecto y márcalo como predeterminado para añadir tareas rápidamente.</p>
              </div>
            )
          )}
        </div>

        {/* Columna Bitácora */}
        <div className={`transition-opacity duration-500 ${isFocusMode ? 'opacity-40 hover:opacity-100 focus-within:opacity-100' : 'opacity-100'}`}>
          <div className="lg:col-span-1 bg-black/10 backdrop-blur-md border border-white/10 rounded-xl p-4 flex flex-col gap-4 h-fit">
            {showBitacora ? (
              <div className="animate-fade-in flex flex-col gap-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-bold text-white">Bitácora</h2>
                  <div className='flex items-center gap-2'>
                    {!showAddEventForm && (
                      <select onChange={(e) => setProjectFilter(e.target.value)} value={projectFilter} className="bg-zinc-800 border-zinc-700 text-xs rounded-md p-1 no-drag">
                        <option value="all">Todos los Proyectos</option>
                        {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                      </select>
                    )}
                    <button onClick={() => setShowBitacora(false)} title="Colapsar Bitácora" className="text-zinc-400 hover:text-white"><FiSidebar size={16} style={{transform: 'scaleX(-1)'}} /></button>
                  </div>
                </div>
                {!showAddEventForm && (
                  <>
                    <div className="flex gap-2 border-b border-zinc-700 pb-2">
                        <button onClick={() => setEventFilter('pending')} className={`text-xs px-2 py-1 rounded-md no-drag ${eventFilter === 'pending' ? 'bg-blue-600 text-white' : 'text-zinc-300 hover:bg-zinc-700'}`}>Bandeja de Entrada</button>
                        <button onClick={() => setEventFilter('all')} className={`text-xs px-2 py-1 rounded-md no-drag ${eventFilter === 'all' ? 'bg-blue-600 text-white' : 'text-zinc-300 hover:bg-zinc-700'}`}>Todo</button>
                    </div>
                    <div className="flex-1 space-y-2 overflow-y-auto pr-2 max-h-[50vh] xl:max-h-none">
                      {filteredEvents.length > 0 ? (
                        filteredEvents.map(event => 
                          <EventCard 
                            key={event.id} 
                            event={event} 
                            // ----- CAMBIO 6 (Repetido): Pasar la nueva función al EventCard -----
                            onDeleteRequest={handleRequestDeleteEvent}
                          />
                        )
                      ) : ( <p className="text-center text-xs text-zinc-500 py-6">No hay eventos que coincidan.</p> )}
                    </div>
                  </>
                )}
                <div className="mt-auto pt-2 border-t border-zinc-700/50">
                  {showAddEventForm ? (
                    <div className="animate-fade-in">
                      <AddEventForm onEventAdded={() => { setProjectFilter('all'); setShowAddEventForm(false); }} />
                      <button onClick={() => setShowAddEventForm(false)} className="w-full text-center text-xs text-zinc-400 hover:text-white mt-2 no-drag">Cancelar</button>
                    </div>
                  ) : (
                    <button onClick={() => setShowAddEventForm(true)} className="w-full flex justify-center items-center gap-2 text-zinc-300 hover:text-white p-2 rounded-lg bg-black/20 hover:bg-black/40 no-drag">
                      <FiPlus /> Añadir a la Bitácora
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex justify-between items-center animate-fade-in">
                <h2 className="text-lg font-bold text-white">Bitácora</h2>
                <button onClick={() => setShowBitacora(true)} title="Mostrar Bitácora" className="text-zinc-400 hover:text-white"><FiSidebar size={16} /></button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <footer className="absolute bottom-4 left-0 right-0 flex justify-center items-center pointer-events-none no-drag">
        <div className="flex flex-col items-center justify-center text-white select-none opacity-10">
          <FiBox size={40} strokeWidth={0.75} />
          <span className="text-sm font-bold tracking-widest mt-1">
            HH TRACKER
          </span>
        </div>
      </footer>
    </div>
  );
};

export default DashboardView;