import './App.css'
import { useState, useLayoutEffect } from 'react'
import { AppProvider } from './context/AppContext'
import ProyectosView from './views/ProyectosView'
import WidgetView from './views/WidgetView'

function App() {
  const [view, setView] = useState('widget')

  useLayoutEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash
      if (hash.includes('proyectos')) {
        setView('projects')
      } else {
        setView('widget')
      }
    }

    handleHashChange() // ejecuta una vez al cargar
    window.addEventListener('hashchange', handleHashChange)

    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  return (
    <AppProvider>
      {view === 'projects' ? <ProyectosView /> : <WidgetView />}
    </AppProvider>
  )
}

export default App
