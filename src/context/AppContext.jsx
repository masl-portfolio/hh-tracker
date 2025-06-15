// src/context/AppContext.js (COMPLETO Y FINAL)

import React, { createContext, useEffect, useState, useRef, useCallback } from 'react';
import toast from 'react-hot-toast';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [projects, setProjects] = useState([]);
  const [events, setEvents] = useState([]);
  const [activeTask, setActiveTask] = useState(null);

  const refsPorProyecto = useRef({});

  const registrarRefProyecto = (projectId, ref) => {
    refsPorProyecto.current[projectId] = ref;
  };

  const scrollAlProyecto = (projectId) => {
    const ref = refsPorProyecto.current[projectId];
    if (ref?.current) {
      ref.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

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

  const refreshData = useCallback(() => {
    const projectsFromStorage = JSON.parse(localStorage.getItem('hh-data')) || [];
    const eventsFromStorage = JSON.parse(localStorage.getItem('hh-events-data')) || [];
    const didUpdate = checkAndGenerateDueEvents(projectsFromStorage, eventsFromStorage);
    
    if (didUpdate) {
      toast.success('Agenda actualizada con nuevos vencimientos.');
    } else {
      toast('Los datos ya están al día.', { icon: '👍' });
    }
  }, [checkAndGenerateDueEvents]);

  useEffect(() => {
    const loadInitialData = () => {
      const initialProjects = JSON.parse(localStorage.getItem('hh-data')) || [];
      const initialEvents = JSON.parse(localStorage.getItem('hh-events-data')) || [];
      checkAndGenerateDueEvents(initialProjects, initialEvents);
      setProjects(initialProjects);
      const savedActiveTask = localStorage.getItem('hh-active-task');
      if (savedActiveTask) try { setActiveTask(JSON.parse(savedActiveTask)); } catch (e) {}
    };
    loadInitialData();
  }, [checkAndGenerateDueEvents]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      refreshData();
    }, 300000); // 5 minutos
    return () => clearInterval(intervalId);
  }, [refreshData]);

  useEffect(() => { if (projects.length > 0) localStorage.setItem('hh-data', JSON.stringify(projects)); }, [projects]);
  useEffect(() => { if (events.length > 0) localStorage.setItem('hh-events-data', JSON.stringify(events)); }, [events]);
  useEffect(() => {
    if (activeTask) localStorage.setItem('hh-active-task', JSON.stringify(activeTask));
    else localStorage.removeItem('hh-active-task');
  }, [activeTask]);
  useEffect(() => {
    const handleStorageChange = (event) => {
      if (event.key === 'hh-data' && event.newValue) try { setProjects(JSON.parse(event.newValue)); } catch (e) {}
      if (event.key === 'hh-events-data' && event.newValue) try { setEvents(JSON.parse(event.newValue)); } catch (e) {}
      if (event.key === 'hh-active-task') try { setActiveTask(event.newValue ? JSON.parse(event.newValue) : null); } catch(e) {}
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const addEvent = (eventData) => {
    const newEvent = { id: Date.now(), createdAt: Date.now(), isCompleted: false, completedAt: null, ...eventData };
    setEvents(prev => [...prev, newEvent]);
    toast.success('Evento añadido a la bitácora.');
  };

  const toggleEventCompleted = (eventId) => {
    let isCompletedNow = false;
    setEvents(prev => prev.map(e => {
      if (e.id === eventId) {
        isCompletedNow = !e.isCompleted;
        return { ...e, isCompleted: isCompletedNow, completedAt: isCompletedNow ? Date.now() : null };
      }
      return e;
    }));
    toast.success(isCompletedNow ? 'Evento completado.' : 'Evento marcado como pendiente.');
  };

  const deleteEvent = (eventId) => {
    setEvents(prev => prev.filter(e => e.id !== eventId));
    toast.error('Evento eliminado.');
  };

  const startTask = (projectId, taskId) => {
    if (activeTask) { toast.error('Ya hay una tarea en ejecución.'); return; }
    setActiveTask({ projectId, taskId, startTime: Date.now(), observation: '' });
    setTaskStatus(projectId, taskId, 'en desarrollo');
    toast.success('¡Tarea iniciada!');
  };

  const pauseTask = () => {
    if (!activeTask) return;
    const { projectId, taskId, startTime, observation } = activeTask;
    addActivity(projectId, taskId, { description: `Sesión de trabajo`, fechaInicio: startTime, fechaFin: Date.now(), observation: observation || '' });
    setActiveTask(null);
    toast.success('Progreso guardado.');
  };

  const updateActiveTaskObservation = (observation) => {
    if (activeTask) setActiveTask(prev => ({ ...prev, observation }));
  };

  const addProject = (name) => {
    const newProject = { id: Date.now(), createdAt: Date.now(), name, contact: '', email: '', description: '', tasks: [], isDefault: projects.length === 0 };
    setProjects(prev => [...prev, newProject]);
    toast.success(`Proyecto "${name}" creado.`);
  };

  const setDefaultProject = (projectId) => {
    setProjects(prev => prev.map(p => ({ ...p, isDefault: p.id === projectId })));
    const projectName = projects.find(p => p.id === projectId)?.name;
    if (projectName) toast.success(`"${projectName}" es ahora el proyecto por defecto.`);
  };

  const addTask = (projectId, title, estimatedHours, fechaFinEstimada) => {
    const newTask = {
      id: Date.now(), title, status: 'backlog', estimatedHours: parseFloat(estimatedHours) || 0,
      finalHours: null, fechaFinEstimada: fechaFinEstimada || null, fechaFinOficial: null, activities: [],
    };
    const newProjects = projects.map(p => p.id === projectId ? { ...p, tasks: [...(p.tasks || []), newTask] } : p);
    setProjects(newProjects);
    checkAndGenerateDueEvents(newProjects, events);
    toast.success(`Tarea "${title}" añadida.`);
  };

  const addActivity = (projectId, taskId, activity) => {
    const newAct = { id: Date.now(), ...activity };
    setProjects(prev => prev.map(p => {
      if (p.id !== projectId) return p;
      return { ...p, tasks: (p.tasks || []).map(t => {
        if (t.id !== taskId) return t;
        const newActivities = [...(t.activities || []), newAct];
        const newFechaFinOficial = (t.fechaFinOficial === null || newAct.fechaFin > t.fechaFinOficial) ? newAct.fechaFin : t.fechaFinOficial;
        return { ...t, activities: newActivities, fechaFinOficial: newFechaFinOficial };
      })};
    }));
  };

  const setTaskStatus = (projectId, taskId, status) => {
    const newProjects = projects.map(p => p.id !== projectId ? p : { ...p, tasks: p.tasks.map(t => t.id === taskId ? { ...t, status } : t) });
    setProjects(newProjects);
    checkAndGenerateDueEvents(newProjects, events);
    toast(`Tarea marcada como ${status}.`);
  };

  const setFinalTaskHours = (projectId, taskId, hours) => {
    setProjects(prev => prev.map(p => p.id !== projectId ? p : { ...p, tasks: p.tasks.map(t => t.id === taskId ? { ...t, finalHours: hours === null ? null : parseFloat(hours) } : t)}));
  };

  const setFechaFinOficial = (projectId, taskId, date) => {
    setProjects(prev => prev.map(p => p.id !== projectId ? p : { ...p, tasks: p.tasks.map(t => t.id === taskId ? { ...t, fechaFinOficial: date ? new Date(date).getTime() : null } : t)}));
  };

  const editProject = (projectId, updates) => {
    setProjects(prev => prev.map(p => p.id === projectId ? { ...p, ...updates } : p));
    toast.success('Proyecto actualizado.');
  };

  const deleteProject = (projectId) => {
    const projectName = projects.find(p => p.id === projectId)?.name || 'el proyecto';
    let newProjects = projects.filter(p => p.id !== projectId);
    if (!newProjects.find(p => p.isDefault) && newProjects.length > 0) {
      newProjects[0].isDefault = true;
    }
    setProjects(newProjects);
    toast.error(`Se eliminó ${projectName}.`);
  };

  const editTask = (projectId, taskId, updates) => {
    const newProjects = projects.map(p => p.id !== projectId ? p : { ...p, tasks: p.tasks.map(t => t.id === taskId ? { ...t, ...updates } : t)});
    setProjects(newProjects);
    checkAndGenerateDueEvents(newProjects, events);
    toast.success('Tarea actualizada.');
  };

  const deleteTask = (projectId, taskId) => {
    setProjects(prev => prev.map(p => p.id === projectId ? { ...p, tasks: p.tasks.filter(t => t.id !== taskId) } : p));
    toast.error('Tarea eliminada.');
  };

  const editActivity = (projectId, taskId, activityId, updates) => {
    setProjects(prev => prev.map(p => p.id !== projectId ? p : { ...p, tasks: p.tasks.map(t => t.id !== taskId ? t : { ...t, activities: t.activities.map(a => a.id === activityId ? { ...a, ...updates } : a)})}));
  };

  const deleteActivity = (projectId, taskId, activityId) => {
    setProjects(prev => prev.map(p => p.id !== projectId ? p : { ...p, tasks: p.tasks.map(t => t.id !== taskId ? t : { ...t, activities: t.activities.filter(a => a.id !== activityId)})}));
  };

  const moveTask = (projectId, taskId, direction) => {
    setProjects(prev => prev.map(p => {
      if (p.id !== projectId) return p;
      const tasks = [...p.tasks];
      const idx = tasks.findIndex(t => t.id === taskId);
      if (idx === -1) return p;
      if (direction === 'up' && idx > 0) [tasks[idx - 1], tasks[idx]] = [tasks[idx], tasks[idx - 1]];
      else if (direction === 'down' && idx < tasks.length - 1) [tasks[idx], tasks[idx + 1]] = [tasks[idx + 1], tasks[idx]];
      return { ...p, tasks };
    }));
  };

  return (
    <AppContext.Provider value={{
      projects, events, activeTask, addEvent, toggleEventCompleted, deleteEvent,
      startTask, pauseTask, updateActiveTaskObservation, addProject, setDefaultProject,
      addTask, addActivity, setTaskStatus, setFinalTaskHours, setFechaFinOficial,
      editProject, deleteProject, editTask, deleteTask, editActivity, deleteActivity,
      moveTask, registrarRefProyecto, scrollAlProyecto, refreshData
    }}>
      {children}
    </AppContext.Provider>
  );
};

export default AppContext;