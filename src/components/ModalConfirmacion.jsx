import React, { useEffect } from 'react';
import { FiAlertTriangle, FiCheck, FiX } from 'react-icons/fi';

const ModalConfirmacion = ({
  isOpen,
  titulo = "Confirmar Acción",
  mensaje,
  onConfirm,
  onCancel,
  textoConfirmar = "Confirmar",
  textoCancelar = "Cancelar"
}) => {
  // Efecto para escuchar la tecla 'Escape' y cerrar el modal
  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === 'Escape') {
        onCancel();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleEsc);
    }
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen, onCancel]);

  if (!isOpen) {
    return null;
  }

  return (
    // Contenedor principal que oscurece el fondo
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in-fast"
      onClick={onCancel} // Cierra el modal si se hace clic en el fondo
    >
      {/* Contenedor del modal, evita que el clic se propague al fondo */}
      <div 
        className="bg-zinc-800 border border-zinc-700 rounded-xl shadow-2xl w-full max-w-md m-4 p-6 flex flex-col items-center text-center animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Icono */}
        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-4 border-2 border-red-500/30">
          <FiAlertTriangle className="text-red-500" size={32} />
        </div>
        
        {/* Título */}
        <h2 className="text-xl font-bold text-white mb-2">
          {titulo}
        </h2>
        
        {/* Mensaje */}
        <p className="text-zinc-400 text-sm mb-6">
          {mensaje}
        </p>
        
        {/* Botones de acción */}
        <div className="flex gap-4 w-full">
          <button 
            onClick={onCancel}
            className="flex-1 px-4 py-2 bg-zinc-700 text-white rounded-lg hover:bg-zinc-600 font-medium transition-colors"
          >
            <div className="flex items-center justify-center gap-2">
              <FiX />
              <span>{textoCancelar}</span>
            </div>
          </button>
          <button 
            onClick={onConfirm}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors"
          >
             <div className="flex items-center justify-center gap-2">
              <FiCheck />
              <span>{textoConfirmar}</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalConfirmacion;