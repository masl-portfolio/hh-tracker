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
    setProjects([
      ...projects,
      { id: Date.now(), name, tasks: [], isDefault: false }
    ])
  }

  const setDefaultProject = (projectId) => {
    setProjects(projects.map(p => ({
      ...p,
      isDefault: p.id === projectId
    })))
  }

  const addTask = (projectId, title) => {
    setProjects(
      projects.map(p =>
        p.id === projectId
          ? {
              ...p,
              tasks: [
                ...p.tasks,
                { id: Date.now(), title, activities: [], status: 'backlog' }
              ]
            }
          : p
      )
    )
  }

  const addActivity = (projectId, taskId, activity) => {
    setProjects(
      projects.map(p => {
        if (p.id !== projectId) return p
        return {
          ...p,
          tasks: p.tasks.map(t =>
            t.id === taskId
              ? {
                  ...t,
                  activities: [...t.activities, { ...activity, id: Date.now() }]
                }
              : t
          )
        }
      })
    )
  }

  return (
    <AppContext.Provider value={{ projects, addProject, addTask, addActivity, setDefaultProject }}>
      {children}
    </AppContext.Provider>
  )
}

export default AppContext

