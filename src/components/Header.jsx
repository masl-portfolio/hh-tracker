import React, { useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  FiFolder, FiPower, FiMinus, FiRefreshCw, FiBookOpen,
  FiClipboard, FiMaximize2, FiMinimize2, FiTarget, FiUser
} from 'react-icons/fi';
import { motion, LayoutGroup } from 'framer-motion';
import AppContext from '../context/AppContext';

const views = [
  { id: 'foco', path: '/dashboard', label: 'Foco de atención', icon: FiTarget },

  { id: 'proyectos', path: '/proyectos', label: 'Proyectos', icon: FiFolder },
  { id: 'bitacora', path: '/bitacora', label: 'Bitácora', icon: FiBookOpen },
  { id: 'resumen', path: '/resumen', label: 'Resumen Diario', icon: FiClipboard },

];

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { activeTask, pauseTask, refreshData, isMaximized, activeProfile } = useContext(AppContext);

  const handleMinimize = () => window.electronAPI.minimizeWindow();
  const handleCloseApp = () => {
    if (activeTask) pauseTask();
    setTimeout(() => window.electronAPI.closeApp(), 150);
  };
  const handleViewChange = (view) => navigate(view.path);
  const handleMaximizeToggle = () => {
    if (isMaximized) {
      window.electronAPI.restoreWindow();
    } else {
      window.electronAPI.maximizeWindow();
    }
  };

  return (
    <header className="w-full h-14 px-4 flex items-center justify-between drag-area select-none bg-slate-900/60 backdrop-blur-sm border-b border-white/5">
      {/* Perfil / izquierda */}
      <div className="w-1/3 flex justify-start items-center">
        <button
          onClick={() => navigate('/profiles')}
          className="flex items-center gap-2 p-2 rounded-lg hover:bg-black/20 transition-colors no-drag"
          title="Gestionar Perfiles"
        >
          <div className="p-1.5 bg-slate-700 rounded-full">
            <FiUser size={16} className="text-slate-300" />
          </div>
          <span className="text-sm font-semibold text-white">
            {activeProfile?.name || 'Perfil'}
          </span>
        </button>
      </div>

      {/* Navegación / centro */}
      <div className="w-1/3 flex justify-center items-center">
        <div className="flex items-center p-1 bg-black/20 rounded-lg space-x-1 no-drag">
          <LayoutGroup>
            {views.map((view) => {
              const isActive = location.pathname.startsWith(view.path);
              const Icon = view.icon;
              return (
                <motion.button
                  key={view.id}
                  onClick={() => handleViewChange(view)}
                  className="relative flex items-center justify-center h-8 rounded-md font-medium"
                  title={`Ver ${view.label}`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="active-nav-background"
                      className="absolute inset-0 bg-slate-700/80 shadow-md rounded-md"
                      transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                    />
                  )}
                  <div className="relative z-10 flex items-center px-3">
                    <Icon
                      size={15}
                      className={`transition-colors duration-200 ${isActive ? 'text-sky-400' : 'text-zinc-400 hover:text-white'
                        }`}
                    />
                    {isActive && (
                      <motion.span
                        initial={{ opacity: 0, x: -5 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1, duration: 0.2 }}
                        className="ml-2 text-sm text-white whitespace-nowrap"
                      >
                        {view.label}
                      </motion.span>
                    )}
                  </div>
                </motion.button>
              );
            })}
          </LayoutGroup>
        </div>
      </div>

      {/* Botones de ventana / derecha */}
      <div className="w-1/3 flex justify-end items-center gap-1">
        <button
          onClick={refreshData}
          className="p-2 text-zinc-400 rounded-md hover:bg-black/40 hover:text-white transition-colors no-drag"
          title="Refrescar datos"
        >
          <FiRefreshCw size={16} />
        </button>
          <button
          onClick={handleMinimize}
          className="p-2 text-zinc-400 rounded-md hover:bg-black/40 hover:text-white transition-colors no-drag"
          title="Minimizar"
        >
          <FiMinus size={18} />
        </button>
        <button
          onClick={handleMaximizeToggle}
          className="p-2 text-zinc-400 rounded-md hover:bg-black/40 hover:text-white transition-colors no-drag"
          title={isMaximized ? 'Restaurar' : 'Maximizar'}
        >
          {isMaximized ? <FiMinimize2 size={16} /> : <FiMaximize2 size={16} />}
        </button>
      
        <button
          onClick={handleCloseApp}
          className="p-2 text-zinc-400 rounded-md hover:bg-red-500/30 hover:text-red-500 transition-colors no-drag"
          title="Guardar y Cerrar"
        >
          <FiPower size={18} />
        </button>
      </div>
    </header>
  );
};

export default Header;
