import React, { useState, useContext } from 'react';
import { FiPlus } from 'react-icons/fi';
import AppContext from '../context/AppContext';

const AddEventForm = ({ projectId, taskId, onEventAdded }) => {
  const { addEvent } = useContext(AppContext);

  // Estados locales para los campos del formulario
  const [title, setTitle] = useState('');
  const [details, setDetails] = useState('');
  const [type, setType] = useState('nota'); // Por defecto, una nota

  const handleAddEvent = () => {
    if (!title.trim()) {
      alert('El título del evento no puede estar vacío.');
      return;
    }

    const eventData = {
      title: title.trim(),
      details: details.trim(),
      type,
      // Vinculación contextual, si se proporcionan los IDs
      projectId: projectId || null,
      taskId: taskId || null,
    };

    addEvent(eventData);

    // Limpiar el formulario después de añadir
    setTitle('');
    setDetails('');
    setType('nota');

    // Opcional: Ejecutar una función callback si se proporciona
    if (onEventAdded) {
      onEventAdded();
    }
  };

  return (
    <div className="p-3 bg-zinc-800/50 rounded-lg border border-zinc-700 space-y-3">
      <h4 className="text-sm font-semibold text-white">Añadir a la Bitácora</h4>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <input
          type="text"
          className="sm:col-span-2 w-full bg-zinc-700 border border-zinc-600 rounded-md px-3 py-1.5 text-sm text-white placeholder-zinc-400"
          placeholder="Título del evento o pendiente..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <select
          className="w-full bg-zinc-700 border border-zinc-600 rounded-md px-3 py-1.5 text-sm text-white"
          value={type}
          onChange={(e) => setType(e.target.value)}
        >
          <option value="nota">Nota</option>
          <option value="pendiente">Pendiente</option>
          <option value="decision">Decisión</option>
          <option value="acuerdo">Acuerdo</option>
          <option value="hito">Hito</option>
        </select>
      </div>
      <textarea
        className="w-full bg-zinc-700 border border-zinc-600 rounded-md px-3 py-1.5 text-sm text-white placeholder-zinc-400"
        rows="2"
        placeholder="Detalles adicionales (opcional)..."
        value={details}
        onChange={(e) => setDetails(e.target.value)}
      />
      <button
        onClick={handleAddEvent}
        disabled={!title.trim()}
        className="w-full flex justify-center items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md font-medium text-sm hover:bg-blue-700 disabled:opacity-50"
      >
        <FiPlus />
        Añadir Evento
      </button>
    </div>
  );
};

export default AddEventForm;