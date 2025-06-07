import React, { createContext, useEffect, useState } from 'react'

const AppContext = createContext()

export const AppProvider = ({ children }) => {
  const [projects, setProjects] = useState([])

  useEffect(() => {
    const stored = localStorage.getItem('hh-data')
    if (stored) {
      setProjects(JSON.parse(stored))
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('hh-data', JSON.stringify(projects))
  }, [projects])

  const addProject = (name) => {
    const newProject = {
      id: Date.now(),
      name,
      tasks: [],
      isDefault: projects.length === 0,
    }
    setProjects([...projects, newProject])
  }

  const setDefaultProject = (projectId) => {
    setProjects(projects.map(p => ({ ...p, isDefault: p.id === projectId })))
  }

  const addTask = (projectId, title) => {
    setProjects(
      projects.map(p =>
        p.id === projectId
          ? {
              ...p,
              tasks: [
                ...p.tasks,
                { id: Date.now(), title, status: 'backlog' },
              ],
            }
          : p
      )
    )
  }

  const setTaskStatus = (projectId, taskId, status) => {
    setProjects(
      projects.map(p => {
        if (p.id !== projectId) return p
        return {
          ...p,
          tasks: p.tasks.map(t =>
            t.id === taskId ? { ...t, status } : t
          ),
        }
      })
    )
  }


  return (
    <AppContext.Provider value={{
      projects,
      addProject,
      addTask,
      setTaskStatus,
      setDefaultProject,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export default AppContext

