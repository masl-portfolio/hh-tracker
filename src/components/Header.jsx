import React, { useContext } from 'react';
import { FiFolder, FiPower } from 'react-icons/fi';
import AppContext from '../context/AppContext';

const Header = () => {
  const { activeTask, pauseTask } = useContext(AppContext);

  const handleOpenProyectos = () => {
    window.electron?.openProyectos();
  };

  const handleCloseApp = () => {
    if (activeTask) {
      // Pausa la tarea actual antes de cerrar para guardar el progreso.
      pauseTask();
    }
    // Damos un pequeño margen para que el estado se actualice en localStorage.
    setTimeout(() => {
      window.electron?.closeApp();
    }, 150);
  };

  return (
    <header className="w-full p-4 flex justify-between items-center drag-area select-none">
      {/* Lado izquierdo: Logo o Título */}
      <div className="flex items-center gap-2">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L2 7V17L12 22L22 17V7L12 2Z" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 7L12 12" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 22V12" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M22 7L12 12" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M17 4.5L7 9.5" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <h1 className="text-lg font-bold text-white">HH Tracker</h1>
      </div>

      {/* Lado derecho: Controles de la aplicación */}
      <div className="flex items-center gap-4 no-drag">
        <button
          onClick={handleOpenProyectos}
          className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-zinc-300 bg-black/20 rounded-md hover:bg-black/40 hover:text-white transition-colors"
          title="Ver todos los proyectos"
        >
          <FiFolder size={16} />
          <span>Proyectos</span>
        </button>
        <button
          onClick={handleCloseApp}
          className="p-2 text-zinc-400 rounded-md hover:bg-red-500/20 hover:text-red-500 transition-colors"
          title="Guardar y Cerrar"
        >
          <FiPower size={18} />
        </button>
      </div>
    </header>
  );
};

export default Header;