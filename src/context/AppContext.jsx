import React, { createContext, useEffect, useState } from 'react'
import seedData from '../seedData.json'

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
    } else {
      setProjects(seedData.projects)
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

  const editProject = (projectId, name) => {
    setProjects(projects.map(p => (p.id === projectId ? { ...p, name } : p)))
  }

  const deleteProject = (projectId) => {
    setProjects(projects.filter(p => p.id !== projectId))
  }

  const editTask = (projectId, taskId, updates) => {
    setProjects(
      projects.map(p =>
        p.id === projectId
          ? {
              ...p,
              tasks: p.tasks.map(t =>
                t.id === taskId ? { ...t, ...updates } : t
              ),
            }
          : p
      )
    )
  }

  const deleteTask = (projectId, taskId) => {
    setProjects(
      projects.map(p =>
        p.id === projectId
          ? { ...p, tasks: p.tasks.filter(t => t.id !== taskId) }
          : p
      )
    )
  }

  const editActivity = (projectId, taskId, activityId, updates) => {
    setProjects(
      projects.map(p =>
        p.id === projectId
          ? {
              ...p,
              tasks: p.tasks.map(t =>
                t.id === taskId
                  ? {
                      ...t,
                      activities: t.activities.map(a =>
                        a.id === activityId ? { ...a, ...updates } : a
                      ),
                    }
                  : t
              ),
            }
          : p
      )
    )
  }

  const deleteActivity = (projectId, taskId, activityId) => {
    setProjects(
      projects.map(p =>
        p.id === projectId
          ? {
              ...p,
              tasks: p.tasks.map(t =>
                t.id === taskId
                  ? {
                      ...t,
                      activities: t.activities.filter(a => a.id !== activityId),
                    }
                  : t
              ),
            }
          : p
      )
    )
  }

  const moveTask = (projectId, taskId, direction) => {
    setProjects(
      projects.map(p => {
        if (p.id !== projectId) return p
        const idx = p.tasks.findIndex(t => t.id === taskId)
        if (idx === -1) return p
        const tasks = [...p.tasks]
        if (direction === 'up' && idx > 0) {
          ;[tasks[idx - 1], tasks[idx]] = [tasks[idx], tasks[idx - 1]]
        } else if (direction === 'down' && idx < tasks.length - 1) {
          ;[tasks[idx], tasks[idx + 1]] = [tasks[idx + 1], tasks[idx]]
        }
        return { ...p, tasks }
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
  )
}

export default AppContext

