import React, { useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  FiFolder, FiPower, FiMinus, FiRefreshCw, FiBookOpen, 
  FiClipboard, FiMaximize2, FiMinimize2, FiTarget, FiUser
} from 'react-icons/fi';
// ----- CAMBIO 1: Importar AnimatePresence -----
import { motion, LayoutGroup, AnimatePresence } from 'framer-motion';
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
  const handleCloseApp = () => { if (activeTask) pauseTask(); setTimeout(() => window.electronAPI.closeApp(), 150); };
  const handleViewChange = (view) => navigate(view.path);
  const handleMaximizeToggle = () => { if (isMaximized) { window.electronAPI.restoreWindow(); } else { window.electronAPI.maximizeWindow(); } };

  return (
    // Se mantiene la estructura de 3 columnas para un layout robusto
    <header className="w-full h-14 px-4 flex items-center justify-between drag-area select-none bg-slate-900/60 backdrop-blur-sm border-b border-white/5">
      
      {/* --- Columna Izquierda (Perfil) --- */}
      <div className="w-1/3 flex justify-start no-drag">
        <button 
          onClick={() => navigate('/profiles')}
          className="flex items-center gap-2 p-1.5 pr-3 rounded-lg hover:bg-black/20 transition-colors max-w-full"
          title="Gestionar Perfiles"
        >
          <div className="p-1.5 bg-slate-700 rounded-full flex-shrink-0">
            <FiUser size={16} className="text-slate-300" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">
              {activeProfile?.name || 'Perfil'}
            </p>
          </div>
        </button>
      </div>

      {/* --- Columna Central (Navegación) --- */}
      <div className="w-1/3 flex justify-center no-drag">
        <div className="flex items-center p-1 bg-black/20 rounded-lg space-x-1">
          <LayoutGroup>
            {views.map((view) => {
              const isActive = location.pathname.startsWith(view.path);
              const Icon = view.icon;
              return (
                <motion.button 
                  key={view.id} 
                  onClick={() => handleViewChange(view)} 
                  className="relative flex items-center justify-center h-8 px-3 rounded-md font-medium" 
                  title={view.label}
                >
                  {isActive && (
                    <motion.div 
                      layoutId="active-nav-background" 
                      className="absolute inset-0 bg-slate-700/80 shadow-md rounded-md" 
                      transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                    />
                  )}
                  <div className="relative z-10 flex items-center gap-2">
                    <Icon size={15} className={`transition-colors duration-200 ${isActive ? 'text-sky-400' : 'text-zinc-400 hover:text-white'}`} />
                    
                    {/* ----- CAMBIO 2: Lógica de visibilidad y animación del texto ----- */}
                    <AnimatePresence>
                      {isActive && (
                        <motion.span 
                          initial={{ opacity: 0, width: 0 }}
                          animate={{ opacity: 1, width: 'auto', marginLeft: '0.5rem' }}
                          exit={{ opacity: 0, width: 0, marginLeft: 0 }}
                          transition={{ duration: 0.2, ease: 'easeInOut' }}
                          className="text-sm text-white whitespace-nowrap overflow-hidden"
                        >
                          {view.label}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.button>
              )
            })}
          </LayoutGroup>
        </div>
      </div>

      {/* --- Columna Derecha (Controles de Ventana) --- */}
      <div className="w-1/3 flex justify-end items-center gap-1 no-drag">
        <button onClick={refreshData} className="p-2 text-zinc-400 rounded-md hover:bg-black/40 hover:text-white transition-colors" title="Refrescar datos"><FiRefreshCw size={16} /></button>
        <button onClick={handleMaximizeToggle} className="p-2 text-zinc-400 rounded-md hover:bg-black/40 hover:text-white transition-colors" title={isMaximized ? 'Restaurar' : 'Maximizar'}>{isMaximized ? <FiMinimize2 size={16} /> : <FiMaximize2 size={16} />}</button>
        <button onClick={handleMinimize} className="p-2 text-zinc-400 rounded-md hover:bg-black/40 hover:text-white transition-colors" title="Minimizar"><FiMinus size={18} /></button>
        <button onClick={handleCloseApp} className="p-2 text-zinc-400 rounded-md hover:bg-red-500/30 hover:text-red-500 transition-colors" title="Guardar y Cerrar"><FiPower size={18} /></button>
      </div>
    </header>
  );
};

export default Header;