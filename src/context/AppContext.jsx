import React, { createContext, useEffect, useState, useRef, useCallback } from 'react';
import toast from 'react-hot-toast';

const AppContext = createContext();

export const AppProvider = ({ children, activeProfile }) => {
  const [projects, setProjects] = useState([]);
  const [events, setEvents] = useState([]);
  const [activeTask, setActiveTask] = useState(null);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [activeView, setActiveView] = useState('foco');
  const [isMaximized, setIsMaximized] = useState(false);

  // ----- CAMBIO CLAVE: REINTRODUCIR EL LISTENER PARA EL ESTADO DE LA VENTANA -----
  useEffect(() => {
    // Función que se ejecutará cuando el estado de la ventana cambie
    const handleMaximizedStateChange = (maximized) => {
      setIsMaximized(maximized);
    };

    // Suscribirse al evento expuesto por el preload script
    window.electronAPI?.onWindowMaximizedStateChanged(handleMaximizedStateChange);

    // Función de limpieza para evitar fugas de memoria cuando el componente se desmonte
    return () => {
      window.electronAPI?.removeAllListeners('window-maximized-state-changed');
    };
  }, []); // El array vacío asegura que este efecto se ejecute solo una vez, al montar el componente.


  // --- LÓGICA DE CARGA Y GUARDADO (sin cambios) ---
  const loadData = useCallback(async () => {
    if (!activeProfile?.dataPath) {
      console.error("No se proporcionó una ruta de datos válida para el perfil.");
      setIsDataLoaded(true);
      return;
    }

    try {
      const data = await window.electronAPI.loadData(activeProfile.dataPath);
      setProjects(data.projects || []);
      setEvents(data.events || []);
      setActiveTask(data.activeTask || null);
    } catch (error) {
      console.error("Error al cargar datos del perfil:", error);
      toast.error("No se pudieron cargar los datos del perfil.");
    } finally {
      setIsDataLoaded(true);
    }
  }, [activeProfile]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (isDataLoaded && activeProfile?.dataPath) {
      const dataToSave = { projects, events, activeTask };
      window.electronAPI.saveData(activeProfile.dataPath, dataToSave);
    }
  }, [projects, events, activeTask, isDataLoaded, activeProfile]);

  // --- El resto de tus funciones de manipulación de estado (sin cambios) ---

  const checkAndGenerateDueEvents = useCallback((currentProjects, currentEvents) => {
    const newOrUpdatedAvisos = [];
    const unaSemanaEnMs = 7 * 24 * 60 * 60 * 1000;
    const ahora = Date.now();
    const todasLasTareas = currentProjects.flatMap(p => (p.tasks || []).map(t => ({ ...t, projectId: p.id })));
    todasLasTareas.forEach(task => {
      const idAviso = `aviso-tarea-${task.id}`;
      const existingAviso = currentEvents.find(e => e.id === idAviso);
      const isTaskDone = ['completada', 'cancelada'].includes(task.status);
      if (isTaskDone) {
        if (existingAviso && !existingAviso.isCompleted) {
          newOrUpdatedAvisos.push({ ...existingAviso, isCompleted: true, completedAt: ahora });
        }
        return;
      }
      if (task.fechaFinEstimada && !existingAviso) {
        const tiempoRestante = new Date(task.fechaFinEstimada).getTime() - ahora;
        if (tiempoRestante > 0 && tiempoRestante <= unaSemanaEnMs) {
          newOrUpdatedAvisos.push({
            id: idAviso, createdAt: ahora, type: 'aviso', isSystemGenerated: true,
            title: `Vencimiento: ${task.title}`, details: `Fecha de entrega estimada: ${new Date(task.fechaFinEstimada).toLocaleDateString()}`,
            isCompleted: false, completedAt: null, projectId: task.projectId, taskId: task.id
          });
        }
      }
    });
    if (newOrUpdatedAvisos.length > 0) {
      setEvents(prevEvents => {
        const eventsMap = new Map(prevEvents.map(e => [e.id, e]));
        newOrUpdatedAvisos.forEach(aviso => eventsMap.set(aviso.id, aviso));
        return Array.from(eventsMap.values());
      });
      return true;
    }
    return false;
  }, []);

  useEffect(() => {
    if (isDataLoaded) {
      checkAndGenerateDueEvents(projects, events);
    }
  }, [projects, isDataLoaded, checkAndGenerateDueEvents, events]);

  const refreshData = useCallback(async () => {
    await loadData();
    toast.success('Datos actualizados.');
  }, [loadData]);

  const addEvent = (eventData) => { const newEvent = { id: Date.now(), createdAt: Date.now(), isCompleted: false, completedAt: null, ...eventData }; setEvents(prev => [...prev, newEvent]); toast.success('Evento añadido a la bitácora.'); };
  const editEvent = (eventId, updates) => { setEvents(prevEvents => prevEvents.map(event => event.id === eventId ? { ...event, ...updates } : event)); toast.success('Entrada de bitácora actualizada.'); };
  const toggleEventCompleted = (eventId) => { setEvents(prev => prev.map(e => e.id === eventId ? { ...e, isCompleted: !e.isCompleted, completedAt: !e.isCompleted ? Date.now() : null } : e)); toast.success('Estado del evento actualizado.'); };
  const deleteEvent = (eventId) => { setEvents(prev => prev.filter(e => e.id !== eventId)); toast.error('Evento eliminado.'); };
  const addActivity = (projectId, taskId, activity) => { setProjects(prevProjects => prevProjects.map(p => p.id !== projectId ? p : { ...p, tasks: p.tasks.map(t => t.id !== taskId ? t : { ...t, activities: [...(t.activities || []), { id: Date.now(), ...activity }] }) })); };
  const setTaskStatus = (projectId, taskId, status, showToast = true) => { setProjects(prevProjects => { let taskTitle = ''; let projectName = ''; let projectBecameFinalizado = false; const updatedProjects = prevProjects.map(project => { if (project.id !== projectId) return project; let allTasksDone = true; const updatedTasks = project.tasks.map(task => { let finalTask; if (task.id === taskId) { taskTitle = task.title; const statusChangeActivity = { id: Date.now(), type: 'estado', description: `Estado cambiado a: ${status}`, fechaInicio: Date.now(), fechaFin: Date.now(), observation: '' }; finalTask = { ...task, status, activities: [...(task.activities || []), statusChangeActivity] }; } else { finalTask = task; } if (!['completada', 'cancelada'].includes(finalTask.status)) { allTasksDone = false; } return finalTask; }); const newProjectStatus = allTasksDone && project.status !== 'finalizado' ? 'finalizado' : project.status; if (newProjectStatus === 'finalizado' && project.status !== 'finalizado') { projectName = project.name; projectBecameFinalizado = true; } return { ...project, tasks: updatedTasks, status: newProjectStatus }; }); if (showToast && taskTitle) { toast.success(`Tarea "${taskTitle}" marcada como ${status}.`); } if (projectBecameFinalizado && projectName) { toast.success(`¡Proyecto "${projectName}" completado!`, { icon: '🎉' }); } return updatedProjects; }); };
  const startTask = (projectId, taskId) => { if (activeTask) { toast.error('Ya hay una tarea en ejecución.'); return; } const project = projects.find(p => p.id === projectId); if (project && project.status === 'borrador') setProjectStatus(projectId, 'en-curso'); setTaskStatus(projectId, taskId, 'en desarrollo', false); setActiveTask({ projectId, taskId, startTime: Date.now(), observation: '' }); toast.success('¡Tarea iniciada!'); };
  const pauseTask = () => { if (!activeTask) return; const { projectId, taskId, startTime, observation } = activeTask; addActivity(projectId, taskId, { type: 'sesion', description: `Sesión de trabajo`, fechaInicio: startTime, fechaFin: Date.now(), observation: observation || '' }); setActiveTask(null); toast.success('Progreso guardado.'); };
  const updateActiveTaskObservation = (observation) => { if (activeTask) setActiveTask(prev => ({ ...prev, observation })); };
  const addProject = (name) => { setProjects(prev => { const newProject = { id: Date.now(), createdAt: Date.now(), name, status: 'borrador', contact: '', email: '', description: '', tasks: [], isDefault: prev.length === 0 }; return [...prev, newProject]; }); toast.success(`Proyecto "${name}" creado.`); };
  const setDefaultProject = (projectId) => { setProjects(prev => prev.map(p => ({ ...p, isDefault: p.id === projectId }))); const projectName = projects.find(p => p.id === projectId)?.name; if (projectName) toast.success(`"${projectName}" es ahora el proyecto por defecto.`); };
  const addTask = (projectId, title, estimatedHours, fechaFinEstimada) => { const newTask = { id: Date.now(), title, status: 'backlog', estimatedHours: parseFloat(estimatedHours) || 0, finalHours: null, fechaFinEstimada: fechaFinEstimada || null, fechaFinOficial: null, activities: [] }; setProjects(prev => { const updatedProjects = prev.map(p => p.id === projectId ? { ...p, tasks: [...(p.tasks || []), newTask] } : p); return updatedProjects; }); toast.success(`Tarea "${title}" añadida.`); };
  const setProjectStatus = (projectId, status) => { setProjects(prev => prev.map(p => p.id === projectId ? { ...p, status } : p)); toast.success(`Proyecto marcado como ${status.replace('-', ' ')}.`); };
  const setFinalTaskHours = (projectId, taskId, hours) => { setProjects(prev => prev.map(p => p.id !== projectId ? p : { ...p, tasks: p.tasks.map(t => t.id === taskId ? { ...t, finalHours: hours === null ? null : parseFloat(hours) } : t) })); };
  const setFechaFinOficial = (projectId, taskId, date) => { setProjects(prev => prev.map(p => p.id !== projectId ? p : { ...p, tasks: p.tasks.map(t => t.id === taskId ? { ...t, fechaFinOficial: date ? new Date(date).getTime() : null } : t) })); };
  const editProject = (projectId, updates) => { setProjects(prev => prev.map(p => p.id === projectId ? { ...p, ...updates } : p)); toast.success('Proyecto actualizado.'); };
  const deleteProject = (projectId) => { setProjects(prev => { let newProjects = prev.filter(p => p.id !== projectId); if (newProjects.length > 0 && !newProjects.some(p => p.isDefault)) { newProjects[0].isDefault = true; } return newProjects; }); const projectName = projects.find(p => p.id === projectId)?.name || 'el proyecto'; toast.error(`Se eliminó ${projectName}.`); };
  const editTask = (projectId, taskId, updates) => { setProjects(prev => { const updatedProjects = prev.map(p => p.id !== projectId ? p : { ...p, tasks: p.tasks.map(t => t.id === taskId ? { ...t, ...updates } : t) }); return updatedProjects; }); toast.success('Tarea actualizada.'); };
  const deleteTask = (projectId, taskId) => { setProjects(prev => prev.map(p => p.id === projectId ? { ...p, tasks: p.tasks.filter(t => t.id !== taskId) } : p)); toast.error('Tarea eliminada.'); };
  const editActivity = (projectId, taskId, activityId, updates) => { setProjects(prev => prev.map(p => p.id !== projectId ? p : { ...p, tasks: p.tasks.map(t => t.id !== taskId ? t : { ...t, activities: t.activities.map(a => a.id === activityId ? { ...a, ...updates } : a) }) })); };
  const deleteActivity = (projectId, taskId, activityId) => { setProjects(prev => prev.map(p => p.id !== projectId ? p : { ...p, tasks: p.tasks.map(t => t.id !== taskId ? t : { ...t, activities: t.activities.filter(a => a.id !== activityId) }) })); };
  const moveTask = (projectId, taskId, direction) => { setProjects(prev => prev.map(p => { if (p.id !== projectId) return p; const tasks = [...p.tasks]; const idx = tasks.findIndex(t => t.id === taskId); if (idx === -1) return p; if (direction === 'up' && idx > 0) { [tasks[idx - 1], tasks[idx]] = [tasks[idx], tasks[idx - 1]]; } else if (direction === 'down' && idx < tasks.length - 1) { [tasks[idx], tasks[idx + 1]] = [tasks[idx + 1], tasks[idx]]; } return { ...p, tasks }; })); };
  const reorderTasks = (projectId, startIndex, endIndex) => { setProjects(prevProjects => { const newProjects = [...prevProjects]; const projectIndex = newProjects.findIndex(p => p.id === projectId); if (projectIndex === -1) return prevProjects; const projectToUpdate = { ...newProjects[projectIndex] }; const newTasks = Array.from(projectToUpdate.tasks); const [removed] = newTasks.splice(startIndex, 1); newTasks.splice(endIndex, 0, removed); projectToUpdate.tasks = newTasks; newProjects[projectIndex] = projectToUpdate; return newProjects; }); };
  const refsPorProyecto = useRef({}); const registrarRefProyecto = (projectId, ref) => { refsPorProyecto.current[projectId] = ref; }; const scrollAlProyecto = (projectId) => { const ref = refsPorProyecto.current[projectId]; if (ref?.current) { ref.current.scrollIntoView({ behavior: 'smooth', block: 'start' }); } };

  const contextValue = {
    projects, events, activeTask, addEvent, editEvent, toggleEventCompleted, deleteEvent,
    startTask, pauseTask, updateActiveTaskObservation, addProject, setDefaultProject,
    addTask, addActivity, setProjectStatus, setTaskStatus, setFinalTaskHours, setFechaFinOficial,
    editProject, deleteProject, editTask, deleteTask, editActivity, deleteActivity,
    moveTask, registrarRefProyecto, scrollAlProyecto, refreshData, reorderTasks,
    activeView, setActiveView, isMaximized,
    activeProfile
  };

  return (
    <AppContext.Provider value={contextValue}>
      {isDataLoaded ? children : <div className="min-h-screen bg-slate-900 flex items-center justify-center">Cargando datos del perfil...</div>}
    </AppContext.Provider>
  );
};

export { AppContext };
export default AppContext;