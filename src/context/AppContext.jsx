import React, { createContext, useEffect, useState } from 'react'

const AppContext = createContext()

export const AppProvider = ({ children }) => {
  const [projects, setProjects] = useState([])

  useEffect(() => {
    const stored = localStorage.getItem('hh-data')
    if (stored) {
      const parsed = JSON.parse(stored)
      const normalized = parsed.map(p => ({
        ...p,
        tasks: p.tasks.map(t => ({
          ...t,
          activities: t.activities || [],
          estimatedHours: t.estimatedHours || 0,
        })),
      }))
      setProjects(normalized)
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

  const addTask = (projectId, title, estimatedHours) => {
    setProjects(
      projects.map(p =>
        p.id === projectId
          ? {
              ...p,
              tasks: [
                ...p.tasks,
                {
                  id: Date.now(),
                  title,
                  status: 'backlog',
                  estimatedHours: parseFloat(estimatedHours) || 0,
                  activities: [],
                },
              ],
            }
          : p
      )
    )
  }

  const addActivity = (projectId, taskId, activity) => {
    const newAct = { id: Date.now(), ...activity }
    setProjects(
      projects.map(p =>
        p.id === projectId
          ? {
              ...p,
              tasks: p.tasks.map(t =>
                t.id === taskId
                  ? { ...t, activities: [...(t.activities || []), newAct] }
                  : t
              ),
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
      addActivity,
      setTaskStatus,
      setDefaultProject,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export default AppContext

