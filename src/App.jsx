import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';

// Vistas y Componentes
import DashboardView from './views/DashboardView';
import ProyectosView from './views/ProyectosView';
import WidgetView from './views/WidgetView';
import Header from './components/Header';

/**
 * Componente de Layout principal que envuelve el Dashboard
 * y siempre muestra el Header.
 */
const DashboardLayout = ({ children }) => {
  return (
    <div className="min-h-screen animated-gradient-background text-white font-sans flex flex-col">
      <Header />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
};

function App() {
  const currentPath = window.location.hash;

  // Renderizado específico para la ventana secundaria de Proyectos
  if (currentPath.startsWith('#/proyectos')) {
    return (
      <AppProvider>
        <ProyectosView />
      </AppProvider>
    );
  }

  // Si estás usando una ventana separada para el widget, esta lógica se mantiene.
  // Si tu "widget" ahora es la ventana principal, esta parte es para debug.
  if (currentPath.startsWith('#/widget')) {
      return (
          <AppProvider>
              <WidgetView />
          </AppProvider>
      );
  }

  // Flujo principal para la ventana del dashboard
  return (
    <AppProvider>
      <HashRouter>
        <Routes>
          <Route 
            path="/" 
            element={
              <DashboardLayout>
                <DashboardView />
              </DashboardLayout>
            } 
          />
          {/* La ruta de proyectos sigue disponible para la ventana separada */}
          <Route path="/proyectos" element={<ProyectosView />} />
        </Routes>
      </HashRouter>
    </AppProvider>
  );
}

export default App;