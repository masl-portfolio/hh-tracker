import React, { useState, useEffect, useContext } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { Toaster, toast } from 'react-hot-toast';

// Vistas y Componentes
import OnboardingView from './views/OnboardingView';
import ProfileSelectorView from './views/ProfileSelectorView';
import ProfileManagementView from './views/ProfileManagementView';
import Header from './components/Header';
import DashboardView from './views/DashboardView';
import ProyectosView from './views/ProyectosView';
import BitacoraView from './views/BitacoraView';
import ResumenDiarioView from './views/ResumenDiarioView';
// ----- CAMBIO CLAVE: AÑADIR LA IMPORTACIÓN QUE FALTABA -----
import ProyectoDetalleView from './views/ProyectoDetalleView'; 

import { FiAlertCircle, FiCheckCircle, FiInfo, FiX } from 'react-icons/fi';

// Layout para la aplicación principal una vez que el perfil está cargado
const MainLayout = () => {
  return (
    <div className="h-screen w-screen flex flex-col bg-[#030712] text-white animated-gradient-background">
      <Header />
      <main className="flex-1 min-h-0">
        <Routes>
          <Route path="/profiles" element={<ProfileManagementView />} /> 
          <Route path="/dashboard" element={<DashboardView />} />
          <Route path="/proyectos" element={<ProyectosView />} />
          <Route path="/proyectos/:projectId" element={<ProyectoDetalleView />} />
          <Route path="/bitacora" element={<BitacoraView />} />
          <Route path="/resumen" element={<ResumenDiarioView />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </main>
    </div>
  );
};

// Componente raíz que maneja el flujo de autenticación/configuración
function App() {
  const [configState, setConfigState] = useState({ status: 'loading', config: null });

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const config = await window.electronAPI.getConfig();
        if (!config || !config.profiles || config.profiles.length === 0) {
          setConfigState({ status: 'needsOnboarding', config: null });
        } else if (!config.lastUsedProfile || !config.profiles.find(p => p.id === config.lastUsedProfile)) {
          setConfigState({ status: 'needsProfileSelection', config: config });
        } else {
          const activeProfile = config.profiles.find(p => p.id === config.lastUsedProfile);
          setConfigState({ status: 'ready', config: { ...config, activeProfile } });
        }
      } catch (error) {
        console.error("Error al obtener la configuración:", error);
        setConfigState({ status: 'error', config: null });
      }
    };
    fetchConfig();
  }, []);

  const renderContent = () => {
    switch (configState.status) {
      case 'loading':
        return <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">Cargando configuración...</div>;
      case 'needsOnboarding':
        return <Navigate to="/onboarding" replace />;
      case 'needsProfileSelection':
        return <ProfileSelectorView profiles={configState.config.profiles} />;
      case 'ready':
        return (
          <AppProvider activeProfile={configState.config.activeProfile}>
            <MainLayout />
          </AppProvider>
        );
      case 'error':
        return <div className="min-h-screen bg-slate-900 text-red-500 flex items-center justify-center">Error al cargar la aplicación.</div>;
      default:
        return null;
    }
  };

  return (
    <>
      <Toaster position="top-right" gutter={8}>
        {(t) => (
          <div className={`flex items-center gap-3 w-full max-w-sm bg-slate-800/80 backdrop-blur-lg border border-slate-700 text-white text-sm font-medium px-4 py-3 rounded-lg shadow-2xl transition-all duration-300 ${t.visible ? 'animate-fade-in-fast' : 'opacity-0 scale-90 translate-x-8'}`}>
            <div className="flex-shrink-0">
              {t.type === 'success' && <FiCheckCircle className="text-green-500" size={20} />}
              {t.type === 'error' && <FiAlertCircle className="text-red-500" size={20} />}
              {t.type !== 'success' && t.type !== 'error' && t.type !== 'loading' && (t.icon || <FiInfo className="text-blue-500" size={20} />)}
            </div>
            <div className="flex-grow">{t.message}</div>
            {t.type !== 'loading' && <button onClick={() => toast.dismiss(t.id)} className="p-1 rounded-full text-slate-500 hover:text-white hover:bg-slate-700/50 flex-shrink-0"><FiX size={16} /></button>}
          </div>
        )}
      </Toaster>
      
      <HashRouter>
        <Routes>
          <Route path="/onboarding" element={<OnboardingView />} />
          <Route path="*" element={renderContent()} />
        </Routes>
      </HashRouter>
    </>
  );
}

export default App;