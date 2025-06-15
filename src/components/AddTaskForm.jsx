// src/components/AddTaskForm.jsx (COMPLETO Y FINAL)

import React, { useState, useContext, forwardRef } from 'react';
import { FiPlus, FiCalendar, FiClock } from 'react-icons/fi';
import AppContext from '../context/AppContext';

// Importaciones para el nuevo selector de fechas
import DatePicker, { registerLocale } from 'react-datepicker';
import { es } from 'date-fns/locale';
import "react-datepicker/dist/react-datepicker.css";

// Registramos el idioma español para el calendario
registerLocale('es', es);

const DateShortcutButton = ({ label, onClick, isActive }) => (
  <button
    type="button"
    onClick={onClick}
    className={`px-2.5 py-1 text-xs rounded-full transition-all duration-200 no-drag
      ${isActive 
        ? 'bg-blue-600 text-white font-semibold' 
        : 'bg-zinc-700/60 text-zinc-300 hover:bg-zinc-600'
      }`}
  >
    {label}
  </button>
);

const CustomDateInput = forwardRef(({ value, onClick }, ref) => (
  <button type="button" className="flex items-center gap-2 group" onClick={onClick} ref={ref}>
    <FiCalendar className="text-zinc-400 group-hover:text-white transition-colors" />
    <span className={`text-sm ${value ? 'text-white' : 'text-zinc-400'} group-hover:text-white transition-colors`}>
      {value || 'Fecha'}
    </span>
  </button>
));

const AddTaskForm = ({ projectId, onTaskAdded }) => {
  const { addTask } = useContext(AppContext);
  const [title, setTitle] = useState('');
  const [estimatedHours, setEstimatedHours] = useState('');
  const [fechaFin, setFechaFin] = useState(null);
  const [activeShortcut, setActiveShortcut] = useState(null);

  const handleDateSelect = (date, shortcutLabel) => {
    setFechaFin(date);
    setActiveShortcut(shortcutLabel);
  };

  const setDateFromToday = (daysToAdd, label) => {
    const today = new Date();
    today.setHours(23, 59, 59, 999); // Final del día
    today.setDate(today.getDate() + daysToAdd);
    handleDateSelect(today, label);
  };

  const setDateFromTodayByMonths = (monthsToAdd, label) => {
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    today.setMonth(today.getMonth() + monthsToAdd);
    handleDateSelect(today, label);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    const fechaFinTimestamp = fechaFin ? fechaFin.getTime() : null;
    addTask(projectId, title, estimatedHours, fechaFinTimestamp);
    
    // Resetear formulario
    setTitle('');
    setEstimatedHours('');
    setFechaFin(null);
    setActiveShortcut(null);
    if (onTaskAdded) onTaskAdded();
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <div className="bg-zinc-800 rounded-lg p-3 border border-zinc-700 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-all">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="¿En qué estás trabajando?"
          className="w-full bg-transparent text-base text-white placeholder-zinc-400 focus:outline-none"
        />
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-zinc-700/50">
          <div className="flex items-center gap-4 no-drag">
            
            {/* --- CORRECCIÓN BUG CALENDARIO --- */}
            <DatePicker
              selected={fechaFin}
              onChange={(date) => handleDateSelect(date, null)}
              customInput={<CustomDateInput />}
              dateFormat="dd MMM yyyy"
              locale="es"
              popperPlacement="bottom-start"
              // Esta prop es la solución definitiva. Renderiza el calendario en el body.
              portalId="root-datepicker" 
            />

            <div className="flex items-center gap-2 group">
              <FiClock className="text-zinc-400 group-hover:text-white transition-colors" />
              <input
                type="number"
                step="0.5"
                min="0"
                value={estimatedHours}
                onChange={(e) => setEstimatedHours(e.target.value)}
                placeholder="Horas"
                className="w-16 bg-transparent text-sm text-white text-center placeholder-zinc-400 focus:outline-none focus:text-white"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={!title.trim()}
            className="flex items-center gap-2 px-4 py-1.5 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-500 disabled:bg-zinc-600 disabled:text-zinc-400 transition-colors no-drag"
          >
            <FiPlus />
            Añadir
          </button>
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-2">
        <DateShortcutButton label="Hoy" onClick={() => setDateFromToday(0, 'Hoy')} isActive={activeShortcut === 'Hoy'} />
        <DateShortcutButton label="Mañana" onClick={() => setDateFromToday(1, 'Mañana')} isActive={activeShortcut === 'Mañana'} />
        <DateShortcutButton label="En 1 sem" onClick={() => setDateFromToday(7, 'En 1 sem')} isActive={activeShortcut === 'En 1 sem'} />
        <DateShortcutButton label="En 1 mes" onClick={() => setDateFromTodayByMonths(1, 'En 1 mes')} isActive={activeShortcut === 'En 1 mes'} />
      </div>
    </form>
  );
};

export default AddTaskForm;