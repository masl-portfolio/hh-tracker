import React, { useState, useContext, useEffect } from 'react';
import AppContext from '../context/AppContext';
import { FiPlus, FiSave } from 'react-icons/fi';

// ----- CAMBIO 1: Aceptar la nueva prop 'eventToEdit' -----
const AddEventForm = ({ projectId, taskId, onEventAdded, eventToEdit }) => {
  // ----- CAMBIO 2: Obtener 'addEvent' y 'editEvent' del contexto -----
  const { addEvent, editEvent, projects } = useContext(AppContext);
  
  const [title, setTitle] = useState('');
  const [details, setDetails] = useState('');
  const [type, setType] = useState('Nota');
  const [selectedProjectId, setSelectedProjectId] = useState(projectId || '');

  // ----- CAMBIO 3: Usar useEffect para rellenar el formulario en modo edición -----
  useEffect(() => {
    if (eventToEdit) {
      setTitle(eventToEdit.title || '');
      setDetails(eventToEdit.details || '');
      setType(eventToEdit.type || 'Nota');
      // Asegurarse de que el projectId sea un string para el select
      setSelectedProjectId(eventToEdit.projectId ? String(eventToEdit.projectId) : '');
    } else {
      // Resetear el formulario si no estamos editando (modo creación)
      setTitle('');
      setDetails('');
      setType('Nota');
      setSelectedProjectId(projectId || '');
    }
  }, [eventToEdit, projectId]); // Se ejecuta si 'eventToEdit' o el 'projectId' por defecto cambian

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    const eventData = {
      title: title.trim(),
      details: details.trim(),
      type,
      projectId: selectedProjectId ? Number(selectedProjectId) : null,
      // Mantenemos el taskId si se proporciona, importante para eventos vinculados
      taskId: eventToEdit ? eventToEdit.taskId : (taskId || null),
    };

    // ----- CAMBIO 4: Lógica para decidir si editar o añadir -----
    if (eventToEdit) {
      editEvent(eventToEdit.id, eventData);
    } else {
      addEvent(eventData);
    }
    
    // No es necesario resetear el formulario aquí, el useEffect lo maneja al cerrar.
    
    if (onEventAdded) onEventAdded();
  };
  
  const eventTypes = ['Nota', 'Decisión', 'Hito', 'Vencimiento'];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* ----- CAMBIO 5: Título dinámico ----- */}
      <h3 className="text-lg font-semibold text-white mb-2">
        {eventToEdit ? 'Editar Entrada de Bitácora' : 'Nueva Entrada en la Bitácora'}
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Campo de Proyecto (si no se proporciona uno por defecto) */}
        {/* En modo edición, siempre mostramos el selector de proyecto */}
        {(eventToEdit || !projectId) && (
            <select
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="col-span-1 bg-zinc-700 border border-zinc-600 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
            >
                <option value="">Proyecto (General)</option>
                {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
        )}
        {/* Campo de Tipo de Evento */}
        <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className={`col-span-1 bg-zinc-700 border border-zinc-600 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 ${projectId && !eventToEdit ? 'md:col-start-3' : ''}`}
        >
            {eventTypes.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      {/* Campo de Título */}
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Título del evento o pendiente..."
        className="w-full bg-zinc-700 border border-zinc-600 rounded-lg px-4 py-2 text-sm placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      
      {/* Campo de Detalles */}
      <textarea
        rows="3"
        value={details}
        onChange={(e) => setDetails(e.target.value)}
        placeholder="Detalles adicionales (opcional)..."
        className="w-full bg-zinc-700 border border-zinc-600 rounded-lg px-4 py-2 text-sm placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      {/* Botón de Envío */}
      <button
        type="submit"
        disabled={!title.trim()}
        className="w-full flex items-center justify-center gap-2 bg-blue-600 px-5 py-2.5 rounded-lg font-semibold text-white hover:bg-blue-700 disabled:bg-zinc-600 disabled:opacity-70 transition-colors"
      >
        {/* ----- CAMBIO 6: Icono y texto dinámicos ----- */}
        {eventToEdit ? <FiSave /> : <FiPlus />}
        {eventToEdit ? 'Guardar Cambios' : 'Añadir Evento'}
      </button>
    </form>
  );
};

export default AddEventForm;