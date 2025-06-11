import React, { useState, useContext } from 'react';
import { FiPlus } from 'react-icons/fi';
import AppContext from '../context/AppContext';

// Función de ayuda para obtener una fecha futura en el formato YYYY-MM-DD
const getFutureDateString = (days) => {
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + days);
  return futureDate.toISOString().split('T')[0];
};

const AddTaskForm = ({ projectId }) => {
  const { addTask } = useContext(AppContext);
  
  // Estados locales del formulario
  const [taskTitle, setTaskTitle] = useState('');
  const [taskHours, setTaskHours] = useState('1');
  // Nuevo estado para la fecha de fin estimada, con un valor por defecto
  const [fechaFinEstimada, setFechaFinEstimada] = useState(getFutureDateString(7));

  const handleAddTask = () => {
    if (!taskTitle.trim() || !fechaFinEstimada) {
        alert("Por favor, completa el título y la fecha estimada.");
        return;
    }
    // Se pasa la nueva fecha como cuarto argumento a la función del contexto
    addTask(projectId, taskTitle.trim(), taskHours, fechaFinEstimada);
    
    // Resetear el formulario a sus valores iniciales
    setTaskTitle('');
    setTaskHours('1');
    setFechaFinEstimada(getFutureDateString(7));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
        handleAddTask();
    }
  };

  return (
    <div className="flex flex-wrap gap-2 pt-2 border-t border-zinc-700/50 mt-4">
      {/* Input para el título de la tarea (ocupa toda la primera fila) */}
      <input
        className="w-full bg-zinc-700 border border-zinc-600 rounded-lg px-3 py-1.5 text-sm text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        value={taskTitle}
        onChange={(e) => setTaskTitle(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Añadir una nueva tarea..."
      />
      
      {/* Contenedor para la segunda fila de inputs */}
      <div className="flex w-full gap-2">
        {/* Input para la fecha de fin estimada */}
        <div className="flex-1">
          <label htmlFor={`fecha-estimada-${projectId}`} className="text-xs text-zinc-400">Fecha Fin Estimada</label>
          <input
            id={`fecha-estimada-${projectId}`}
            type="date"
            className="w-full bg-zinc-700 border border-zinc-600 rounded-lg px-2 py-1 text-sm text-white"
            value={fechaFinEstimada}
            onChange={(e) => setFechaFinEstimada(e.target.value)}
          />
        </div>
        
        {/* Input para las horas estimadas */}
        <div className="w-24">
          <label htmlFor={`horas-estimadas-${projectId}`} className="text-xs text-zinc-400">HH Est.</label>
          <input
            id={`horas-estimadas-${projectId}`}
            className="w-full bg-zinc-700 border border-zinc-600 rounded-lg px-2 py-1 text-sm text-white text-center"
            type="number"
            min="0"
            step="0.5"
            value={taskHours}
            onChange={(e) => setTaskHours(e.target.value)}
          />
        </div>
        
        {/* Botón de agregar */}
        <div className="flex items-end">
          <button
            aria-label="Agregar tarea"
            className="bg-blue-600 text-white rounded-lg px-3 py-1.5 h-full hover:bg-blue-700 transition-colors disabled:opacity-50"
            onClick={handleAddTask}
            disabled={!taskTitle.trim()}
          >
            <FiPlus />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddTaskForm;