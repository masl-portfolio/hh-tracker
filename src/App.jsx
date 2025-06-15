// src/App.jsx (COMPLETO Y FINAL)

import React from 'react';
import { HashRouter, Routes, Route, Outlet } from 'react-router-dom';
import { AppProvider } from './context/AppContext';

// Importamos Toaster y el hook useToasterStore para animaciones de salida
import { Toaster, toast } from 'react-hot-toast';

// Vistas y Componentes
import Header from './components/Header';
import DashboardView from './views/DashboardView';
import ProyectosView from './views/ProyectosView';
import { FiAlertCircle, FiCheckCircle, FiInfo, FiX } from 'react-icons/fi';

/**
 * Componente que define el layout principal de la aplicación,
 * incluyendo el Header y el área de contenido.
 */
const MainLayout = () => {
  return (
    <div className="h-screen w-screen flex flex-col bg-[#030712] text-white animated-gradient-background">
      <Header />
      <main className="flex-1 min-h-0">
        <Outlet />
      </main>
    </div>
  );
};

/**
 * Componente principal de la aplicación que configura el proveedor de contexto,
 * el sistema de notificaciones y las rutas.
 */
function App() {
  return (
    <AppProvider>
      {/* --- CONFIGURACIÓN DE NOTIFICACIONES PERSONALIZADAS --- */}
      <Toaster
        position="top-right" // Posición en la esquina superior derecha
        gutter={8} // Espacio entre notificaciones
      >
        {(t) => (
          // El componente ToastBar nos da el estado (visible/oculto) y los estilos base
          <div
            className={`
              flex items-center gap-3 w-full max-w-sm
              bg-slate-800/80 backdrop-blur-lg border border-slate-700
              text-white text-sm font-medium
              px-4 py-3 rounded-lg shadow-2xl
              transition-all duration-300
              ${t.visible ? 'animate-fade-in-fast' : 'opacity-0 scale-90 translate-x-8'}
            `}
          >
            {/* Ícono dinámico según el tipo de toast */}
            <div className="flex-shrink-0">
              {t.type === 'success' && <FiCheckCircle className="text-green-500" size={20} />}
              {t.type === 'error' && <FiAlertCircle className="text-red-500" size={20} />}
              {t.type === 'loading' && <div>...</div>}
              {t.type !== 'success' && t.type !== 'error' && t.type !== 'loading' && (
                t.icon || <FiInfo className="text-blue-500" size={20} />
              )}
            </div>
            
            {/* Mensaje del toast */}
            <div className="flex-grow">
              {t.message}
            </div>
            
            {/* Botón de cierre */}
            {t.type !== 'loading' && (
              <button
                onClick={() => toast.dismiss(t.id)}
                className="p-1 rounded-full text-slate-500 hover:text-white hover:bg-slate-700/50 flex-shrink-0"
              >
                <FiX size={16} />
              </button>
            )}
          </div>
        )}
      </Toaster>
      
      <HashRouter>
        <Routes>
          <Route element={<MainLayout />}>
            <Route path="/" element={<DashboardView />} />
          </Route>
          <Route path="/proyectos" element={<ProyectosView />} />
        </Routes>
      </HashRouter>
    </AppProvider>
  );
}

export default App;