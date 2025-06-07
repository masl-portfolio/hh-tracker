import './App.css'
import { useState } from 'react'
import { AppProvider } from './context/AppContext'
import ProyectosView from './views/ProyectosView'
import WidgetView from './views/WidgetView'

function App() {
  const [view, setView] = useState('projects')
  return (
    <AppProvider>
      {view === 'widget' ? (
        <WidgetView onGoMain={() => setView('projects')} />
      ) : (
        <ProyectosView />
      )}
    </AppProvider>
  )
}

export default App
