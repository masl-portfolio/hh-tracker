import './App.css'
import { useState, useEffect } from 'react'
import { AppProvider } from './context/AppContext'
import ProyectosView from './views/ProyectosView'
import WidgetView from './views/WidgetView'

function App() {
  const [view, setView] = useState(() => {
    const qsView = new URLSearchParams(window.location.search).get('view')
    return qsView === 'projects' ? 'projects' : 'widget'
  })

  useEffect(() => {
    const url = new URL(window.location)
    url.searchParams.set('view', view)
    window.history.replaceState({}, '', url)
  }, [view])
  return (
    <AppProvider>
      {view === 'widget' ? (
        <WidgetView
          onGoMain={() => setView('projects')}
          onOpenProjects={() => window.open('?view=projects', '_blank')}
        />
      ) : (
        <ProyectosView />
      )}
    </AppProvider>
  )
}

export default App
