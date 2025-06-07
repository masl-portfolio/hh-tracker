import './App.css'
import { AppProvider } from './context/AppContext'
import ProyectosView from './views/ProyectosView'

function App() {
  return (
    <AppProvider>
      <ProyectosView />
    </AppProvider>
  )
}

export default App
