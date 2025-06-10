import React, { createContext, useEffect, useState } from 'react';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [projects, setProjects] = useState([]);
  const [activeTask, setActiveTask] = useState(null);

  // --- EFECTOS DE CARGA Y GUARDADO ---
  useEffect(() => {
    // Cargar proyectos
    const storedProjects = localStorage.getItem('hh-data');
    if (storedProjects) {
      try {
        const parsed = JSON.parse(storedProjects);
        setProjects(parsed);
      } catch (e) {
        console.error('Fallo al parsear proyectos desde localStorage', e);
      }
    } else {
      fetch('/seedData.json')
        .then(res => res.json())
        .then(data => setProjects(data.projects || []))
        .catch(e => console.error('Fallo al cargar seedData.json', e));
    }
    // Cargar tarea activa
    const savedActiveTask = localStorage.getItem('hh-active-task');
    if (savedActiveTask) {
      try {
        setActiveTask(JSON.parse(savedActiveTask));
      } catch (e) {
        localStorage.removeItem('hh-active-task');
      }
    }
  }, []);

  useEffect(() => {
    if (projects.length > 0) {
      localStorage.setItem('hh-data', JSON.stringify(projects));
    }
  }, [projects]);

  useEffect(() => {
    if (activeTask) {
      localStorage.setItem('hh-active-task', JSON.stringify(activeTask));
    } else {
      localStorage.removeItem('hh-active-task');
    }
  }, [activeTask]);

  useEffect(() => {
    const handleStorageChange = (event) => {
      if (event.key === 'hh-data' && event.newValue) {
        try { setProjects(JSON.parse(event.newValue)); } catch (e) {}
      }
      if (event.key === 'hh-active-task') {
        try { setActiveTask(event.newValue ? JSON.parse(event.newValue) : null); } catch(e) {}
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // --- FUNCIONES DEL TEMPORIZADOR ---
  const startTask = (projectId, taskId) => {
    if (activeTask) {
      alert('Ya hay una tarea en ejecución. Debes pausarla primero.');
      return;
    }
    // Añadimos 'observation' al iniciar la tarea
    setActiveTask({ projectId, taskId, startTime: Date.now(), observation: '' });
    setTaskStatus(projectId, taskId, 'en desarrollo');
  };

  const pauseTask = () => {
    if (!activeTask) return;
    // Leemos 'observation' del estado activo para guardarlo
    const { projectId, taskId, startTime, observation } = activeTask;
    const newActivity = {
      description: `Sesión de trabajo`,
      fechaInicio: startTime,
      fechaFin: Date.now(),
      observation: observation || '', // Guardamos la observación
    };
    addActivity(projectId, taskId, newActivity);
    setActiveTask(null);
  };

  // Nueva función para actualizar el comentario de la tarea activa
  const updateActiveTaskObservation = (observation) => {
    if (activeTask) {
      setActiveTask(prev => ({ ...prev, observation }));
    }
  };

  // --- FUNCIONES CRUD (COMPLETAS) ---
  const addProject = (name) => {
    const newProject = {
      id: Date.now(),
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

  const addTask = (projectId, title, estimatedHours) => {
    const newTask = {
      id: Date.now(),
      title,
      status: 'backlog',
      estimatedHours: parseFloat(estimatedHours) || 0,
      activities: [],
    };
    setProjects(prev => prev.map(p => p.id === projectId ? { ...p, tasks: [...p.tasks, newTask] } : p));
  };

  const addActivity = (projectId, taskId, activity) => {
    const newAct = { id: Date.now(), ...activity };
    setProjects(prev => prev.map(p =>
      p.id === projectId
        ? { ...p, tasks: p.tasks.map(t =>
            t.id === taskId ? { ...t, activities: [...(t.activities || []), newAct] } : t
          )}
        : p
    ));
  };

  const setTaskStatus = (projectId, taskId, status) => {
    setProjects(prev => prev.map(p =>
      p.id !== projectId ? p : { ...p, tasks: p.tasks.map(t =>
        t.id === taskId ? { ...t, status } : t
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
      newProjects[0].isDefault = true;
    }
    setProjects(newProjects);
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
      activeTask,
      startTask,
      pauseTask,
      updateActiveTaskObservation,
      addProject,
      setDefaultProject,
      addTask,
      addActivity,
      setTaskStatus,
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