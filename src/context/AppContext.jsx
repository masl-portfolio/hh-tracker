import React, { createContext, useEffect, useState } from 'react';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [projects, setProjects] = useState([]);
  const [events, setEvents] = useState([]);
  const [activeTask, setActiveTask] = useState(null);

  // --- LÓGICA DE AUTOMATIZACIÓN ---
  const generarAvisosDeVencimiento = (tasks, currentEvents) => {
    const newAvisos = [];
    const unaSemanaEnMs = 7 * 24 * 60 * 60 * 1000;
    const ahora = Date.now();

    const todasLasTareas = tasks.flatMap(p => 
        (p.tasks || []).map(t => ({...t, projectId: p.id}))
    );

    todasLasTareas.forEach(task => {
      const idAviso = `aviso-tarea-${task.id}`;
      const avisoYaExiste = currentEvents.some(e => e.id === idAviso);
      
      if (task.fechaFinEstimada && !avisoYaExiste && task.status !== 'completada' && task.status !== 'cancelada') {
        const tiempoRestante = new Date(task.fechaFinEstimada).getTime() - ahora;
        
        if (tiempoRestante > 0 && tiempoRestante <= unaSemanaEnMs) {
          newAvisos.push({
            id: idAviso,
            createdAt: ahora,
            type: 'aviso',
            isSystemGenerated: true,
            title: `Vencimiento: ${task.title}`,
            details: `Fecha de entrega estimada: ${new Date(task.fechaFinEstimada).toLocaleDateString()}`,
            isCompleted: false,
            completedAt: null,
            projectId: task.projectId,
            taskId: task.id
          });
        }
      }
    });
    return newAvisos;
  };

  // --- EFECTOS DE CARGA Y GUARDADO ---
  useEffect(() => {
    const loadInitialData = async () => {
      let initialProjects = [];
      let initialEvents = [];

      try {
        const storedProjects = localStorage.getItem('hh-data');
        if (storedProjects) initialProjects = JSON.parse(storedProjects);
        else {
          const res = await fetch('/seedData.json');
          const data = await res.json();
          initialProjects = data.projects || [];
        }
      } catch (e) { console.error('Fallo al cargar proyectos', e); }

      try {
        const storedEvents = localStorage.getItem('hh-events-data');
        if (storedEvents) initialEvents = JSON.parse(storedEvents);
        else {
           const res = await fetch('/seedData.json');
           const data = await res.json();
           initialEvents = data.events || [];
        }
      } catch (e) { console.error('Fallo al cargar eventos', e); }

      // Generar avisos al cargar y asegurarse de no duplicar
      const avisos = generarAvisosDeVencimiento(initialProjects, initialEvents);
      const uniqueEvents = [...initialEvents, ...avisos.filter(aviso => !initialEvents.some(ev => ev.id === aviso.id))];
      
      setProjects(initialProjects);
      setEvents(uniqueEvents);

      const savedActiveTask = localStorage.getItem('hh-active-task');
      if (savedActiveTask) try { setActiveTask(JSON.parse(savedActiveTask)); } catch (e) {}
    };

    loadInitialData();
  }, []);

  useEffect(() => {
    if (projects.length > 0) localStorage.setItem('hh-data', JSON.stringify(projects));
  }, [projects]);
  
  useEffect(() => {
    // Permite guardar un array vacío para borrar todos los eventos
    if (events) localStorage.setItem('hh-events-data', JSON.stringify(events));
  }, [events]);

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

  // --- FUNCIONES CRUD PARA EVENTOS ---
  const addEvent = (eventData) => {
    const newEvent = { id: Date.now(), createdAt: Date.now(), isCompleted: false, completedAt: null, ...eventData };
    setEvents(prev => [...prev, newEvent]);
  };
  
  const toggleEventCompleted = (eventId) => {
    setEvents(prev => prev.map(e => 
      e.id === eventId ? { ...e, isCompleted: !e.isCompleted, completedAt: !e.isCompleted ? Date.now() : null } : e
    ));
  };

  const deleteEvent = (eventId) => {
    setEvents(prev => prev.filter(e => e.id !== eventId));
  };
  
  // --- FUNCIONES DEL TEMPORIZADOR Y TAREAS ---
  const startTask = (projectId, taskId) => {
    if (activeTask) {
      alert('Ya hay una tarea en ejecución. Debes pausarla primero.');
      return;
    }
    setActiveTask({ projectId, taskId, startTime: Date.now(), observation: '' });
    setTaskStatus(projectId, taskId, 'en desarrollo');
  };

  const pauseTask = () => {
    if (!activeTask) return;
    const { projectId, taskId, startTime, observation } = activeTask;
    const newActivity = {
      description: `Sesión de trabajo`,
      fechaInicio: startTime,
      fechaFin: Date.now(),
      observation: observation || '',
    };
    addActivity(projectId, taskId, newActivity);
    setActiveTask(null);
  };

  const updateActiveTaskObservation = (observation) => {
    if (activeTask) {
      setActiveTask(prev => ({ ...prev, observation }));
    }
  };

  const addProject = (name) => {
    const newProject = {
      id: Date.now(),
      createdAt: Date.now(),
      name,
      contact: '',
      email: '',
      description: '',
      tasks: [],
      isDefault: projects.length === 0,
    };
    setProjects(prev => [...prev, newProject]);
  };

  const setDefaultProject = (projectId) => {
    setProjects(prev => prev.map(p => ({ ...p, isDefault: p.id === projectId })));
  };

  const addTask = (projectId, title, estimatedHours, fechaFinEstimada) => {
    const newTask = {
      id: Date.now(),
      title,
      status: 'backlog',
      estimatedHours: parseFloat(estimatedHours) || 0,
      finalHours: null,
      fechaFinEstimada: fechaFinEstimada || null,
      fechaFinOficial: null,
      activities: [],
    };
    setProjects(prev => prev.map(p => p.id === projectId ? { ...p, tasks: [...p.tasks, newTask] } : p));
  };

  const addActivity = (projectId, taskId, activity) => {
    const newAct = { id: Date.now(), ...activity };
    setProjects(prevProjects => {
      return prevProjects.map(p => {
        if (p.id !== projectId) return p;
        const updatedTasks = p.tasks.map(t => {
          if (t.id !== taskId) return t;
          const newActivities = [...(t.activities || []), newAct];
          const newFechaFinOficial = (t.fechaFinOficial === null || newAct.fechaFin > t.fechaFinOficial) ? newAct.fechaFin : t.fechaFinOficial;
          return { ...t, activities: newActivities, fechaFinOficial: newFechaFinOficial };
        });
        return { ...p, tasks: updatedTasks };
      });
    });
  };
  
  // MODIFICADO: Ahora sincroniza el aviso de vencimiento
  const setTaskStatus = (projectId, taskId, status) => {
    setProjects(prev => prev.map(p =>
      p.id !== projectId ? p : { ...p, tasks: p.tasks.map(t =>
        t.id === taskId ? { ...t, status } : t
      )}
    ));

    // Si la tarea se completa o cancela, buscamos su aviso y lo completamos también
    if (status === 'completada' || status === 'cancelada') {
      const idAviso = `aviso-tarea-${taskId}`;
      setEvents(currentEvents => currentEvents.map(e => 
        e.id === idAviso && !e.isCompleted ? { ...e, isCompleted: true, completedAt: Date.now() } : e
      ));
    }
  };

  const setFinalTaskHours = (projectId, taskId, hours) => {
    setProjects(prev => prev.map(p => 
      p.id !== projectId ? p : { ...p, tasks: p.tasks.map(t => 
        t.id === taskId ? { ...t, finalHours: hours === null ? null : parseFloat(hours) } : t
      )}
    ));
  };

  const setFechaFinOficial = (projectId, taskId, date) => {
    setProjects(prev => prev.map(p =>
      p.id !== projectId ? p : { ...p, tasks: p.tasks.map(t =>
        t.id === taskId ? { ...t, fechaFinOficial: date ? new Date(date).getTime() : null } : t
      )}
    ));
  };

  const editProject = (projectId, updates) => {
    setProjects(prev => prev.map(p => p.id === projectId ? { ...p, ...updates } : p));
  };

  const deleteProject = (projectId) => {
    let newProjects = projects.filter(p => p.id !== projectId);
    const wasDefaultDeleted = !newProjects.find(p => p.isDefault);
    if (wasDefaultDeleted && newProjects.length > 0) {
      const sortedRemaining = newProjects.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      sortedRemaining[0].isDefault = true;
      setProjects(sortedRemaining);
    } else {
      setProjects(newProjects);
    }
  };

  const editTask = (projectId, taskId, updates) => {
    setProjects(prev => prev.map(p =>
      p.id !== projectId ? p : { ...p, tasks: p.tasks.map(t =>
        t.id === taskId ? { ...t, ...updates } : t
      )}
    ));
  };

  const deleteTask = (projectId, taskId) => {
    setProjects(prev => prev.map(p =>
      p.id === projectId ? { ...p, tasks: p.tasks.filter(t => t.id !== taskId) } : p
    ));
  };

  const editActivity = (projectId, taskId, activityId, updates) => {
    setProjects(prev => prev.map(p =>
      p.id !== projectId ? p : { ...p, tasks: p.tasks.map(t =>
        t.id !== taskId ? t : { ...t, activities: t.activities.map(a =>
          a.id === activityId ? { ...a, ...updates } : a
        )}
      )}
    ));
  };

  const deleteActivity = (projectId, taskId, activityId) => {
    setProjects(prev => prev.map(p =>
      p.id !== projectId ? p : { ...p, tasks: p.tasks.map(t =>
        t.id !== taskId ? t : { ...t, activities: t.activities.filter(a => a.id !== activityId) }
      )}
    ));
  };

  const moveTask = (projectId, taskId, direction) => {
    setProjects(prev => prev.map(p => {
      if (p.id !== projectId) return p;
      const idx = p.tasks.findIndex(t => t.id === taskId);
      if (idx === -1) return p;
      const tasks = [...p.tasks];
      if (direction === 'up' && idx > 0) {
        [tasks[idx - 1], tasks[idx]] = [tasks[idx], tasks[idx - 1]];
      } else if (direction === 'down' && idx < tasks.length - 1) {
        [tasks[idx], tasks[idx + 1]] = [tasks[idx + 1], tasks[idx]];
      }
      return { ...p, tasks };
    }));
  };

  return (
    <AppContext.Provider value={{
      projects,
      events,
      activeTask,
      addEvent,
      toggleEventCompleted,
      deleteEvent,
      startTask,
      pauseTask,
      updateActiveTaskObservation,
      addProject,
      setDefaultProject,
      addTask,
      addActivity,
      setTaskStatus,
      setFinalTaskHours,
      setFechaFinOficial,
      editProject,
      deleteProject,
      editTask,
      deleteTask,
      editActivity,
      deleteActivity,
      moveTask,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export default AppContext;